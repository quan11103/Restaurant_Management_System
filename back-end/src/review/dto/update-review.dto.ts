import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';

// Khi update review, không cho thay đổi dishId
export class UpdateReviewDto extends PartialType(
    OmitType(CreateReviewDto, ['dishId'] as const),
) { }