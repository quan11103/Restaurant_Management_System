import { IsArray, IsInt, IsOptional } from 'class-validator';

export class RecommendNewUserDto {
    @IsOptional()
    @IsArray()
    history?: {
        dishId: number;
        interaction: number;
    }[];

    @IsOptional()
    @IsInt()
    topK?: number = 8;

    @IsOptional()
    @IsArray()
    excludeDishIds?: number[];
}