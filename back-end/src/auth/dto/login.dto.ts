import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsString({ message: 'Tên đăng nhập phải là một chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Tên đăng nhập không được để trống.' })
    username: string;

    @IsString({ message: 'Mật khẩu phải là một chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
    password: string;
}