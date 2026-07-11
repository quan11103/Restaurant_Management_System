import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsArray, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class DishImageEmbeddedDto {
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsOptional()
    isMain?: boolean;
}

export class CreateDishDto {
    @IsString({ message: 'Tên món ăn phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Tên món ăn không được để trống.' })
    name: string;

    @IsString({ message: 'Loại món ăn phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Phân loại món (type) không được để trống.' })
    type: string;

    @IsNumber({}, { message: 'Giá tiền phải là một số.' })
    @Min(0, { message: 'Giá tiền không được âm.' })
    price: number;

    @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DishImageEmbeddedDto)
    images?: DishImageEmbeddedDto[];

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;
}