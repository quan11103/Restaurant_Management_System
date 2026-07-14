import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto'; // Bạn cần tạo DTO này cho luồng online

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }

  // Đặt món tại quán
  async createOrder(createOrderDto: CreateOrderDto) {
    const { waiterId, tableId, items } = createOrderDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const dishIds = items.map(i => i.dishId);
        const dbDishes = await tx.dish.findMany({
          where: { id: { in: dishIds }, isAvailable: true }
        });

        if (dbDishes.length !== items.length) {
          throw new BadRequestException('Có món ăn không tồn tại hoặc đã ngừng bán!');
        }

        let totalQuantity = 0;
        let totalAmount = 0;
        const orderedDishesData = items.map(item => {
          const dish = dbDishes.find(d => d.id === item.dishId);
          const subTotal = dish.price * item.quantity;
          totalQuantity += item.quantity;
          totalAmount += subTotal;

          return {
            dishId: item.dishId,
            price: dish.price,
            quantity: item.quantity,
            subTotal: subTotal,
          };
        });

        // Tạo đơn hàng mới
        const newOrder = await tx.order.create({
          data: {
            waiterId: waiterId,
            orderType: 'DINE_IN',
            status: 'PENDING',
            totalQuantity: totalQuantity,
            total: totalAmount,
          },
        });

        // Liên kết bàn ăn và cập nhật trạng thái bàn thành "Đang có khách"
        await tx.orderTable.create({
          data: {
            orderId: newOrder.id,
            tableId: tableId,
            isPaid: false,
          },
        });

        await tx.table.update({
          where: { id: tableId },
          data: { isOccupied: true }
        });

        // Lưu danh sách món ăn chi tiết
        await tx.orderedDish.createMany({
          data: orderedDishesData.map(d => ({ ...d, orderId: newOrder.id })),
        });

        return {
          status: 'success',
          message: 'Tạo đơn hàng tại bàn thành công',
          orderId: newOrder.id,
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Có lỗi xảy ra khi tạo đơn hàng!');
    }
  }

  // Thanh toán online / Giao hàng
  async clientCheckout(clientId: number, dto: ClientCheckoutDto) {
    const { fullName, phone, address, paymentMethod, promoCode } = dto;

    // 1. LẤY GIỎ HÀNG CỦA CLIENT (Kèm thông tin giá món ăn)
    const cartItems = await this.prisma.cartItem.findMany({
      where: { clientId },
      include: { dish: true },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Giỏ hàng của bạn đang trống!');
    }

    // 2. TÍNH TỔNG SỐ LƯỢNG VÀ TIỀN GỐC (TẠM TÍNH)
    let subTotal = 0;
    let totalQuantity = 0;

    cartItems.forEach((item) => {
      subTotal += item.dish.price * item.quantity;
      totalQuantity += item.quantity;
    });

    let discount = 0.0;
    let promotionId: number | null = null;

    // 3. KIỂM TRA VÀ TÍNH TOÁN MÃ GIẢM GIÁ (PROMOTION)
    if (promoCode) {
      const promotion = await this.prisma.promotion.findUnique({
        where: { code: promoCode },
      });

      if (!promotion) {
        throw new NotFoundException('Mã giảm giá không tồn tại trên hệ thống!');
      }

      // Kiểm tra thời hạn sử dụng mã
      const now = new Date();
      if (now < promotion.startDate || now > promotion.endDate) {
        throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng!');
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (promotion.minOrderValue && subTotal < promotion.minOrderValue) {
        throw new BadRequestException(
          `Đơn hàng chưa đạt giá trị tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã!`
        );
      }

      // Kiểm tra giới hạn lượt dùng của mã
      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        throw new BadRequestException('Mã giảm giá này đã hết lượt sử dụng!');
      }

      // Tính toán số tiền được giảm
      if (promotion.type === 'PERCENTAGE') {
        discount = (subTotal * promotion.value) / 100;
        // Chặn nếu vượt quá số tiền giảm tối đa cho phép
        if (promotion.maxDiscount && discount > promotion.maxDiscount) {
          discount = promotion.maxDiscount;
        }
      } else if (promotion.type === 'FIXED_AMOUNT') {
        discount = promotion.value;
      }

      // Đảm bảo số tiền giảm không vượt quá tổng giá trị đơn hàng
      if (discount > subTotal) {
        discount = subTotal;
      }

      // Lấy được ID để lát lưu vào Bill
      promotionId = promotion.id;
    }

    // Tiền cuối cùng khách phải trả
    const finalTotal = subTotal - discount;

    // 4. TIẾN HÀNH TRANSACTION VÀO DATABASE
    return await this.prisma.$transaction(async (tx) => {

      // Bước 4.1: Tạo đơn hàng (Order)
      const newOrder = await tx.order.create({
        data: {
          clientId: clientId,
          totalQuantity: totalQuantity,
          total: finalTotal,             // Lưu số tiền cuối cùng khách phải trả
          orderType: 'DELIVERY',         // Mặc định Khách đặt qua Web là Delivery
          shippingAddress: address,       // Map đúng các cột trong DB của bạn
          receiverPhone: phone,
          receiverName: fullName,
          status: 'PENDING',
          // Tạo hàng loạt các món ăn trong đơn hàng thông qua lớp liên kết
          orderedDishes: {
            create: cartItems.map((item) => ({
              dishId: item.dishId,
              price: item.dish.price,
              quantity: item.quantity,
              subTotal: item.dish.price * item.quantity, // Thành tiền từng món
            })),
          },
        },
      });

      // Bước 4.2: Tạo hóa đơn (Bill) - Quan hệ 1-1 kết nối qua orderId
      await tx.bill.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: paymentMethod,
          discount: discount,            // Số tiền được giảm được cập nhật chính xác tại đây
          total: finalTotal,             // Giá sau giảm lưu vào đây
          promotionId: promotionId,      // Khóa ngoại ID của Promotion đã được xử lý thành công!
        },
      });

      // Bước 4.3: Tăng lượt sử dụng mã giảm giá (Nếu có áp mã)
      if (promotionId) {
        await tx.promotion.update({
          where: { id: promotionId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // Bước 4.4: Xóa toàn bộ sản phẩm trong giỏ hàng (CartItem) của Client sau khi đặt xong
      await tx.cartItem.deleteMany({
        where: { clientId: clientId },
      });

      return {
        success: true,
        message: 'Đặt hàng và tạo hóa đơn thành công!',
        data: {
          orderId: newOrder.id,
          totalPay: finalTotal,
        },
      };
    });
  }
}