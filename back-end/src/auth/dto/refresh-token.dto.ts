import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        description: 'Mã Refresh Token hợp lệ đã được cấp từ lần đăng nhập trước',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...', // Một đoạn token mẫu để hiển thị trên Swagger UI
    })
    @IsString({ message: 'Refresh token phải là một chuỗi văn bản' })
    @IsNotEmpty({ message: 'Refresh token không được để trống' })
    refreshToken: string;
}