import { IsInt, IsNotEmpty, IsString, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreateDishImageDto {
    @IsInt({ message: 'dishId phải là số nguyên' })
    @IsNotEmpty({ message: 'dishId không được để trống' })
    dishId: number;

    @IsString()
    @IsNotEmpty({ message: 'imageUrl không được để trống' })
    imageUrl: string;

    @IsBoolean()
    @IsOptional()
    isMain?: boolean;
}