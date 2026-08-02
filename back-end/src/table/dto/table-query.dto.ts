import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class TableQueryDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isOccupied?: boolean | string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minCapacity?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxCapacity?: number;

    @IsOptional()
    @IsString()
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