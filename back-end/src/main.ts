import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // ================= CẤU HÌNH SWAGGER =================
    const config = new DocumentBuilder()
        .setTitle('Restaurant Management API')
        .setDescription('Tài liệu mô tả các API của hệ thống quản lý nhà hàng.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    // ====================================================

    app.enableCors();

    await app.listen(3000);
    console.log('=== SERVER IS RUNNING ON http://localhost:3000 ===');
}
bootstrap();