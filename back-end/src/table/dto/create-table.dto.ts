import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTableDto {
    @IsString({ message: 'Tên bàn phải là chuỗi ký tự.' })
    @IsNotEmpty({ message: 'Tên bàn không được để trống.' })
    name: string;

    @IsInt({ message: 'Sức chứa của bàn phải là một số nguyên.' })
    @Min(1, { message: 'Sức chứa tối thiểu phải từ 1 người trở lên.' })
    capacity: number;

    @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
    @IsOptional()
    description?: string;

    @IsBoolean({ message: 'Trạng thái bàn phải là kiểu True/False.' })
    @IsOptional()
    isOccupied?: boolean;
}