import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { RecommendationService } from 'src/recommendation/recommendation.service';
import { InteractionService } from 'src/interaction/interaction.service';
import { RecommendNewUserDto } from 'src/recommendation/dto/recommend-new-user.dto';

export interface DishQueryDto {
  q?: string;
  type?: string | string[];
  isAvailable?: boolean | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  minRating?: number | string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | string;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class DishService {
  constructor(
    private prisma: PrismaService,
    private readonly recommendationService: RecommendationService,
    private readonly interactionService: InteractionService,
  ) { }

  /**
   * Helper function: Tính điểm đánh giá trung bình và số lượng đánh giá
   */
  private mapDishWithRating(dish: any) {
    const { reviews, ...dishData } = dish;
    const reviewCount = reviews?.length || 0;
    const totalRating =
      reviews?.reduce((sum: number, review: any) => sum + review.rating, 0) || 0;

    const rating =
      reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;

    return {
      ...dishData,
      rating,
      reviewCount,
    };
  }

  // Tạo món ăn mới
  async create(createDishDto: CreateDishDto) {
    const RESTAURANT_ID = 1;
    const { name, type, price, description, images, isAvailable } = createDishDto;

    const exist = await this.prisma.dish.findFirst({
      where: { name, restaurantId: RESTAURANT_ID },
    });

    if (exist) {
      throw new ConflictException(`Món ăn '${name}' đã có trong menu!`);
    }

    try {
      const newDish = await this.prisma.dish.create({
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

      return { ...newDish, rating: 0, reviewCount: 0 };
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi tạo món ăn!');
    }
  }

  // Lấy danh sách món ăn (Tìm kiếm, Lọc đa năng, Sắp xếp, Phân trang)
  async findAll(query: DishQueryDto = {}) {
    const {
      q,
      type,
      isAvailable,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 12);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    // Lọc theo danh mục
    // Lọc theo danh mục (Hỗ trợ 1 type, mảng type, hoặc chuỗi 'PIZZA,BURGER')
    if (type && type !== 'ALL') {
      let typeList: string[] = [];

      if (Array.isArray(type)) {
        typeList = type.filter((t) => t && t !== 'ALL');
      } else if (typeof type === 'string') {
        typeList = type
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t && t !== 'ALL');
      }

      if (typeList.length === 1) {
        where.type = typeList[0];
      } else if (typeList.length > 1) {
        where.type = { in: typeList }; // Lọc theo danh sách nhiều type trong Prisma
      }
    }

    // Lọc theo trạng thái phục vụ
    if (isAvailable !== undefined && isAvailable !== null && isAvailable !== 'ALL') {
      where.isAvailable = String(isAvailable) === 'true';
    }

    // Lọc theo Khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        where.price.gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        where.price.lte = Number(maxPrice);
      }
    }

    // Tìm kiếm từ khóa
    if (q) {
      const searchConditions: any[] = [
        { name: { contains: q, mode: 'insensitive' } }
      ];

      if (!isNaN(Number(q))) {
        searchConditions.push({ id: Number(q) });
      }

      where.OR = searchConditions;
    }

    // Cấu hình Sắp xếp
    let orderBy: any = { id: 'desc' }; // Mặc định: 'newest'
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };

    // Nếu sắp xếp hoặc lọc theo rating (giá trị tính toán động)
    const isRatingFilterOrSort = Boolean(minRating) || sortBy === 'rating';

