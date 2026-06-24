import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIngredientSupplierDto {
    @IsNotEmpty()
    @IsInt()
    ingredientId: number;

    @IsNotEmpty()
    @IsInt()
    supplierId: number;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    description?: string;
}