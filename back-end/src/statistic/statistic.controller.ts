import { Controller, Get, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
}