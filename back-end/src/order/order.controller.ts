import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ClientCheckoutDto } from './dto/client-checkout.dto'; // Import DTO mới
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('orders') // Đổi 'order' thành 'orders' (số nhiều) theo chuẩn RESTful API
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  /**
   * 1. Luồng dành cho nhân viên: Đặt món tại bàn (DINE_IN)
   * Endpoint: POST /api/orders/dine-in
   */
  @Post('dine-in')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  /**
   * 2. Luồng dành cho khách hàng: Thanh toán Online (DELIVERY)
   * Endpoint: POST /api/orders/client-checkout
   */
  @Post('client-checkout')
  @UseGuards(JwtAuthGuard)
  clientCheckout(
    @Request() req: any,
    @Body() clientCheckoutDto: ClientCheckoutDto
  ) {
    const clientId = req.user?.sub;
    if (!clientId) {
      throw new BadRequestException('Client ID not found in token');
    }
    return this.orderService.clientCheckout(Number(clientId), clientCheckoutDto);
  }
}