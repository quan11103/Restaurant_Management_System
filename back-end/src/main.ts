import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Kích hoạt CORS nếu bạn muốn front-end gọi API được
    app.enableCors();

    await app.listen(3000);
    console.log('=== SERVER IS RUNNING ON http://localhost:3000 ===');
}
bootstrap();