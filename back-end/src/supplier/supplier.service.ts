import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) { }

  async create(createSupplierDto: CreateSupplierDto) {
    // Kiểm tra xem đã có nhà cung cấp nào dùng số điện thoại này chưa
    const existPhone = await this.prisma.supplier.findFirst({
      where: { phone: createSupplierDto.phone }
    });

    if (existPhone) {
      throw new ConflictException(`Nhà cung cấp với số điện thoại '${createSupplierDto.phone}' đã tồn tại!`);
    }

    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' }, // Sắp xếp theo bảng chữ cái
    });
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id }
    });

    if (!supplier) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp có ID = ${id}`);
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id); // Đảm bảo ID tồn tại trước khi cập nhật

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.supplier.delete({
      where: { id }
    });

    return { message: `Đã xóa thông tin nhà cung cấp thành công!` };
  }
}