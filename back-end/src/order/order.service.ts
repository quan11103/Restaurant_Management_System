import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto';
import { StaffCheckoutDto } from './dto/staff-checkout.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { InteractionService } from '../interaction/interaction.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly interactionService: InteractionService,
    private readonly notificationService: NotificationService,
  ) { }

  // Đặt món tại quán
  async createOrder(createOrderDto: CreateOrderDto, staffId: number) {
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
              waiterId: staffId,
              orderType: 'DINE_IN',
              status: 'PROCESSING',
              totalQuantity: currentOrderQuantity,
              total: currentOrderTotal,
            },
          });

          targetOrderId = newOrder.id;

          await tx.orderTable.create({
            data: {
              orderId: targetOrderId,
              tableId: tableId,
              isPaid: false,
            },
          });

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

        await this.notificationService.notifyDbChange({});

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

  // Nhân viên thu ngân thanh toán
  async staffCheckout(cashierId: number, dto: StaffCheckoutDto) {
    const { orderId, items, clientId, paymentMethod, promoCode } = dto;

    if (!orderId && (!items || items.length === 0)) {
      throw new BadRequestException('Vui lòng cung cấp ID đơn hàng (orderId) hoặc danh sách món ăn (items)!');
    }

    const isCash = paymentMethod === 'CASH';

    let isExistingOrder = false;
    let subTotal = 0;
    let totalQuantity = 0;
    let orderItemsData = [];

    if (orderId) {
      // LUỒNG 1: Thanh toán đơn đã có (Dine-in / Ăn tại bàn)
      isExistingOrder = true;

      const existingOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { bill: true, orderedDishes: true },
      });

      if (!existingOrder) {
        throw new NotFoundException('Không tìm thấy đơn hàng trên hệ thống!');
      }

      if (existingOrder.bill?.paymentStatus === 'PAID') {
        throw new BadRequestException('Đơn hàng này đã được thanh toán trước đó!');
      }

      existingOrder.orderedDishes.forEach((item) => {
        subTotal += item.price * item.quantity;
      });

    } else if (items && items.length > 0) {
      // LUỒNG 2: Thu ngân lên đơn trực tiếp tại quầy POS
      const dishIds = items.map((item) => item.dishId);
      const dishes = await this.prisma.dish.findMany({
        where: { id: { in: dishIds } },
      });

      if (dishes.length !== dishIds.length) {
        throw new BadRequestException('Một hoặc nhiều món ăn không tồn tại trong hệ thống!');
      }

      const dishMap = new Map(dishes.map((d) => [d.id, d]));

      items.forEach((item) => {
        const dish = dishMap.get(item.dishId);
        subTotal += dish.price * item.quantity;
        totalQuantity += item.quantity;

        orderItemsData.push({
          dishId: item.dishId,
          price: dish.price,
          quantity: item.quantity,
        });
      });
    }

    let discount = 0.0;
    let promotionId: number | null = null;

    if (promoCode) {
      const promotion = await this.prisma.promotion.findUnique({
        where: { code: promoCode },
      });

      if (!promotion) {
        throw new NotFoundException('Mã giảm giá không tồn tại trên hệ thống!');
      }

      const now = new Date();
      if (now < promotion.startDate || now > promotion.endDate) {
        throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng!');
      }

      if (promotion.minOrderValue && subTotal < promotion.minOrderValue) {
        throw new BadRequestException(
          `Đơn hàng chưa đạt giá trị tối thiểu ${promotion.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã!`
        );
      }

      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        throw new BadRequestException('Mã giảm giá này đã hết lượt sử dụng!');
      }

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

    // Transaction cập nhật hoặc tạo mới đơn hàng & hóa đơn
    return await this.prisma.$transaction(async (tx) => {
      let resultOrderId: number;

      const paymentStatus = isCash ? 'PAID' : 'UNPAID';
      const orderStatus = isCash ? 'COMPLETED' : 'PENDING';

      if (isExistingOrder) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            total: finalTotal,
            status: orderStatus,
          },
        });

        await tx.bill.upsert({
          where: { orderId: orderId },
          create: {
            cashierId: cashierId,
            orderId: orderId,
            paymentMethod: paymentMethod,
            discount: discount,
            promotionId: promotionId,
            paymentStatus: paymentStatus,
          },
          update: {
            paymentMethod: paymentMethod,
            discount: discount,
            promotionId: promotionId,
            paymentStatus: paymentStatus,
          },
        });

        // Chỉ cập nhật ORDER_TABLE và giải phóng bàn nếu thanh toán tiền mặt
        // (Nếu Chuyển khoản: Bàn và OrderTable giữ nguyên cho tới khi Webhook/Callback xác nhận)
        if (isCash) {
          await this.releaseTableAndCompleteOrder(tx, orderId);
        }

        resultOrderId = orderId;

      } else {
        const newOrder = await tx.order.create({
          data: {
            clientId: clientId || null,
            totalQuantity: totalQuantity,
            total: finalTotal,
            orderType: 'DINE_IN',
            status: orderStatus,
            orderedDishes: {
              create: orderItemsData,
            },
          },
        });

        await tx.bill.create({
          data: {
            orderId: newOrder.id,
            paymentMethod: paymentMethod,
            discount: discount,
            promotionId: promotionId,
            paymentStatus: paymentStatus,
          },
        });

        resultOrderId = newOrder.id;
      }

      if (promotionId) {
        await tx.promotion.update({
          where: { id: promotionId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      await this.notificationService.notifyDbChange({});

      return {
        orderId: resultOrderId,
        totalPay: finalTotal,
        paymentMethod: paymentMethod,
        isPaid: isCash,
        message: isCash
          ? 'Thanh toán thành công!'
          : 'Đã tạo thông tin thanh toán. Vui lòng chờ khách chuyển khoản!',
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
      where.orderTime = {};
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
      paymentMethod?: string;
      paymentStatus: PaymentStatus;
      paymentTransactionNo?: string | null;
      paymentBankCode?: string | null;
    },
  ) {
    const numericOrderId = Number(orderId);

    return await this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.upsert({
        where: {
          orderId: numericOrderId,
        },
        update: {
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          paymentTransactionNo: data.paymentTransactionNo ?? null,
          paymentBankCode: data.paymentBankCode ?? null,
        },
        create: {
          orderId: numericOrderId,
          paymentMethod: data.paymentMethod ?? 'TRANSFER',
          paymentStatus: data.paymentStatus,
          paymentTransactionNo: data.paymentTransactionNo ?? null,
          paymentBankCode: data.paymentBankCode ?? null,
        },
      });

      const order = await tx.order.findUnique({
        where: { id: numericOrderId },
      });

      if (!order) {
        throw new NotFoundException(`Không tìm thấy đơn hàng #${numericOrderId}`);
      }

      // Phân luồng xử lý theo trạng thái thanh toán
      if (data.paymentStatus === 'PAID') {
        if (order.orderType === 'DINE_IN') {
          // LUỒNG 1: Đơn ăn tại bàn (DINE_IN)
          // -> Đổi trạng thái Order thành COMPLETED & Giải phóng bàn
          await tx.order.update({
            where: { id: numericOrderId },
            data: { status: 'COMPLETED' },
          });

          // Gọi hàm giải phóng bàn
          await this.releaseTableAndCompleteOrder(tx, numericOrderId);
        } else {
          // LUỒNG 2: Đơn giao hàng/mang về (DELIVERY / TAKE_AWAY)
          // -> Đổi trạng thái Order thành PROCESSING (Đang chuẩn bị món)
          await tx.order.update({
            where: { id: numericOrderId },
            data: { status: 'PROCESSING' },
          });
        }

        // Tăng số lượt sử dụng mã giảm giá nếu đơn này có áp dụng voucher
        if (bill.promotionId) {
          await tx.promotion.update({
            where: { id: bill.promotionId },
            data: { usedCount: { increment: 1 } },
          });
        }
      } else if (data.paymentStatus === 'FAILED') {
        // Trường hợp VNPAY báo thanh toán thất bại
        await tx.order.update({
          where: { id: numericOrderId },
          data: { status: 'CANCELLED' },
        });
      }

      return bill;
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

    if (order.bill) {
      // Hoàn lại lượt sử dụng mã giảm giá
      if (order.bill.promotionId) {
        await tx.promotion.update({
          where: { id: order.bill.promotionId },
          data: { usedCount: { decrement: 1 } },
        });
      }

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

  // Hàm phụ trợ: Cập nhật OrderTable và Giải phóng Bàn
  private async releaseTableAndCompleteOrder(tx: any, orderId: number) {
    const orderTables = await tx.orderTable.findMany({
      where: { orderId: orderId },
    });

    if (orderTables.length > 0) {
      // Đánh dấu tất cả OrderTable liên quan đến Order này là đã thanh toán
      await tx.orderTable.updateMany({
        where: { orderId: orderId },
        data: { isPaid: true },
      });

      // Với mỗi bàn liên kết, kiểm tra còn đơn nào chưa thanh toán không
      for (const ot of orderTables) {
        const remainingUnpaidOrder = await tx.orderTable.findFirst({
          where: {
            tableId: ot.tableId,
            isPaid: false,
          },
        });

        // Nếu bàn không còn đơn active nào khác -> chuyển trạng thái bàn về trống
        if (!remainingUnpaidOrder) {
          await tx.table.update({
            where: { id: ot.tableId },
            data: { isOccupied: false },
          });
        }
      }
    }
  }
}