import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) { }

  async create(createPromotionDto: CreatePromotionDto) {
    // 1. Kiểm tra ngày bắt đầu phải trước ngày kết thúc
    if (createPromotionDto.startDate >= createPromotionDto.endDate) {
      throw new BadRequestException('Ngày bắt đầu phải diễn ra trước ngày kết thúc!');
    }

    // 2. Kiểm tra code đã tồn tại chưa
    const existCode = await this.prisma.promotion.findUnique({
      where: { code: createPromotionDto.code }
    });

    if (existCode) {
      throw new ConflictException(`Mã khuyến mãi '${createPromotionDto.code}' đã tồn tại trong hệ thống!`);
    }

    // 3. Tiến hành tạo mới
    return this.prisma.promotion.create({
      data: createPromotionDto,
    });
  }

  async findAll() {
    return this.prisma.promotion.findMany({
      orderBy: { endDate: 'desc' }, // Sắp xếp theo ngày kết thúc
    });
  }

  async findOne(id: number) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id }
    });

    if (!promotion) {
      throw new NotFoundException(`Không tìm thấy mã khuyến mãi có ID = ${id}`);
    }
    return promotion;
  }

  async findByCode(code: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { code }
    });

    if (!promotion) {
      throw new NotFoundException(`Mã khuyến mãi '${code}' không tồn tại!`);
    }
    return promotion;
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.findOne(id); // Đảm bảo tồn tại

    // Kiểm tra xem code mới có bị trùng với chương trình khác không
    if (updatePromotionDto.code && updatePromotionDto.code !== promotion.code) {
      const existCode = await this.prisma.promotion.findUnique({
        where: { code: updatePromotionDto.code }
      });
      if (existCode) {
        throw new ConflictException(`Mã khuyến mãi '${updatePromotionDto.code}' đã được sử dụng!`);
      }
    }

    return this.prisma.promotion.update({
      where: { id },
      data: updatePromotionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.promotion.delete({
      where: { id }
    });

    return { message: `Đã xóa chương trình khuyến mãi thành công!` };
  }
}