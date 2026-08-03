import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableQueryDto } from './dto/table-query.dto';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) { }

  // Tạo bàn mới
  async create(createTableDto: CreateTableDto) {
    const RESTAURANT_ID = 1;
    const { name } = createTableDto;

    const exist = await this.prisma.table.findFirst({
      where: { name, restaurantId: RESTAURANT_ID },
    });

    if (exist) {
      throw new ConflictException(`Tên bàn '${name}' đã tồn tại trong hệ thống!`);
    }

    try {
      return await this.prisma.table.create({
        data: {
          ...createTableDto,
          restaurantId: RESTAURANT_ID,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi tạo bàn ăn!');
    }
  }

  // Lấy danh sách bàn (Hỗ trợ Tìm kiếm, Lọc, Sắp xếp, Phân trang)
  async findAll(query: TableQueryDto) {
    const RESTAURANT_ID = 1;

    const { q, isOccupied, minCapacity, maxCapacity, sortBy, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where: any = { restaurantId: RESTAURANT_ID };

    if (isOccupied === true || isOccupied === false) {
      where.isOccupied = isOccupied;
    }

    if (minCapacity !== undefined || maxCapacity !== undefined) {
      where.capacity = {};
      if (minCapacity !== undefined) where.capacity.gte = minCapacity;
      if (maxCapacity !== undefined) where.capacity.lte = maxCapacity;
    }

    if (q) {
      const searchConditions: any[] = [{ name: { contains: q, mode: 'insensitive' } }];
      if (!isNaN(Number(q))) searchConditions.push({ id: Number(q) });
      where.OR = searchConditions;
    }

    let orderBy: any = { id: 'asc' };
    if (sortBy === 'name_asc') orderBy = { name: 'asc' };
    if (sortBy === 'capacity_asc') orderBy = { capacity: 'asc' };
    if (sortBy === 'capacity_desc') orderBy = { capacity: 'desc' };

    const [tables, totalRecords] = await this.prisma.$transaction([
      this.prisma.table.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          orderTables: {
            where: { isPaid: false },
            take: 1,
            include: {
              order: {
                select: { id: true, total: true, status: true, orderTime: true },
              },
            },
          },
        },
      }),
      this.prisma.table.count({ where }),
    ]);

    return {
      data: tables,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords,
      },
    };
  }

  // Tìm bàn theo ID
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID bàn không hợp lệ!');
    }

    const table = await this.prisma.table.findUnique({
      where: { id: numericId },
    });

    if (!table) {
      throw new NotFoundException(`Không tìm thấy bàn ăn có ID = ${id}`);
    }

    return table;
  }

  // Cập nhật thông tin bàn
  async update(id: number | string, updateTableDto: UpdateTableDto) {
    const numericId = Number(id);
    await this.findOne(numericId);

    const RESTAURANT_ID = 1;
    const { name } = updateTableDto;

    if (name) {
      const exist = await this.prisma.table.findFirst({
        where: {
          name,
          restaurantId: RESTAURANT_ID,
          NOT: { id: numericId },
        },
      });

      if (exist) {
        throw new ConflictException(`Tên bàn '${name}' đã trùng với một bàn khác!`);
      }
    }

    try {
      return await this.prisma.table.update({
        where: { id: numericId },
        data: updateTableDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi cập nhật bàn ăn!');
    }
  }

  // Xóa bàn ăn
  async remove(id: number | string) {
    const numericId = Number(id);
    await this.findOne(numericId);

    try {
      await this.prisma.table.delete({
        where: { id: numericId },
      });

      return {
        status: 'success',
        message: 'Xóa bàn ăn thành công!',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Không thể xóa bàn vì đang có hóa đơn/đơn hàng liên kết!',
      );
    }
  }

  // Lấy danh sách bàn theo trạng thái (Phục vụ đặt bàn/gọi món)
  async getTableByStatus(isOccupied: boolean | string) {
    const isOccupiedBool = String(isOccupied) === 'true';
    return this.prisma.table.findMany({
      where: {
        isOccupied: isOccupiedBool,
        restaurantId: 1,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Cập nhật trạng thái bàn nhanh
  async updateStatus(id: number | string, isOccupied: boolean | string) {
    const numericId = Number(id);
    await this.findOne(numericId);

    const isOccupiedBool = String(isOccupied) === 'true';

    try {
      return await this.prisma.table.update({
        where: { id: numericId },
        data: { isOccupied: isOccupiedBool },
      });
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi khi cập nhật trạng thái bàn!');
    }
  }

  // Thống kê số lượng bàn theo trạng thái
  async getSummary() {
    const RESTAURANT_ID = 1;

    const [total, available, occupied] = await Promise.all([
      this.prisma.table.count({
        where: { restaurantId: RESTAURANT_ID }
      }),
      this.prisma.table.count({
        where: { restaurantId: RESTAURANT_ID, isOccupied: false }
      }),
      this.prisma.table.count({
        where: { restaurantId: RESTAURANT_ID, isOccupied: true }
      }),
    ]);

    return {
      total,
      available,
      occupied
    };
  }
}