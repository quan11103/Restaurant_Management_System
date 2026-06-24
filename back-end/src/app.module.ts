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
import { IngredientSupplierModule } from './ingredient-supplier/ingredient-supplier.module';
import { GoodsBillModule } from './goods-bill/goods-bill.module';

@Module({
    imports: [AuthModule, PrismaModule, TableModule, DishModule, IngredientModule, SupplierModule, PromotionModule, OrderModule, CheckoutModule, IngredientSupplierModule, GoodsBillModule],
    controllers: [],
    providers: [PrismaService],
})
export class AppModule { }