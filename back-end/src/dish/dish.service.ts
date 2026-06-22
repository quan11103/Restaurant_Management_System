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

    return this.prisma.dish.create({
      data: {
        ...createDishDto,
        restaurantId: RESTAURANT_ID
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
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const dish = await this.prisma.dish.findUnique({ where: { id } });
    if (!dish) throw new NotFoundException(`Không tìm thấy món ăn có ID = ${id}`);
    return dish;
  }

  async update(id: number, updateDishDto: UpdateDishDto) {
    await this.findOne(id);
    return this.prisma.dish.update({
      where: { id },
      data: updateDishDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.dish.delete({ where: { id } });
    return { message: 'Xóa món ăn thành công!' };
  }

  // Tìm kiếm các món có chứa từ khóa
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