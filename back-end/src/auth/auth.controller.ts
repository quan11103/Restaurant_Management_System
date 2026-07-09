import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Đăng ký thành công.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ hoặc email đã tồn tại.' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @ApiOperation({ summary: 'Đăng nhập hệ thống' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Đăng nhập thành công, trả về Access/Refresh Token.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Sai email hoặc mật khẩu.' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Cấp lại Access Token mới' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Cấp token mới thành công.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Refresh Token không hợp lệ hoặc đã hết hạn.' })
    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @ApiBearerAuth() // Hiển thị nút nhập Token trên giao diện Swagger
    @ApiOperation({ summary: 'Đăng xuất' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Đăng xuất thành công.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Không có quyền truy cập.' })
    @UseGuards(JwtAuthGuard) // Bắt buộc user phải gửi kèm Access Token hợp lệ
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Req() req: Request) {
        // Khi đi qua JwtAuthGuard, thông tin user giải mã từ token sẽ được gắn vào req.user
        const userId = req.user['sub'] || req.user['id'];
        return this.authService.logout(userId);
    }
}