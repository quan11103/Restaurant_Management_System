import { Module } from '@nestjs/common';
import { IngredientSupplierService } from './ingredient-supplier.service';
import { IngredientSupplierController } from './ingredient-supplier.controller';

@Module({
  controllers: [IngredientSupplierController],
  providers: [IngredientSupplierService],
})
export class IngredientSupplierModule {}
