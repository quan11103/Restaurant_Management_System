import { IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên đăng nhập không được để trống.' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Họ và tên không được để trống.' })
    fullName: string;

    @IsEnum(Role, { message: 'Quyền (role) không hợp lệ.' })
    @IsNotEmpty({ message: 'Quyền (role) không được để trống.' })
    role: Role;
}