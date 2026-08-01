import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '@prisma/client';

@Injectable()
export class StatisticService {
  constructor(private prisma: PrismaService) { }

  /**
   * API Tổng hợp dữ liệu cho Dashboard
   * Trả về đúng format cho 2 phần: Thống kê nhanh và Top món ăn
   */
  async getDashboardOverview() {
    const [stats, topDishesRaw] = await Promise.all([
      this.getQuickStats(),
      this.getTopDishes(5), // Lấy Top 5 món ăn
    ]);

    // Map lại dữ liệu Top món ăn để khớp với Frontend (RankedProductStat interface)
    const topDishes = topDishesRaw.map((dish: any, index: number) => ({
      id: String(dish.id),
      name: dish.name,
      imageUrl: dish.imageUrl || 'https://via.placeholder.com/40', // Fallback ảnh nếu món chưa có ảnh
      soldCount: Number(dish.soldCount || 0),
      revenue: Number(dish.revenue || 0),
      rank: index + 1,
    }));

    return {
      stats,
      topDishes,
    };
  }

  /**
   * 1. Lấy thống kê nhanh (Doanh thu hôm nay, Đơn hàng mới, Tổng khách hàng)
   */
  private async getQuickStats() {
    // Lấy thời gian bắt đầu và kết thúc của ngày hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [revenueAgg, newOrdersCount, totalCustomersCount] = await this.prisma.$transaction([
      // 1. Tính doanh thu hôm nay (Chỉ tính các đơn đã COMPLETED)
      this.prisma.order.aggregate({
        where: {
          orderTime: { gte: startOfDay, lte: endOfDay },
          status: OrderStatus.COMPLETED, // Sử dụng enum OrderStatus
        },
        _sum: { total: true },
      }),

      // 2. Đếm số lượng đơn hàng MỚI TẠO trong hôm nay
      this.prisma.order.count({
        where: {
          orderTime: { gte: startOfDay, lte: endOfDay },
        },
      }),

      // 3. Đếm tổng số lượng khách hàng trên hệ thống
      this.prisma.user.count({
        where: {
          role: Role.CLIENT // Sử dụng enum Role
        },
      }),
    ]);

    return {
      todayRevenue: revenueAgg._sum.total || 0,
      todayOrders: newOrdersCount,
      totalCustomers: totalCustomersCount,
    };
  }

  /**
   * 2. Lấy Top món ăn bán chạy nhất theo Doanh Thu
   */
  private async getTopDishes(limit: number) {
    // Sử dụng Raw SQL để xử lý GroupBy và Join một cách tối ưu nhất
    // - Liên kết OrderedDish với Order (để lọc đơn COMPLETED)
    // - Liên kết OrderedDish với Dish (để lấy tên món)
    // - Sub-query để lấy 1 imageUrl (ưu tiên isMain = true)

    const topDishes = await this.prisma.$queryRaw<any[]>`
      SELECT 
        d.id, 
        d.name,
        (
          SELECT di."imageUrl" 
          FROM "DishImage" di 
          WHERE di."dishId" = d.id 
          ORDER BY di."isMain" DESC 
          LIMIT 1
        ) AS "imageUrl",
        SUM(od.quantity)::int AS "soldCount", 
        SUM(od.quantity * od.price)::float AS revenue
      FROM "OrderedDish" od
      JOIN "Order" o ON od."orderId" = o.id
      JOIN "Dish" d ON od."dishId" = d.id
      WHERE o.status = 'COMPLETED'::"OrderStatus"
      GROUP BY d.id, d.name
      ORDER BY revenue DESC
      LIMIT ${limit};
    `;

    return topDishes;
  }
}