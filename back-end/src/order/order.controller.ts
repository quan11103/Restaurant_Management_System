import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, BadRequestException, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { VnpayService } from 'src/vnpay/vnpay.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly vnpayService: VnpayService,
  ) { }

  // Luồng dành cho nhân viên: đặt món tại bàn (DINE_IN)
  @Post('dine-in')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  // Luồng dành cho khách hàng: thanh toán online (DELIVERY)
  @Post('client-checkout')
  @UseGuards(JwtAuthGuard)
  async clientCheckout(
    @Request() req: any,
    @Body() clientCheckoutDto: ClientCheckoutDto
  ) {
    const clientId = req.user?.sub;
    if (!clientId) {
      throw new BadRequestException('Client ID not found in token');
    }

    // Lưu đơn hàng
    const orderResult = await this.orderService.clientCheckout(Number(clientId), clientCheckoutDto);

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

  // Nhận thông báo IPN từ VNPAY
  @Get('vnpay-ipn')
  async vnpayIpn(@Query() query: any) {
    try {
      // Kiểm tra chữ ký
      const isValidSignature = this.vnpayService.verifyIpn(query);
      if (!isValidSignature) {
        return { RspCode: '97', Message: 'Checksum failed' };
      }

      const orderId = query['vnp_TxnRef'];
      const vnpAmount = Number(query['vnp_Amount']);
      const responseCode = query['vnp_ResponseCode'];
      const transactionNo = query['vnp_TransactionNo'];
      const bankCode = query['vnp_BankCode'];

      // Tìm đơn hàng
      const order = await this.orderService.findOrderById(orderId);
      if (!order) {
        return { RspCode: '01', Message: 'Order not found' };
      }

      // Kiểm tra số tiền
      if (order.total * 100 !== vnpAmount) {
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      // Cập nhật khi thành công
      if (responseCode === '00') {
        const dbResult = await this.orderService.updateBillForOrder(orderId, {
          paymentMethod: 'TRANSFER',
          paymentStatus: 'PAID',
          paymentTransactionNo: transactionNo,
          paymentBankCode: bankCode
        });

        console.log("✅ KẾT QUẢ PRISMA TRẢ VỀ SAU KHI LƯU:", dbResult);
      } else {
        console.log("❌ VNPAY báo giao dịch thất bại hoặc người dùng hủy, responseCode:", responseCode);
        await this.orderService.updateBillForOrder(orderId, {
          paymentStatus: 'FAILED',
          paymentTransactionNo: transactionNo,
          paymentBankCode: bankCode
        });
      }

      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      console.error('❌ QUÁ TRÌNH XỬ LÝ BỊ CRASH LỖI:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  // ----------------------------------------------------------------------
  // API MỚI: Lấy danh sách lịch sử đơn hàng của khách hàng (Có phân trang)
  // Bắt buộc phải đặt TRƯỚC @Get(':id')
  // ----------------------------------------------------------------------
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getClientHistory(
    @Request() req: any,
    @Query() query: { status?: string; search?: string; page?: string; limit?: string }
  ) {
    const clientId = req.user?.sub;
    if (!clientId) {
      throw new BadRequestException('Không tìm thấy thông tin khách hàng trong token');
    }

    // Chuyển đổi page, limit từ string sang number để service xử lý
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;

    return this.orderService.getClientOrderHistory(Number(clientId), {
      ...query,
      page,
      limit,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Param('id') id: string, @Request() req: any) {
    const order = await this.orderService.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const currentUserId = req.user?.sub;
    if (order.clientId !== Number(currentUserId)) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  @Post('retry-checkout')
  @UseGuards(JwtAuthGuard)
  async retryCheckout(@Request() req: any, @Body() body: { orderId: string }) {
    // Tìm đơn hàng kèm thông tin Bill
    const order = await this.orderService.findOrderById(body.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Kiểm tra quyền sở hữu đơn hàng
    const currentUserId = req.user?.sub;
    if (order.clientId !== Number(currentUserId)) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    if (order.bill?.paymentStatus === 'PAID') {
      throw new BadRequestException('Đơn hàng này đã được thanh toán thành công trước đó.');
    }

    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (ipAddress === '::1') {
      ipAddress = '127.0.0.1';
    }

    const finalAmount = order.total;

    // Tạo lại URL thanh toán VNPAY mới
    const paymentUrl = this.vnpayService.createPaymentUrl(
      ipAddress.toString(),
      order.id.toString(),
      finalAmount,
      `Thanh toan lai don hang #${order.id}`,
    );

    return {
      success: true,
      paymentUrl
    };
  }
}