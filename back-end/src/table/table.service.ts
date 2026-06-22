import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) { }

  async create(createTableDto: CreateTableDto) {
    const RESTAURANT_ID = 1;

    // Kiểm tra trùng tên bàn trong nhà hàng này
    const isExist = await this.prisma.table.findFirst({
      where: { name: createTableDto.name, restaurantId: RESTAURANT_ID },
    });
    if (isExist) {
      throw new ConflictException(`Tên bàn '${createTableDto.name}' đã tồn tại!`);
    }

    return this.prisma.table.create({
      data: {
        ...createTableDto,
        restaurantId: RESTAURANT_ID,
      },
    });
  }

  async findAll() {
    return this.prisma.table.findMany({
      where: { restaurantId: 1 },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) throw new NotFoundException(`Không tìm thấy bàn ăn có ID = ${id}`);
    return table;
  }

  async update(id: number, updateTableDto: UpdateTableDto) {
    await this.findOne(id);
    return this.prisma.table.update({
      where: { id },
      data: updateTableDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.table.delete({ where: { id } });
    return { message: `Đã xóa bàn ăn thành công!` };
  }
}