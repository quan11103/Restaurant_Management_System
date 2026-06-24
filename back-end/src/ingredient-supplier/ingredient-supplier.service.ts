import { Injectable, ConflictException } from '@nestjs/common';
import { CreateIngredientSupplierDto } from './dto/create-ingredient-supplier.dto';
import { UpdateIngredientSupplierDto } from './dto/update-ingredient-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IngredientSupplierService {
  constructor(private prisma: PrismaService) { }

  // SearchIngredientSupplier
  async searchIngredientSupplier(supplierId: number, keyword: string) {
    return this.prisma.ingredientSupplier.findMany({
      where: {
        supplierId: supplierId,
        ingredient: {
          name: {
            contains: keyword || '',
            mode: 'insensitive',
          },
        },
      },
      include: {
        ingredient: true,
      },
    });
  }

  async create(dto: CreateIngredientSupplierDto) {
    // Kiểm tra xem nhà cung cấp này đã bán nguyên liệu này chưa
    const exist = await this.prisma.ingredientSupplier.findFirst({
      where: {
        ingredientId: dto.ingredientId,
        supplierId: dto.supplierId,
      },
    });

    if (exist) {
      throw new ConflictException('Nhà cung cấp này đã có liên kết với nguyên liệu này rồi!');
    }

    // Tạo liên kết mới
    return this.prisma.ingredientSupplier.create({
      data: dto
    });
  }

  findAll() {
    return `This action returns all ingredientSupplier`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingredientSupplier`;
  }

  update(id: number, updateIngredientSupplierDto: UpdateIngredientSupplierDto) {
    return `This action updates a #${id} ingredientSupplier`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingredientSupplier`;
  }
}
