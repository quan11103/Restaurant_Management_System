import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishImageDto } from './dto/create-dish-image.dto';
import { UpdateDishImageDto } from './dto/update-dish-image.dto';

@Injectable()
export class DishImageService {
  constructor(private prisma: PrismaService) { }

  async create(createDishImageDto: CreateDishImageDto) {
    const { dishId, imageUrl, isMain } = createDishImageDto;

    // Kiểm tra xem Dish có tồn tại không
    const dishExists = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });
    if (!dishExists) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID: ${dishId}`);
    }

    // Nếu ảnh này được set làm ảnh chính update các ảnh cũ của món này thành isMain = false
    if (isMain) {
      await this.prisma.dishImage.updateMany({
        where: { dishId: dishId },
        data: { isMain: false },
      });
    }

    // Tạo record hình ảnh mới
    return this.prisma.dishImage.create({
      data: {
        dishId,
        imageUrl,
        isMain: isMain || false,
      },
    });
  }

  async findAll(dishId?: number) {
    return this.prisma.dishImage.findMany({
      where: dishId ? { dishId: Number(dishId) } : {},
      orderBy: { id: 'desc' }, // Mới nhất lên trước
    });
  }

  async findOne(id: number) {
    const image = await this.prisma.dishImage.findUnique({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Không tìm thấy ảnh với ID: ${id}`);
    }
    return image;
  }

  async remove(id: number) {
    await this.findOne(id); // Gọi hàm findOne để kiểm tra xem có tồn tại không
    return this.prisma.dishImage.delete({
      where: { id },
    });
  }

  async setMainImage(id: number, dishId: number) {
    // Set tất cả ảnh của món này thành false
    await this.prisma.dishImage.updateMany({
      where: { dishId: dishId },
      data: { isMain: false },
    });

    // Set ảnh được chọn thành true
    return this.prisma.dishImage.update({
      where: { id },
      data: { isMain: true },
    });
  }

  update(id: number, updateDishImageDto: UpdateDishImageDto) {
    return `This action updates a #${id} dishImage`;
  }
}
