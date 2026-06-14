import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service'; // Sửa lại đường dẫn chuẩn của bạn

@Module({
    imports: [],
    controllers: [],
    providers: [PrismaService],
})
export class AppModule { }