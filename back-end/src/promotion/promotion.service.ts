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

  // getPromotionByCode
  async applyPromotionCode(code: string, currentOrderTotal: number) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { code: code }
    });

    if (!promotion) {
      throw new BadRequestException('Mã giảm giá không tồn tại!');
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa có hiệu lực!');
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng!');
    }

    if (promotion.minOrderValue && currentOrderTotal < promotion.minOrderValue) {
      throw new BadRequestException(`Đơn hàng phải đạt tối thiểu ${promotion.minOrderValue} để áp dụng mã này!`);
    }

    // Tính toán số tiền được giảm
    let discountAmount = 0;
    if (promotion.type === 'PERCENTAGE') {
      discountAmount = (currentOrderTotal * promotion.value) / 100;
      // Kiểm tra giới hạn giảm tối đa (nếu có)
      if (promotion.maxDiscount && discountAmount > promotion.maxDiscount) {
        discountAmount = promotion.maxDiscount;
      }
    } else if (promotion.type === 'FIXED_AMOUNT') {
      discountAmount = promotion.value;
    }

    return {
      promotionId: promotion.id,
      code: promotion.code,
      discountAmount: discountAmount,
      finalTotal: Math.max(0, currentOrderTotal - discountAmount) // Đảm bảo tổng tiền không bị âm
    };
  }
}