import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIngredientDto {
    @IsString({ message: 'Tên nguyên liệu phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Tên nguyên liệu không được để trống.' })
    name: string; // VD: "Thịt bò Kobe", "Cà chua"

    @IsString({ message: 'Phân loại phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Phân loại không được để trống.' })
    type: string; // VD: "Thịt", "Rau củ", "Gia vị"
}