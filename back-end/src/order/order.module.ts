import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { VnpayService } from 'src/vnpay/vnpay.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InteractionModule } from 'src/interaction/interaction.module';

@Module({
  imports: [PrismaModule, InteractionModule],
  controllers: [OrderController],
  providers: [OrderService, VnpayService],
})
export class OrderModule { }
