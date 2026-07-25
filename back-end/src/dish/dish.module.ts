import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { RecommendationModule } from 'src/recommendation/recommendation.module';

@Module({
  imports: [RecommendationModule],
  controllers: [DishController],
  providers: [DishService],
})
export class DishModule { }
