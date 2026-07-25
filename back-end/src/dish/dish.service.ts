import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { RecommendationService } from 'src/recommendation/recommendation.service';
import { RecommendNewUserDto } from 'src/recommendation/dto/recommend-new-user.dto';

export interface DishQueryDto {
  search?: string;
  type?: string;
  isAvailable?: boolean | string;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class DishService {
  constructor(private prisma: PrismaService, private readonly recommendationService: RecommendationService) { }

  /**
   * Tạo món ăn mới
   */
  async create(createDishDto: CreateDishDto) {
    const RESTAURANT_ID = 1;
    const { name, type, price, description, images, isAvailable } = createDishDto;

    // 1. Kiểm tra trùng tên món trong cùng nhà hàng
    const exist = await this.prisma.dish.findFirst({
      where: { name, restaurantId: RESTAURANT_ID },
    });

    if (exist) {
      throw new ConflictException(`Món ăn '${name}' đã có trong menu!`);
    }

    try {
      return await this.prisma.dish.create({
        data: {
          name,
          type,
          price,
          description,
          isAvailable,
          restaurantId: RESTAURANT_ID,
          images:
            images && images.length > 0
              ? {
                create: images.map((img) => ({
                  imageUrl: img.imageUrl,
                  isMain: img.isMain || false,
                })),
              }
              : undefined,
        },
        include: {
          images: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi tạo món ăn!');
    }
  }

  /**
   * Lấy danh sách món ăn (Phân trang, lọc, tìm kiếm đa năng)
   */
  async findAll(query: DishQueryDto = {}) {
    const { search, type, isAvailable, page = 1, limit = 10 } = query;

    // Đảm bảo ép kiểu số chính xác cho phân trang
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    // 1. Lọc theo thể loại món (MON_CHINH, DO_UONG,...)
    if (type && type !== 'ALL') {
      where.type = type;
    }

    // 2. Lọc theo trạng thái phục vụ
    if (isAvailable !== undefined && isAvailable !== null && isAvailable !== 'ALL') {
      where.isAvailable = String(isAvailable) === 'true';
    }

    // 3. Tìm kiếm đa năng (Tên, Mô tả, hoặc ID món ăn)
    if (search) {
      const searchConditions: any[] = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];

      // Nếu từ khóa tìm kiếm là số, tìm kiếm thêm theo ID
      if (!isNaN(Number(search))) {
        searchConditions.push({ id: Number(search) });
      }

      where.OR = searchConditions;
    }

    // Chạy song song lấy dữ liệu và đếm tổng số bản ghi
    const [dishes, totalRecords] = await this.prisma.$transaction([
      this.prisma.dish.findMany({
        where,
        include: {
          images: true,
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take: limitNumber,
      }),
      this.prisma.dish.count({ where }),
    ]);

    return {
      data: dishes,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRecords / limitNumber) || 1,
        totalRecords,
      },
    };
  }

  /**
   * Tìm món ăn theo ID
   */
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID món ăn không hợp lệ!');
    }

    const dish = await this.prisma.dish.findUnique({
      where: { id: numericId },
      include: { images: true },
    });

    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn có ID = ${id}`);
    }

    return dish;
  }

  /**
   * Cập nhật thông tin món ăn
   */
  async update(id: number | string, updateDishDto: UpdateDishDto) {
    const numericId = Number(id);
    await this.findOne(numericId); // Đảm bảo món ăn tồn tại trước khi sửa

    const RESTAURANT_ID = 1;
    const { name, type, price, description, images, isAvailable } = updateDishDto;

    // 1. Nếu thay đổi tên món, kiểm tra xem tên mới có bị trùng với món khác không
    if (name) {
      const exist = await this.prisma.dish.findFirst({
        where: {
          name,
          restaurantId: RESTAURANT_ID,
          NOT: { id: numericId },
        },
      });

      if (exist) {
        throw new ConflictException(`Tên món ăn '${name}' đã trùng với một món khác!`);
      }
    }

    // 2. Xử lý cập nhật danh sách hình ảnh
    let imagesAction = undefined;
    if (images !== undefined) {
      imagesAction = {
        deleteMany: {}, // Xóa toàn bộ ảnh cũ của món này
        ...(images.length > 0 && {
          create: images.map((img) => ({
            imageUrl: img.imageUrl,
            isMain: img.isMain || false,
          })),
        }),
      };
    }

    return await this.prisma.dish.update({
      where: { id: numericId },
      data: {
        name,
        type,
        price,
        description,
        isAvailable,
        restaurantId: RESTAURANT_ID,
        images: imagesAction,
      },
      include: {
        images: true,
      },
    });
  }

  /**
   * Xóa món ăn
   */
  async remove(id: number | string) {
    const numericId = Number(id);
    await this.findOne(numericId);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Xóa tất cả hình ảnh liên quan
      await tx.dishImage.deleteMany({
        where: { dishId: numericId },
      });

      // 2. Xóa món ăn
      await tx.dish.delete({
        where: { id: numericId },
      });

      return {
        status: 'success',
        message: 'Xóa món ăn thành công!',
      };
    });
  }

  async recommendForNewUser(dto: RecommendNewUserDto) {

    const dishIds = await this.recommendationService.recommendNewUser(dto);

    if (dishIds.length === 0) {
      return [];
    }

    const dishes = await this.prisma.dish.findMany({
      where: {
        id: {
          in: dishIds,
        },
        isAvailable: true,
      },
      include: {
        images: true,
      },
    });

    const order = new Map<number, number>();

    dishIds.forEach((id, index) => {
      order.set(id, index);
    });

    dishes.sort(
      (a, b) => order.get(a.id)! - order.get(b.id)!
    );

    return dishes;
  }
}