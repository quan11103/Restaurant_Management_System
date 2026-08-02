import { Controller, Get, Post, Body, Patch, Param, UseGuards, BadRequestException, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { VnpayService } from 'src/vnpay/vnpay.service';
import { OrderStatus } from '@prisma/client';
import { InteractionService } from 'src/interaction/interaction.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly vnpayService: VnpayService,
    private readonly interactionService: InteractionService,
  ) { }

  // Luồng dành cho nhân viên: đặt món tại bàn (DINE_IN)
  @Auth(Role.MANAGER, Role.WAITER)
  @Post('dine-in')
  createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(createOrderDto, user.sub);
  }

  // Luồng dành cho khách hàng: thanh toán online / COD (DELIVERY)
  @Post('client-checkout')
  @UseGuards(JwtAuthGuard)
  async clientCheckout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Body() clientCheckoutDto: ClientCheckoutDto,
  ) {
    const clientId = user.sub;

    // Lưu đơn hàng
    const orderResult = await this.orderService.clientCheckout(clientId, clientCheckoutDto);

    if (clientCheckoutDto.paymentMethod === 'TRANSFER') {
      // Lấy địa chỉ IP
      let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      if (ipAddress === '::1') {
        ipAddress = '127.0.0.1';
      }

      // Tạo URL thanh toán VNPAY
      const paymentUrl = this.vnpayService.createPaymentUrl(
        ipAddress.toString(),
        orderResult.orderId.toString(),
        orderResult.totalPay,
        `Thanh toan don hang #${orderResult.orderId}`,
      );

      return {
        success: true,
        orderId: orderResult.orderId,
        order: orderResult,
        paymentUrl: paymentUrl,
      };
    } else if (clientCheckoutDto.paymentMethod === 'CASH') {
      await this.orderService.updateBillForOrder(orderResult.orderId, {
        paymentStatus: 'UNPAID',
      });
    }

    return {
      success: true,
      message: 'Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.',
      data: orderResult
    };
  }

  // Thử lại thanh toán VNPAY cho đơn hàng thất bại/chưa trả tiền
  @Post('retry-checkout')
  @UseGuards(JwtAuthGuard)
  async retryCheckout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Body() body: { orderId: string },
  ) {
    const order = await this.orderService.findOrderById(body.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.clientId !== user.sub) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    if (order.bill?.paymentStatus === 'PAID') {
      throw new BadRequestException(
        'Đơn hàng này đã được thanh toán thành công trước đó.',
      );
    }

    let ipAddress =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    if (ipAddress === '::1') {
      ipAddress = '127.0.0.1';
    }

    const paymentUrl = this.vnpayService.createPaymentUrl(
      ipAddress.toString(),
      order.id.toString(),
      order.total,
      `Thanh toan lai don hang #${order.id}`,
    );

    return {
      success: true,
      paymentUrl,
    };
  }

  // Webhook: Nhận thông báo IPN từ VNPAY
  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any) {
    try {
      const isValidSignature = this.vnpayService.verifyIpn(query);
      if (!isValidSignature) {
        return { RspCode: '97', Message: 'Checksum failed' };
      }

      const orderId = query['vnp_TxnRef'];
      const vnpAmount = Number(query['vnp_Amount']);
      const responseCode = query['vnp_ResponseCode'];
      const transactionNo = query['vnp_TransactionNo'];
      const bankCode = query['vnp_BankCode'];

      const order = await this.orderService.findOrderById(orderId);
      if (!order) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      if (order.total * 100 !== vnpAmount) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      if (responseCode === '00') {
        const dbResult = await this.orderService.updateBillForOrder(orderId, {
          paymentMethod: 'TRANSFER',
          paymentStatus: 'PAID',
          paymentTransactionNo: transactionNo,
          paymentBankCode: bankCode,
        });
        console.log('✅ KẾT QUẢ PRISMA TRẢ VỀ SAU KHI LƯU:', dbResult);
      } else {
        console.log(
          '❌ VNPAY báo giao dịch thất bại, responseCode:',
          responseCode,
        );
        await this.orderService.updateBillForOrder(orderId, {
          paymentStatus: 'FAILED',
          paymentTransactionNo: transactionNo,
          paymentBankCode: bankCode,
        });
      }

      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      console.error('❌ QUÁ TRÌNH XỬ LÝ BỊ CRASH LỖI:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  // Lấy danh sách lịch sử đơn hàng của khách hàng (Có phân trang)
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getClientHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: {
      status?: string;
      search?: string;
      page?: string;
      limit?: string;
    },
  ) {
    const clientId = user.sub;

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    return this.orderService.getClientOrderHistory(clientId, {
      ...query,
      page,
      limit,
    });
  }

  // Lấy toàn bộ đơn hàng hệ thống (Dành cho Admin / Manager / Staff)
  @Auth(Role.MANAGER, Role.WAITER, Role.CASHIER)
  @Get()
  async getAllOrders(
    @Query() query: {
      status?: string;
      orderType?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string
    }
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    return this.orderService.getAllOrders({
      ...query,
      page,
      limit,
    });
  }

  // Lấy chi tiết đơn hàng theo ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const order = await this.orderService.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const currentUserId = user.sub;
    if (
      user.role === Role.CLIENT &&
      order.clientId !== user.sub
    ) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  //Cập nhật trạng thái đơn hàng (Dành cho Admin/Quản lý/Nhân viên)
  @Auth(Role.MANAGER, Role.WAITER, Role.CASHIER)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    if (!status) {
      throw new BadRequestException('Trạng thái (status) không được để trống');
    }
    return this.orderService.updateOrderStatus(id, status);
  }

  //Khách hàng tự hủy đơn hàng của mình (Chỉ hủy được khi status = PENDING)
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrderByClient(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const clientId = user.sub;

    return this.orderService.cancelOrderByClient(clientId, id);
  }

  //Quản lý/Admin hủy đơn hàng
  @Auth(Role.MANAGER)
  @Patch(':id/cancel-manager')
  async cancelOrderByManager(@Param('id') id: string) {
    return this.orderService.cancelOrderByManager(id);
  }
}