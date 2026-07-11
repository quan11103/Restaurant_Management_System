import { Module } from '@nestjs/common';
import { DishImageService } from './dish-image.service';
import { DishImageController } from './dish-image.controller';

@Module({
  controllers: [DishImageController],
  providers: [DishImageService],
})
export class DishImageModule {}
