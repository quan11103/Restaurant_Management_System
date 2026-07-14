import { IsInt, IsNotEmpty, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

// DTO phụ để validate từng món ăn trong mảng items
export class OrderItemDto {
    @IsInt({ message: 'ID món ăn (dishId) phải là một số nguyên' })
    @IsNotEmpty({ message: 'ID món ăn không được để trống' })
    dishId: number;

    @IsInt({ message: 'Số lượng (quantity) phải là một số nguyên' })
    @Min(1, { message: 'Số lượng món ăn phải lớn hơn hoặc bằng 1' })
    quantity: number;
}

// DTO chính dùng trong Controller
export class CreateOrderDto {
    @IsInt({ message: 'ID nhân viên phục vụ (waiterId) phải là một số nguyên' })
    @IsNotEmpty({ message: 'ID nhân viên phục vụ không được để trống' })
    waiterId: number;

    @IsInt({ message: 'ID bàn (tableId) phải là một số nguyên' })
    @IsNotEmpty({ message: 'ID bàn không được để trống' })
    tableId: number;

    @IsArray({ message: 'Danh sách món ăn (items) phải là một mảng' })
    @ValidateNested({ each: true, message: 'Dữ liệu từng món ăn trong mảng không hợp lệ' })
    @Type(() => OrderItemDto) // Yêu cầu class-transformer chuyển đổi object thuần thành instance của OrderItemDto
    items: OrderItemDto[];
}