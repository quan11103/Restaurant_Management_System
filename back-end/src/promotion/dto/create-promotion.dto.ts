import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePromotionDto {
    @IsString({ message: 'Mã khuyến mãi phải là chuỗi.' })
    @IsNotEmpty({ message: 'Mã khuyến mãi (code) không được để trống.' })
    code: string; // VD: "SUMMER2026", "FREESHIP"

    @IsString({ message: 'Loại khuyến mãi phải là chuỗi.' })
    @IsNotEmpty({ message: 'Loại khuyến mãi (type) không được để trống.' })
    type: string; // VD: "PERCENTAGE" (phần trăm) hoặc "FIXED_AMOUNT" (trừ thẳng tiền)

    @IsNumber({}, { message: 'Giá trị khuyến mãi phải là số.' })
    @Min(0, { message: 'Giá trị không được âm.' })
    value: number;

    @IsString()
    @IsOptional()
    description?: string;

    @Type(() => Date)
    @IsDate({ message: 'Ngày bắt đầu phải đúng định dạng thời gian.' })
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống.' })
    startDate: Date;

    @Type(() => Date)
    @IsDate({ message: 'Ngày kết thúc phải đúng định dạng thời gian.' })
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống.' })
    endDate: Date;

    @IsNumber({}, { message: 'Giá trị đơn hàng tối thiểu phải là số.' })
    @IsOptional()
    @Min(0)
    minOrderValue?: number;

    @IsNumber({}, { message: 'Mức giảm tối đa phải là số.' })
    @IsOptional()
    @Min(0)
    maxDiscount?: number;

    @IsInt({ message: 'Giới hạn số lần sử dụng phải là số nguyên.' })
    @IsOptional()
    @Min(1)
    usageLimit?: number;

    // Lưu ý: Không đưa usedCount vào đây vì nó do hệ thống tự đếm, user không được nhập.
}