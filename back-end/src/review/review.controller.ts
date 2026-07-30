import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, NotFoundException, ForbiddenException, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from '@prisma/client';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  /**
   * 1. Lấy danh sách đánh giá của 1 món ăn cụ thể (Công khai - Cho trang chi tiết món ăn)
   * GET /reviews/dish/5
   * GET /reviews/dish/5?rating=5 (Lọc các bài 5 sao)
   */
  @Get('dish/:dishId')
  async getReviewsByDish(
    @Param('dishId', ParseIntPipe) dishId: number,
    @Query('rating') rating?: string,
  ) {
    const selectedRating = rating ? Number(rating) : undefined;
    return this.reviewService.getReviewsByDish(dishId, selectedRating);
  }

  /**
   * 2. Lấy thống kê đánh giá món ăn (Tổng số review, sao trung bình, số lượng từng mức sao 1-5)
   * GET /reviews/dish/5/summary
   */
  @Get('dish/:dishId/summary')
  async getDishReviewSummary(@Param('dishId', ParseIntPipe) dishId: number) {
    return this.reviewService.getDishReviewSummary(dishId);
  }

  /**
   * 3. Khách hàng gửi đánh giá mới cho món ăn
   * POST /reviews
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const clientId = user.sub; // Lấy ID khách hàng từ JWT token
    return this.reviewService.create(createReviewDto, clientId);
  }

  /**
   * 4. Xem danh sách các bài đánh giá do CHÍNH KHÁCH HÀNG ĐANG ĐĂNG NHẬP đã viết
   * GET /reviews/my-reviews
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@CurrentUser() user: JwtPayload) {
    const clientId = user.sub;
    return this.reviewService.getReviewsByClient(clientId);
  }

  /**
   * 5. Lấy toàn bộ đánh giá trong hệ thống (Dành riêng cho Admin / Quản lý kiểm duyệt)
   * GET /reviews/admin/all
   */
  @Auth(Role.MANAGER)
  @Get('admin/all')
  async getAllReviewsForAdmin() {
    return this.reviewService.findAll();
  }

  /**
   * 6. Lấy chi tiết 1 bài đánh giá
   * GET /reviews/10
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewService.findOne(id);
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá này!');
    }
    return review;
  }

  /**
   * 7. Chỉnh sửa nội dung / số sao đánh giá (Chỉ tác giả bài viết mới được sửa)
   * PATCH /reviews/10
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.reviewService.findOne(id);
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá này!');
    }

    if (review.clientId !== user.sub) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài đánh giá này!');
    }

    return this.reviewService.update(id, updateReviewDto);
  }

  /**
   * 8. Xóa bài đánh giá (Chỉ Tác giả HOẶC Quản lý/Admin mới có quyền xóa)
   * DELETE /reviews/10
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const review = await this.reviewService.findOne(id);
    if (!review) {
      throw new NotFoundException('Không tìm thấy bài đánh giá này!');
    }

    const isOwner = review.clientId === user.sub;
    const isManager = user.role === Role.MANAGER;

    if (!isOwner && !isManager) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đánh giá này!');
    }

    return this.reviewService.remove(id);
  }
}