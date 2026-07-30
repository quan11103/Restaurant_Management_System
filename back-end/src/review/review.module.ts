import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { InteractionModule } from 'src/interaction/interaction.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [InteractionModule],
})
export class ReviewModule { }
