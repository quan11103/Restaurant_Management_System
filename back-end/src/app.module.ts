import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service'; // Sửa lại đường dẫn chuẩn của bạn
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TableModule } from './table/table.module';
import { DishModule } from './dish/dish.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { SupplierModule } from './supplier/supplier.module';
import { PromotionModule } from './promotion/promotion.module';
import { OrderModule } from './order/order.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
    imports: [AuthModule, PrismaModule, TableModule, DishModule, IngredientModule, SupplierModule, PromotionModule, OrderModule, CheckoutModule],
    controllers: [],
    providers: [PrismaService],
})
export class AppModule { }