    if (isRatingFilterOrSort) {
      // Lấy toàn bộ món thỏa mãn filter DB để tính rating và lọc trên Memory
      const allDishes = await this.prisma.dish.findMany({
        where,
        include: {
          images: true,
          reviews: { select: { rating: true } },
        },
        orderBy,
      });

      let mappedDishes = allDishes.map((dish) => this.mapDishWithRating(dish));

      // Lọc theo minRating
      if (minRating !== undefined && minRating !== '') {
        const minRatingNum = Number(minRating);
        mappedDishes = mappedDishes.filter(
          (dish) => dish.rating >= minRatingNum,
        );
      }

      // Sắp xếp theo rating giảm dần
      if (sortBy === 'rating') {
        mappedDishes.sort((a, b) => b.rating - a.rating);
      }

      const totalRecords = mappedDishes.length;
      const paginatedData = mappedDishes.slice(skip, skip + limitNumber);

      return {
        data: paginatedData,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalRecords / limitNumber) || 1,
          totalRecords,
        },
      };
    }

    // Luồng Phân trang chuẩn bằng Database khi không lọc theo Rating
    const [dishes, totalRecords] = await this.prisma.$transaction([
      this.prisma.dish.findMany({
        where,
        include: {
          images: true,
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: limitNumber,
      }),
      this.prisma.dish.count({ where }),
    ]);

    const mappedDishes = dishes.map((dish) => this.mapDishWithRating(dish));

    return {
      data: mappedDishes,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRecords / limitNumber) || 1,
        totalRecords,
      },
    };
  }

  // Tìm món ăn theo ID
  async findOne(id: number | string, clientId?: number) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID món ăn không hợp lệ!');
    }

    const dish = await this.prisma.dish.findUnique({
      where: { id: numericId },
      include: {
        images: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn có ID = ${id}`);
    }

    if (clientId) {
      await this.interactionService.viewDish(clientId, numericId);
    }

    return this.mapDishWithRating(dish);
  }

  // Cập nhật thông tin món ăn
  async update(id: number | string, updateDishDto: UpdateDishDto) {
    const numericId = Number(id);
    await this.findOne(numericId); // Check tồn tại

    const RESTAURANT_ID = 1;
    const { name, type, price, description, images, isAvailable } = updateDishDto;

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

    let imagesAction = undefined;
    if (images !== undefined) {
      imagesAction = {
        deleteMany: {},
        ...(images.length > 0 && {
          create: images.map((img) => ({
            imageUrl: img.imageUrl,
            isMain: img.isMain || false,
          })),
        }),
      };
    }

    const updatedDish = await this.prisma.dish.update({
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
        reviews: {
          select: { rating: true },
        },
      },
    });

    return this.mapDishWithRating(updatedDish);
  }

  // Xóa món ăn
  async remove(id: number | string) {
    const numericId = Number(id);
    const dish = await this.prisma.dish.findUnique({ where: { id: numericId } });

    if (!dish) throw new NotFoundException(`Không tìm thấy món ăn có ID = ${id}`);

    return await this.prisma.$transaction(async (tx) => {
      await tx.dishImage.deleteMany({
        where: { dishId: numericId },
      });
      await tx.review.deleteMany({
        where: { dishId: numericId },
      });
      await tx.dish.delete({
        where: { id: numericId },
      });

      return {
        status: 'success',
        message: 'Xóa món ăn thành công!',
      };
    });
  }

  // Lấy món ăn phổ biến
  async getPopular(limit = 8) {
    const ordered = await this.prisma.orderedDish.groupBy({
      by: ['dishId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    let dishes;

    if (ordered.length === 0) {
      dishes = await this.prisma.dish.findMany({
        where: {
          isAvailable: true,
        },
        include: {
          images: true,
          reviews: { select: { rating: true } },
        },
        orderBy: {
          id: 'asc',
        },
        take: limit,
      });
      return dishes.map((dish) => this.mapDishWithRating(dish));
    }

    const ids = ordered.map((x) => x.dishId);

    dishes = await this.prisma.dish.findMany({
      where: {
        id: { in: ids },
        isAvailable: true,
      },
      include: {
        images: true,
        reviews: { select: { rating: true } },
      },
    });

    const order = new Map<number, number>();
    ids.forEach((id, index) => order.set(id, index));

    dishes.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

    return dishes.map((dish) => this.mapDishWithRating(dish));
  }

  // Gợi ý món ăn
  async recommend(clientId: number | undefined, dto: RecommendNewUserDto) {
    let history;

    if (clientId) {
      history = await this.interactionService.getRecommendationHistory(clientId);
    } else {
      history = dto.history;
    }

    const dishIds = await this.recommendationService.recommendNewUser({
      history,
      topK: dto.topK,
      excludeDishIds: dto.excludeDishIds,
    });

    if (dishIds.length === 0) {
      return [];
    }

    const dishes = await this.prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        isAvailable: true,
      },
      include: {
        images: true,
        reviews: { select: { rating: true } },
      },
    });

    const order = new Map<number, number>();
    dishIds.forEach((id, index) => {
      order.set(id, index);
    });

    dishes.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

    return dishes.map((dish) => this.mapDishWithRating(dish));
  }
}