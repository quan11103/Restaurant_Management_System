import { PartialType } from '@nestjs/swagger';
import { CreateIngredientSupplierDto } from './create-ingredient-supplier.dto';

export class UpdateIngredientSupplierDto extends PartialType(CreateIngredientSupplierDto) {}
