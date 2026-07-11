import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    // Đăng kí
    async register(registerDto: RegisterDto) {
        const { username, password, fullName, role } = registerDto;

        const existingUser = await this.prisma.user.findUnique({ where: { username } });
        if (existingUser) throw new BadRequestException('Tài khoản đã tồn tại!');

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await this.prisma.user.create({
            data: { username, password: hashedPassword, fullName, role },
        });
        return { message: 'Đăng ký thành công', userId: newUser.id };
    }

    // Đăng nhập
    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');

        const payload = { sub: user.id, username: user.username, role: user.role };

        // Tạo cả cặp Access Token (ngắn hạn) và Refresh Token (dài hạn)
        return {
            access_token: await this.jwtService.signAsync(payload, { expiresIn: '1d' }),
            refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
            username: user.username,
            fullName: user.fullName,
            role: user.role
        };
    }

    // Refresh token
    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;

        try {
            // Giải mã và kiểm tra xem refresh token có hợp lệ hoặc hết hạn hay không
            const payload = await this.jwtService.verifyAsync(refreshToken);

            // Nếu hợp lệ, trích xuất thông tin cũ để tạo một Access Token mới
            const newPayload = { sub: payload.sub, username: payload.username, role: payload.role };

            return {
                access_token: await this.jwtService.signAsync(newPayload, { expiresIn: '15m' }),
            };
        } catch (error) {
            // Nếu token sai chữ ký hoặc hết hạn, ném ra lỗi ngay lập tức
            throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn!');
        }
    }

    // Đăng xuất
    async logout(userId: any) {
        return { message: 'Đăng xuất thành công' };
    }
}