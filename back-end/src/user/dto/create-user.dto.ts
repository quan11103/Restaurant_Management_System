import { Role } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(4, { message: 'Username must be at least 4 characters long' })
    username: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    fullName: string;

    @IsString()
    email: string;

    @IsString()
    phone: string;

    @IsEnum(Role)
    role: Role;
}
