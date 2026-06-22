import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Cho phép dùng JWT ở mọi nơi không cần import lại
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }