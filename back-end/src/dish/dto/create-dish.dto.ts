import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDishDto {
    @IsInt({ message: 'ID nhà hàng phải là số nguyên.' })
    @IsNotEmpty({ message: 'Vui lòng cung cấp ID nhà hàng (restaurantId).' })
    restaurantId: number;

    @IsString({ message: 'Tên món ăn phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Tên món ăn không được để trống.' })
    name: string;

    @IsString({ message: 'Loại món ăn phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Phân loại món (type) không được để trống.' })
    type: string; // VD: "Món chính", "Đồ uống", "Khai vị"

    @IsNumber({}, { message: 'Giá tiền phải là một số.' })
    @Min(0, { message: 'Giá tiền không được âm.' })
    price: number;

    @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
    @IsOptional()
    description?: string;
}