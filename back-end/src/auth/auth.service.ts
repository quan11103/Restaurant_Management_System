import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    // Hàm Đăng ký
    async register(registerDto: RegisterDto) {
        const { username, password, fullName, role } = registerDto;

        // Kiểm tra user tồn tại
        const existingUser = await this.prisma.user.findUnique({ where: { username } });
        if (existingUser) throw new BadRequestException('Tài khoản đã tồn tại!');

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào DB
        const newUser = await this.prisma.user.create({
            data: { username, password: hashedPassword, fullName, role },
        });
        return { message: 'Đăng ký thành công', userId: newUser.id };
    }

    // Hàm Đăng nhập
    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        // Tìm user trong DB
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

        // Tạo JWT Token chứa thông tin (payload)
        const payload = { sub: user.id, username: user.username, role: user.role };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}