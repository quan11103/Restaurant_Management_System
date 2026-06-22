import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Đánh dấu là Global module
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Xuất ra ngoài để module khác sử dụng
})
export class PrismaModule { }