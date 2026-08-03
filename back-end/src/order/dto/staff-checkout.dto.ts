import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StaffOrderItemDto {
    @IsNotEmpty({ message: 'ID món ăn không được để trống' })
    @IsNumber({}, { message: 'ID món ăn phải là số' })
    dishId: number;

    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    @IsNumber({}, { message: 'Số lượng phải là số' })
    quantity: number;
}

export class StaffCheckoutDto {
    // Trường hợp 1: Thanh toán đơn hàng đã tạo sẵn tại bàn
    @IsOptional()
    @IsNumber({}, { message: 'ID đơn hàng phải là số' })
    orderId?: number;

    // Trường hợp 2: Thu ngân lên đơn trực tiếp tại quầy POS
    @IsOptional()
    @IsArray({ message: 'Danh sách món ăn phải là mảng' })
    @ValidateNested({ each: true })
    @Type(() => StaffOrderItemDto)
    items?: StaffOrderItemDto[];

    // Tùy chọn truyền clientId nếu khách hàng đọc số điện thoại/tích điểm tại quầy
    @IsOptional()
    @IsNumber({}, { message: 'ID khách hàng phải là số' })
    clientId?: number;

    @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
    @IsString()
    paymentMethod: string;

    @IsOptional()
    @IsString()
    promoCode?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Số tiền giảm giá phải là số' })
    discount?: number;
}