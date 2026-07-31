import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class DishQueryDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    type?: string | string[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: 'Giá tối thiểu không được âm' })
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: 'Giá tối đa không được âm' })
    maxPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    minRating?: number;

    @IsOptional()
    @IsString()
    @IsIn(['newest', 'price_asc', 'price_desc', 'rating'], {
        message: 'sortBy phải là một trong các giá trị: newest, price_asc, price_desc, rating_desc',
    })
    sortBy?: string = 'newest';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 12;
}