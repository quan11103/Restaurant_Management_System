import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateCartItemDto {
    @IsNotEmpty({ message: 'Vui lòng cung cấp số lượng cần cập nhật' })
    @IsInt({ message: 'quantity phải là một số nguyên' })
    @Min(1, { message: 'Số lượng món ăn ít nhất phải là 1' })
    quantity: number;
}