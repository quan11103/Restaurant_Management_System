import { Controller, Get } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) { }

  @Get('dashboard-overview')
  @Auth(Role.MANAGER)
  @ApiOperation({
    summary: 'Lấy dữ liệu tổng quan cho trang Dashboard',
    description: 'Trả về 2 phần dữ liệu: Thống kê nhanh (Doanh thu, Đơn hàng, Khách hàng trong ngày) và Danh sách Top 5 món ăn bán chạy nhất.'
  })
  getDashboardOverview() {
    return this.statisticService.getDashboardOverview();
  }
}