import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Đường dẫn PrismaService tùy project của bạn
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 1. Lấy danh sách đánh giá của 1 món ăn cụ thể
   */
  async getReviewsByDish(dishId: number, rating?: number) {
    // Kiểm tra món ăn có tồn tại không
    const dishExists = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });
    if (!dishExists) {
      throw new NotFoundException('Không tìm thấy món ăn!');
    }

    return this.prisma.review.findMany({
      where: {
        dishId,
        ...(rating ? { rating } : {}),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * 2. Lấy thống kê đánh giá của món ăn (Điểm trung bình, tổng số review, phân bố 1-5 sao)
   */
  async getDishReviewSummary(dishId: number) {
    const dishExists = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });
    if (!dishExists) {
      throw new NotFoundException('Không tìm thấy món ăn!');
    }

    // Tính điểm trung bình và tổng số review
    const aggregate = await this.prisma.review.aggregate({
      where: { dishId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Gom nhóm đếm số lượng cho từng mức sao (1 đến 5 sao)
    const groupByRating = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { dishId },
      _count: { rating: true },
    });

    // Khởi tạo bảng đếm 1-5 sao
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    groupByRating.forEach((item) => {
      breakdown[item.rating] = item._count.rating;
    });

    const averageRating = aggregate._avg.rating
      ? Number(aggregate._avg.rating.toFixed(1))
      : 0;

    return {
      dishId,
      totalReviews: aggregate._count.rating,
      averageRating,
      breakdown,
    };
  }

  /**
   * 3. Tạo/Cập nhật đánh giá & Đồng bộ bảng Interaction
   * Nếu người dùng đã đánh giá món ăn này rồi -> Chuyển sang Cập nhật (Update)
   */
  async create(createReviewDto: CreateReviewDto, clientId: number) {
    const { dishId, rating, comment } = createReviewDto;

    // Kiểm tra món ăn tồn tại
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });
    if (!dish) {
      throw new NotFoundException('Món ăn không tồn tại!');
    }

    // Tự động Cập nhật nếu bài đánh giá đã tồn tại, hoặc Tạo mới nếu chưa có
    const review = await this.prisma.review.upsert({
      where: {
        clientId_dishId: { clientId, dishId },
      },
      update: {
        rating,
        comment,
      },
      create: {
        dishId,
        clientId,
        rating,
        comment,
      },
      include: {
        client: {
          select: { id: true, fullName: true },
        },
        dish: {
          select: { id: true, name: true },
        },
      },
    });

    // Cập nhật/Tạo mới tương tác vào bảng Interaction (phục vụ Recommend System)
    await this.prisma.interaction.upsert({
      where: {
        clientId_dishId: { clientId, dishId },
      },
      update: { reviewScore: rating },
      create: { clientId, dishId, reviewScore: rating },
    });

    return review;
  }

  /**
   * 4. Xem danh sách đánh giá của chính khách hàng đang đăng nhập
   */
  async getReviewsByClient(clientId: number) {
    return this.prisma.review.findMany({
      where: { clientId },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              where: { isMain: true },
              take: 1,
              select: { imageUrl: true },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * 5. Lấy toàn bộ đánh giá trong hệ thống (Cho Admin / Manager)
   */
  async findAll() {
    return this.prisma.review.findMany({
      include: {
        client: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        dish: {
          select: { id: true, name: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * 6. Lấy chi tiết 1 bài đánh giá
   */
  async findOne(id: number) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, fullName: true },
        },
        dish: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 7. Cập nhật bài đánh giá theo ID bài viết
   */
  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!existingReview) {
      throw new NotFoundException('Không tìm thấy bài đánh giá!');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        client: { select: { id: true, fullName: true } },
        dish: { select: { id: true, name: true } },
      },
    });

    // Nếu người dùng có thay đổi số sao (rating), cập nhật lại bảng Interaction
    if (updateReviewDto.rating !== undefined) {
      await this.prisma.interaction.upsert({
        where: {
          clientId_dishId: {
            clientId: updatedReview.clientId,
            dishId: updatedReview.dishId,
          },
        },
        update: { reviewScore: updateReviewDto.rating },
        create: {
          clientId: updatedReview.clientId,
          dishId: updatedReview.dishId,
          reviewScore: updateReviewDto.rating,
        },
      });
    }

    return updatedReview;
  }

  /**
   * 8. Xóa bài đánh giá
   */
  async remove(id: number) {
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });
    if (!existingReview) {
      throw new NotFoundException('Không tìm thấy bài đánh giá!');
    }

    // Đặt lại reviewScore trong Interaction về null nếu bài đánh giá bị xóa
    await this.prisma.interaction.updateMany({
      where: {
        clientId: existingReview.clientId,
        dishId: existingReview.dishId,
      },
      data: { reviewScore: null },
    });

    return this.prisma.review.delete({
      where: { id },
    });
  }
}