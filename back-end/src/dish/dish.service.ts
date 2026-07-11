import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishService {
  constructor(private prisma: PrismaService) { }

  async create(createDishDto: CreateDishDto) {
    const RESTAURANT_ID = 1;

    // Kiểm tra trùng tên món
    const exist = await this.prisma.dish.findFirst({
      where: { name: createDishDto.name, restaurantId: RESTAURANT_ID }
    });
    if (exist) throw new ConflictException(`Món ăn '${createDishDto.name}' đã có trong menu!`);

    const { name, type, price, description, images, isAvailable } = createDishDto;

    return this.prisma.dish.create({
      data: {
        name,
        type,
        price,
        description,
        isAvailable,
        restaurantId: RESTAURANT_ID,
        // Tận dụng Nested Write của Prisma:
        // Nếu có mảng images truyền lên, tự động tạo các bản ghi DishImage liên kết tương ứng
        images: images && images.length > 0 ? {
          create: images.map(img => ({
            imageUrl: img.imageUrl,
            isMain: img.isMain || false
          }))
        } : undefined
      },
      // Trả về dữ liệu món ăn kèm theo mảng hình ảnh vừa tạo để Frontend nhận phản hồi
      include: {
        images: true
      }
    });
  }

  async findAll(type?: string) {
    const whereCondition: any = { restaurantId: 1 };

    if (type) {
      whereCondition.type = type; // Lọc theo loại món: Đồ ăn, đồ uống...
    }

    return this.prisma.dish.findMany({
      where: whereCondition,
      include: { images: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: { images: true }
    });
    if (!dish) throw new NotFoundException(`Không tìm thấy món ăn có ID = ${id}`);
    return dish;
  }

  async update(id: number, updateDishDto: UpdateDishDto) {
    await this.findOne(id);
    const RESTAURANT_ID = 1;
    const { name, type, price, description, images, isAvailable } = updateDishDto;

    return this.prisma.dish.update({
      where: { id },
      data: {
        name,
        type,
        price,
        description,
        isAvailable,
        restaurantId: RESTAURANT_ID,
        images: images && images.length > 0 ? {
          create: images.map(img => ({
            imageUrl: img.imageUrl,
            isMain: img.isMain || false
          }))
        } : undefined
      },
      include: {
        images: true
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.dishImage.deleteMany({
        where: { dishId: id },
      });
      await tx.dish.delete({
        where: { id },
      });
    });
    return { message: 'Xóa món ăn thành công' };
  }

  async searchDish(keyword: string) {
    return this.prisma.dish.findMany({
      where: {
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
    });
  }
}