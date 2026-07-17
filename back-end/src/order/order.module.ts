import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { VnpayService } from 'src/vnpay/vnpay.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, VnpayService],
})
export class OrderModule { }
