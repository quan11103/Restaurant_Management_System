import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @IsNotEmpty()
    dishId: number;

    @IsInt()
    @IsNotEmpty()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating must be at most 5' })
    rating: number;

    @IsString()
    @IsOptional()
    comment?: string;
}
