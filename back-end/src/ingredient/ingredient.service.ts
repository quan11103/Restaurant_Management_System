import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaService) { }

  async create(createIngredientDto: CreateIngredientDto) {
    // Kiểm tra trùng tên nguyên liệu
    const exist = await this.prisma.ingredient.findFirst({
      where: { name: createIngredientDto.name }
    });

    if (exist) {
      throw new ConflictException(`Nguyên liệu '${createIngredientDto.name}' đã tồn tại!`);
    }

    return this.prisma.ingredient.create({
      data: createIngredientDto,
    });
  }

  async findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) {
      throw new NotFoundException(`Không tìm thấy nguyên liệu có ID = ${id}`);
    }
    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    await this.findOne(id); // Đảm bảo tồn tại
    return this.prisma.ingredient.update({
      where: { id },
      data: updateIngredientDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.ingredient.delete({ where: { id } });
    return { message: `Xóa nguyên liệu thành công!` };
  }
}