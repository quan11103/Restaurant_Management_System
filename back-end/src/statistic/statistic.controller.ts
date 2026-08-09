import { Controller, Get, Query, Param } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) { }

  @Get('dashboard-overview')
  @Auth(Role.MANAGER)
  @ApiOperation({
    summary: 'Lấy dữ liệu tổng quan cho trang Dashboard',
    description: 'Trả về 2 phần dữ liệu: Thống kê nhanh và Danh sách Top 5 món ăn bán chạy nhất.'
  })
  getDashboardOverview() {
    return this.statisticService.getDashboardOverview();
  }

  @Get('revenue-chart')
  @Auth(Role.MANAGER)
  @ApiOperation({
    summary: 'Lấy dữ liệu biểu đồ doanh thu',
    description: 'Trả về mảng dữ liệu doanh thu dựa trên mốc thời gian: day, week, month, year.'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Mốc thời gian thống kê. Mặc định là "day".'
  })
  getRevenueChart(@Query('period') period: TimePeriod = 'day') {
    return this.statisticService.getRevenueChart(period);
  }

  // --- ENDPOINT MỚI THÊM VÀO ---
  @Get('product/:productId/orders')
  @Auth(Role.MANAGER)
  @ApiOperation({
    summary: 'Lấy danh sách đơn hàng theo món ăn',
    description: 'Trả về danh sách các đơn hàng đã đặt món ăn này (dùng cho Modal hiển thị chi tiết trên Dashboard).'
  })
  @ApiParam({
    name: 'productId',
    type: 'string',
    required: true,
    description: 'ID của món ăn cần truy vấn danh sách đơn hàng'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng đơn hàng hiển thị trên 1 trang (Mặc định: 10)'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang hiện tại (Mặc định: 1)'
  })
  getProductOrders(
    @Param('productId') productId: string,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1
  ) {
    // Chuyển đổi limit và page sang kiểu số nguyên (để phòng trường hợp query string truyền vào là chuỗi)
    return this.statisticService.getProductOrders(
      productId,
      Number(limit),
      Number(page)
    );
  }
}