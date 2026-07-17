import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, BadRequestException, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { VnpayService } from 'src/vnpay/vnpay.service';
import { PaymentStatus } from '@prisma/client';

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

    // Lưu đơn hàng vào Database thông qua OrderService
    const orderResult = await this.orderService.clientCheckout(Number(clientId), clientCheckoutDto);

    if (clientCheckoutDto.paymentMethod === 'TRANSFER') {

      // Lấy địa chỉ IP của Client
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
    console.log("====== [VNPAY IPN] CÓ REQUEST GỌI VỀ ======");
    console.log("👉 Toàn bộ Query nhận được:", JSON.stringify(query, null, 2));

    try {
      // 1. Kiểm tra chữ ký
      const isValidSignature = this.vnpayService.verifyIpn(query);
      // const isValidSignature = true;
      console.log("👉 Kiểm tra chữ ký hợp lệ?:", isValidSignature);
      if (!isValidSignature) {
        console.log("❌ Bị chặn ở: Checksum failed (Sai chữ ký)");
        return { RspCode: '97', Message: 'Checksum failed' };
      }

      const orderId = query['vnp_TxnRef'];
      const vnpAmount = Number(query['vnp_Amount']);
      const responseCode = query['vnp_ResponseCode'];

      // Đảm bảo viết đúng từng chữ Hoa/Thường
      const transactionNo = query['vnp_TransactionNo'];
      const bankCode = query['vnp_BankCode'];

      console.log(`👉 Bóc tách dữ liệu: orderId=${orderId}, vnpAmount=${vnpAmount}, transactionNo=${transactionNo}, bankCode=${bankCode}`);

      // 2. Tìm đơn hàng
      const order = await this.orderService.findOrderById(orderId);
      if (!order) {
        console.log("❌ Bị chặn ở: Không tìm thấy đơn hàng tương ứng mã:", orderId);
        return { RspCode: '01', Message: 'Order not found' };
      }

      console.log(`👉 Đơn hàng gốc trong DB: Tổng tiền=${order.total}, Trạng thái=${order.status}`);

      // 3. Kiểm tra số tiền (Tạm thời log ra để đối chiếu xem khớp không)
      console.log(`👉 So sánh số tiền: Gốc (${order.total * 100}) vs VNPAY (${vnpAmount})`);
      if (order.total * 100 !== vnpAmount) {
        console.log("❌ Bị chặn ở: Số tiền không khớp!");
        return { RspCode: '04', Message: 'Invalid amount' };
      }

      // 4. Cập nhật khi thành công
      if (responseCode === '00') {
        console.log("🚀 Luồng chạy hợp lệ! Bắt đầu gọi hàm updateBillForOrder...");

        const dbResult = await this.orderService.updateBillForOrder(orderId, {
          paymentStatus: 'PAID',
          paymentTransactionNo: transactionNo, // Kiểm tra xem biến này trên log có bị undefined không
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
}