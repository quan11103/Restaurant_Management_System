import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class ClientCheckoutDto {
    @IsNotEmpty({ message: 'Họ và tên không được để trống' })
    @IsString()
    fullName: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsNotEmpty({ message: 'Địa chỉ nhận hàng không được để trống' })
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    paymentMethod: string;

    @IsString()
    @IsOptional()
    promoCode?: string;
}