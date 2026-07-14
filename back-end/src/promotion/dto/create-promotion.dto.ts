import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
    @IsString()
    @IsNotEmpty({ message: 'Mã khuyến mãi không được để trống' })
    code: string;

    @IsString()
    @IsNotEmpty({ message: 'Loại khuyến mãi không được để trống' })
    type: string;

    @IsNumber()
    @Min(0, { message: 'Giá trị khuyến mãi phải lớn hơn hoặc bằng 0' })
    @IsNotEmpty({ message: 'Giá trị khuyến mãi không được để trống' })
    value: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDate({ message: 'Ngày bắt đầu không đúng định dạng' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    startDate: Date;

    @IsDate({ message: 'Ngày kết thúc không đúng định dạng' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    endDate: Date;

    @IsNumber()
    @Min(0, { message: 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0' })
    @IsOptional()
    minOrderValue?: number;

    @IsNumber()
    @Min(0, { message: 'Số tiền giảm tối đa phải lớn hơn hoặc bằng 0' })
    @IsOptional()
    maxDiscount?: number;

    @IsInt()
    @Min(1, { message: 'Giới hạn sử dụng phải lớn hơn hoặc bằng 1' })
    @IsOptional()
    usageLimit?: number;
}