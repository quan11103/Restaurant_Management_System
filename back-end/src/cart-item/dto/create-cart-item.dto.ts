import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateCartItemDto {
    @IsNotEmpty({ message: 'dishId không được để trống' })
    @IsInt({ message: 'dishId phải là một số nguyên' })
    dishId: number;

    @IsOptional()
    @IsInt({ message: 'quantity phải là một số nguyên' })
    @Min(1, { message: 'Số lượng món ăn ít nhất phải là 1' })
    quantity?: number;
}