import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { InteractionService } from '../interaction/interaction.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly interactionService: InteractionService,
  ) { }

  // Đặt món tại quán
  async createOrder(createOrderDto: CreateOrderDto, staffId: number) {
    // Bỏ waiterId ra khỏi DTO, lấy trực tiếp staffId từ JWT
    const { tableId, items } = createOrderDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const dishIds = items.map(i => i.dishId);
        const dbDishes = await tx.dish.findMany({
          where: { id: { in: dishIds }, isAvailable: true }
        });

        if (dbDishes.length !== items.length) {
          throw new BadRequestException('Có món ăn không tồn tại hoặc đã ngừng bán!');
        }

        let currentOrderQuantity = 0;
        let currentOrderTotal = 0;

        const orderedDishesData = items.map(item => {
          const dish = dbDishes.find(d => d.id === item.dishId);
          const subTotal = dish.price * item.quantity;
          currentOrderQuantity += item.quantity;
          currentOrderTotal += subTotal;

          return {
            dishId: item.dishId,
            price: dish.price,
            quantity: item.quantity,
          };
        });

        // Kiểm tra xem bàn này đã có khách (đang mở Order) chưa?
        const table = await tx.table.findUnique({ where: { id: tableId } });
        if (!table) throw new NotFoundException('Không tìm thấy bàn!');

        let targetOrderId: number;

        if (table.isOccupied) {
          // Bàn đang có khách -> Tìm Order
          const activeOrderTable = await tx.orderTable.findFirst({
            where: { tableId: tableId, isPaid: false },
            include: { order: true }
          });

          if (!activeOrderTable) {
            throw new InternalServerErrorException('Bàn có trạng thái có khách nhưng không tìm thấy đơn hàng tương ứng!');
          }

          targetOrderId = activeOrderTable.orderId;

          // Cập nhật lại tổng tiền và tổng số lượng của Order cũ
          await tx.order.update({
            where: { id: targetOrderId },
            data: {
              totalQuantity: activeOrderTable.order.totalQuantity + currentOrderQuantity,
              total: activeOrderTable.order.total + currentOrderTotal,
            }
          });

        } else {
          // Bàn trống -> Tạo Order mới với ID nhân viên lấy từ Token (staffId)
          const newOrder = await tx.order.create({
            data: {
              waiterId: staffId, // <--- Ghi nhận ID nhân viên tạo đơn tại đây
              orderType: 'DINE_IN',
              status: 'PROCESSING',
              totalQuantity: currentOrderQuantity,
              total: currentOrderTotal,
            },
          });

          targetOrderId = newOrder.id;

          // Liên kết Order với Table
          await tx.orderTable.create({
            data: {
              orderId: targetOrderId,
              tableId: tableId,
              isPaid: false,
            },
          });

          // Cập nhật trạng thái bàn thành "Có khách"
          await tx.table.update({
            where: { id: tableId },
            data: { isOccupied: true }
          });

          // Tạo Bill tạm thời
          await tx.bill.create({
            data: {
              orderId: targetOrderId,
              paymentMethod: 'CASH', // Mặc định tiền mặt
              paymentStatus: 'UNPAID',
              discount: 0,
            }
          });
        }

        // Thêm các món ăn vào Order (Dùng chung cho cả tạo mới và gọi thêm)
        await tx.orderedDish.createMany({
          data: orderedDishesData.map(d => ({ ...d, orderId: targetOrderId })),
        });

        return {
          status: 'success',
          message: table.isOccupied ? 'Gọi thêm món thành công' : 'Tạo đơn hàng tại bàn thành công',
          orderId: targetOrderId,
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi xử lý đơn hàng tại bàn!');
    }
  }

  // Thanh toán online / Giao hàng
  async clientCheckout(clientId: number, dto: ClientCheckoutDto) {
    const { fullName, phone, address, paymentMethod, promoCode } = dto;
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

      for (const item of cartItems) {
        await this.interactionService.increaseOrderedQuantity(
          clientId,
          item.dishId,
          item.quantity,
        );

        await this.interactionService.syncCartQuantity(
          clientId,
          item.dishId,
          0
        );
      }

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

    if (status && status !== 'ALL') {
      where.status = status as OrderStatus;
    }

    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType;
    }

    if (startDate || endDate) {
      where.orderTime = {}; // Lưu ý thay 'orderTime' bằng field lưu thời gian tạo đơn thực tế của bạn (vd: createdAt)
      if (startDate) where.orderTime.gte = new Date(startDate);
      if (endDate) where.orderTime.lte = new Date(endDate);
    }

    // Tìm kiếm đa năng (theo ID đơn, tên người nhận, số điện thoại)
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

  // Tìm kiếm đơn hàng theo ID
  async findOrderById(id: number | string) {
    const order = await this.prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        bill: true,
        orderedDishes: {
          include: {
            dish: true,
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

  // Hủy đơn hàng (dành cho khách hàng)
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

  // Hủy đơn hàng (dành cho quản lý)
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

  // Hàm helper dùng chung: Xử lý logic side-effects khi hủy đơn
  private async processOrderCancellation(tx: any, order: any) {
    // Chuyển trạng thái đơn hàng thành CANCELLED
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    // Giải phóng bàn nếu là đơn tại quán (DINE_IN)
    if (order.orderType === 'DINE_IN' && order.orderTables && order.orderTables.length > 0) {
      const tableIds = order.orderTables.map((ot: any) => ot.tableId);
      await tx.table.updateMany({
        where: { id: { in: tableIds } },
        data: { isOccupied: false },
      });
    }

    // Xử lý Hóa đơn
    if (order.bill) {
      // Hoàn lại lượt sử dụng mã giảm giá
      if (order.bill.promotionId) {
        await tx.promotion.update({
          where: { id: order.bill.promotionId },
          data: { usedCount: { decrement: 1 } },
        });
      }

      // Đổi trạng thái thanh toán
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