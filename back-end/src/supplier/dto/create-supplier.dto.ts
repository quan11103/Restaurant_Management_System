import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
    @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống.' })
    name: string;

    @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
    phone: string;

    @IsString({ message: 'Địa chỉ phải là chuỗi ký tự.' })
    @IsOptional()
    address?: string;
}