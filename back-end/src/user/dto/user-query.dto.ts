import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class UserQueryDto {
    // ========================
    // 1. Phân trang (Pagination)
    // ========================
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100) // Giới hạn số lượng query tối đa để tránh quá tải DB
    limit?: number = 10;

    // ========================
    // 2. Tìm kiếm (Search)
    // ========================
    @IsOptional()
    @IsString()
    search?: string; // Thường dùng để tìm theo tên hoặc email

    // ========================
    // 3. Lọc (Filtering)
    // ========================
    @IsOptional()
    @IsString()
    role?: string; // Ví dụ: 'admin', 'user', 'moderator'

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;

    // ========================
    // 4. Sắp xếp (Sorting)
    // ========================
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt'; // Trường cần sắp xếp

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}