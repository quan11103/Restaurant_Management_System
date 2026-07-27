import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InteractionModule } from 'src/interaction/interaction.module';

@Module({
  imports: [PrismaModule, InteractionModule],
  controllers: [CartItemController],
  providers: [CartItemService],
})
export class CartItemModule { }
