import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

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

    // Lấy giỏ hàng của client (Kèm thông tin giá món ăn)
    const cartItems = await this.prisma.cartItem.findMany({
      where: { clientId },
      include: { dish: true },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Giỏ hàng của bạn đang trống!');
    }

    let subTotal = 0;
    let totalQuantity = 0;

    cartItems.forEach((item) => {
      subTotal += item.dish.price * item.quantity;
      totalQuantity += item.quantity;
    });

    let discount = 0.0;
    let promotionId: number | null = null;

    // Kiểm tra và tính toán mã giảm giá
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
        if (promotion.maxDiscount && discount > promotion.maxDiscount) {
          discount = promotion.maxDiscount;
        }
      } else if (promotion.type === 'FIXED_AMOUNT') {
        discount = promotion.value;
      }

      if (discount > subTotal) {
        discount = subTotal;
      }

      // Lấy ID để lưu vào Bill
      promotionId = promotion.id;
    }

    const finalTotal = subTotal - discount;

    // Tiến hành transaction vào database
    return await this.prisma.$transaction(async (tx) => {

      // Tạo đơn hàng
      const newOrder = await tx.order.create({
        data: {
          clientId: clientId,
          totalQuantity: totalQuantity,
          total: finalTotal,
          orderType: 'DELIVERY',
          shippingAddress: address,
          receiverPhone: phone,
          receiverName: fullName,
          status: 'PENDING',
          orderedDishes: {
            create: cartItems.map((item) => ({
              dishId: item.dishId,
              price: item.dish.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Tạo hóa đơn
      await tx.bill.create({
        data: {
          orderId: newOrder.id,
          paymentMethod: paymentMethod,
          discount: discount,
          promotionId: promotionId,
          paymentStatus: 'UNPAID',
        },
      });

      // Tăng lượt sử dụng mã giảm giá
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

      // Xóa toàn bộ sản phẩm trong giỏ hàng
      await tx.cartItem.deleteMany({
        where: { clientId: clientId },
      });

      return {
        orderId: newOrder.id,
        totalPay: newOrder.total,
        paymentMethod: paymentMethod,
      };
    });
  }

  // Lấy danh sách toàn bộ đơn hàng trên hệ thống (Có phân trang, lọc, tìm kiếm)
  async getAllOrders(query: {
    status?: string;
    orderType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number
  }) {
    const { status, orderType, search, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Lọc theo trạng thái
    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }

    // 2. Lọc theo loại đơn hàng (DINE_IN hoặc DELIVERY)
    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType;
    }

    // 3. Lọc theo khoảng thời gian
    if (startDate || endDate) {
      where.orderTime = {}; // Lưu ý thay 'orderTime' bằng field lưu thời gian tạo đơn thực tế của bạn (vd: createdAt)
      if (startDate) where.orderTime.gte = new Date(startDate);
      if (endDate) where.orderTime.lte = new Date(endDate);
    }

    // 4. Tìm kiếm đa năng (theo ID đơn, tên người nhận, số điện thoại)
    if (search) {
      const searchConditions: any[] = [
        { receiverName: { contains: search, mode: 'insensitive' } },
        { receiverPhone: { contains: search } },
      ];

      // Nếu search là một con số hợp lệ, tìm thêm theo ID đơn hàng
      if (!isNaN(Number(search))) {
        searchConditions.push({ id: Number(search) });
      }

      where.OR = searchConditions;
    }

    // Chạy song song query lấy data và đếm tổng
    const [orders, totalRecords] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          bill: true,
          // Có thể join thêm Client hoặc Table để hiển thị trên Dashboard
          orderTables: { include: { table: true } },
          // client: { select: { fullName: true, phone: true } } 
        },
        orderBy: {
          orderTime: 'desc', // Hoặc createdAt tùy schema của bạn
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      }
    };
  }

  // Tìm kiếm đơn hàng theo ID
  async findOrderById(id: number | string) {
    const order = await this.prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        bill: true,
        orderedDishes: {
          include: {
            dish: true, // Lấy thông tin món ăn (tên, ảnh, v.v.)
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng!');
    }

    return order;
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(id: number | string, status: OrderStatus) {
    return await this.prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });
  }

  async updateBillForOrder(
    orderId: string | number,
    data: {
      paymentMethod?: string,
      paymentStatus: PaymentStatus,
      paymentTransactionNo?: string | null,
      paymentBankCode?: string | null
    }
  ) {
    const numericOrderId = Number(orderId);

    // Sử dụng upsert để xử lí mọi tình huống
    return await this.prisma.bill.upsert({
      where: {
        orderId: numericOrderId
      },
      // Nếu tồn tại Bill: Chỉ cập nhật các trường liên quan đến thanh toán
      update: {
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        paymentTransactionNo: data.paymentTransactionNo ?? null,
        paymentBankCode: data.paymentBankCode ?? null,
      },
      // Nếu chưa có Bill: Tạo mới luôn hóa đơn này
      create: {
        orderId: numericOrderId,
        paymentStatus: data.paymentStatus,
        paymentTransactionNo: data.paymentTransactionNo ?? null,
        paymentBankCode: data.paymentBankCode ?? null,
        paymentMethod: 'TRANSFER',
      },
    });
  }

  // Lấy lịch sử mua hàng của Client (Có phân trang, lọc, tìm kiếm)
  async getClientOrderHistory(
    clientId: number,
    query: { status?: string; search?: string; page?: number; limit?: number }
  ) {
    const { status, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      clientId: clientId,
    };

    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }

    if (search) {
      const searchLike = `%${search}%`;

      // Chỉ dùng SQL thuần để lấy danh sách ID khớp điều kiện
      const matchedOrders: { id: number }[] = await this.prisma.$queryRaw`
        SELECT id FROM "Order" 
        WHERE "clientId" = ${clientId} AND CAST(id AS TEXT) LIKE ${searchLike}
      `;

      // Chuyển mảng object [{id: 7}, {id: 70}] thành mảng số [7, 70]
      const matchedIds = matchedOrders.map(order => order.id);

      // Đưa vào điều kiện "in" của Prisma
      // Nếu gõ chữ "abc" -> matchedIds = [] -> Prisma tự hiểu và trả về danh sách rỗng (Quá chuẩn!)
      where.id = { in: matchedIds };
    }

    // Chạy song song 2 query: Lấy data và Đếm tổng số lượng (để chia trang)
    const [orders, totalRecords] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          bill: true,
        },
        orderBy: {
          orderTime: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
      }
    };
  }

  // ==========================================
  // HỦY ĐƠN HÀNG
  // ==========================================

  /**
   * 1. Dành cho Khách hàng (Client)
   * Khách hàng thường chỉ được phép hủy khi đơn hàng mới được tạo (PENDING)
   */
  async cancelOrderByClient(clientId: number, orderId: number | string) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: Number(orderId), clientId: clientId },
        include: { bill: true, orderTables: true },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng của bạn!');
      }

      if (order.status !== 'PENDING') {
        throw new BadRequestException('Bạn chỉ có thể hủy khi đơn hàng đang chờ xác nhận!');
      }

      return await this.processOrderCancellation(tx, order);
    });
  }

  /**
   * 2. Dành cho Quản lý (Manager)
   * Quản lý có quyền hủy ở nhiều giai đoạn hơn, ngoại trừ đơn đã hoàn thành hoặc đã hủy.
   */
  async cancelOrderByManager(orderId: number | string) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: Number(orderId) },
        include: { bill: true, orderTables: true },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng!');
      }

      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        throw new BadRequestException(`Không thể hủy đơn hàng đang ở trạng thái ${order.status}!`);
      }

      return await this.processOrderCancellation(tx, order);
    });
  }

  /**
   * Hàm helper dùng chung: Xử lý logic side-effects khi hủy đơn
   */
  private async processOrderCancellation(tx: any, order: any) {
    // 1. Chuyển trạng thái đơn hàng thành CANCELLED
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    // 2. Giải phóng bàn nếu là đơn tại quán (DINE_IN)
    if (order.orderType === 'DINE_IN' && order.orderTables && order.orderTables.length > 0) {
      const tableIds = order.orderTables.map((ot: any) => ot.tableId);
      await tx.table.updateMany({
        where: { id: { in: tableIds } },
        data: { isOccupied: false },
      });
    }

    // 3. Xử lý Hóa đơn (Bill)
    if (order.bill) {
      // Hoàn lại lượt sử dụng mã giảm giá (nếu có)
      if (order.bill.promotionId) {
        await tx.promotion.update({
          where: { id: order.bill.promotionId },
          data: { usedCount: { decrement: 1 } },
        });
      }

      // Đổi trạng thái thanh toán
      // Nếu đã thanh toán (PAID) -> Cần hoàn tiền (REFUNDED)
      // Nếu chưa (UNPAID/PENDING) -> Thất bại (FAILED)
      const newPaymentStatus = order.bill.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED';

      await tx.bill.update({
        where: { id: order.bill.id },
        data: { paymentStatus: newPaymentStatus },
      });
    }

    return {
      status: 'success',
      message: 'Hủy đơn hàng thành công!',
      orderId: order.id,
    };
  }
}