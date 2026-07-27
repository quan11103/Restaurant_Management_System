import { Module } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { RecommendationModule } from 'src/recommendation/recommendation.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InteractionModule } from 'src/interaction/interaction.module';

@Module({
  imports: [RecommendationModule, PrismaModule, InteractionModule],
  controllers: [DishController],
  providers: [DishService],
})
export class DishModule { }
