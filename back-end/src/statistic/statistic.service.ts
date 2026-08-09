import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '@prisma/client';
import { TimePeriod } from './statistic.controller';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class StatisticService {
  constructor(private prisma: PrismaService) { }

  // API Tổng hợp dữ liệu cho Dashboard
  // Trả về đúng format cho 2 phần: Thống kê nhanh và Top món ăn
  async getDashboardOverview() {
    const [stats, topDishesRaw] = await Promise.all([
      this.getQuickStats(),
      this.getTopDishes(5),
    ]);

    const topDishes = topDishesRaw.map((dish: any, index: number) => ({
      id: String(dish.id),
      name: dish.name,
      imageUrl: dish.imageUrl || 'https://via.placeholder.com/40',
      soldCount: Number(dish.soldCount || 0),
      revenue: Number(dish.revenue || 0),
      rank: index + 1,
    }));

    return {
      stats,
      topDishes,
    };
  }

  // Lấy thống kê nhanh (Doanh thu hôm nay, Đơn hàng mới, Tổng khách hàng)
  private async getQuickStats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [revenueAgg, newOrdersCount, totalCustomersCount] = await this.prisma.$transaction([
      // Tính doanh thu hôm nay (Chỉ tính các đơn đã COMPLETED)
      this.prisma.order.aggregate({
        where: {
          orderTime: { gte: startOfDay, lte: endOfDay },
          status: OrderStatus.COMPLETED,
        },
        _sum: { total: true },
      }),

      // Đếm số lượng đơn hàng trong hôm nay
      this.prisma.order.count({
        where: {
          orderTime: { gte: startOfDay, lte: endOfDay },
        },
      }),

      // Đếm tổng số lượng khách hàng trên hệ thống
      this.prisma.user.count({
        where: {
          role: Role.CLIENT
        },
      }),
    ]);

    return {
      todayRevenue: revenueAgg._sum.total || 0,
      todayOrders: newOrdersCount,
      totalCustomers: totalCustomersCount,
    };
  }

  // Lấy top món ăn bán chạy nhất theo Doanh Thu
  private async getTopDishes(limit: number) {
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

  async getRevenueChart(period: TimePeriod) {
    const now = new Date();

    switch (period) {
      case 'day':
        return this.getRevenueByDays(now, 7); // 7 ngày qua
      case 'week':
        return this.getRevenueByWeeks(now, 4); // 4 tuần qua
      case 'month':
        return this.getRevenueByMonths(now, 6); // 6 tháng qua
      case 'year':
        return this.getRevenueByYears(now, 3); // 3 năm qua
      default:
        throw new BadRequestException('Mốc thời gian không hợp lệ');
    }
  }

  async getProductOrders(productId: string, limit: number = 10, page: number = 1) {
    const dishIdNum = parseInt(productId, 10);

    if (isNaN(dishIdNum)) {
      throw new BadRequestException('Mã món ăn không hợp lệ');
    }

    // Đảm bảo limitNum và pageNum luôn luôn là kiểu number nguyên bản, tránh bị NaN hoặc string
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 10);
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const skip = (pageNum - 1) * limitNum;

    // Sử dụng transaction để lấy song song cả tổng số lượng và dữ liệu
    const [totalRecords, orders] = await this.prisma.$transaction([
      this.prisma.order.count({
        where: {
          orderedDishes: {
            some: { dishId: dishIdNum }
          }
        }
      }),

      this.prisma.order.findMany({
        where: {
          orderedDishes: {
            some: { dishId: dishIdNum }
          }
        },
        include: {
          client: {
            select: { fullName: true, phone: true }
          }
        },
        orderBy: {
          orderTime: 'desc'
        },
        skip: skip,
        take: limitNum, // Sử dụng limitNum đã ép kiểu chắc chắn là number
      })
    ]);

    // Map dữ liệu khớp với Interface OrderItem trên frontend
    const mappedOrders = orders.map(order => {
      const name = order.receiverName || order.client?.fullName || '';
      const phone = order.receiverPhone || order.client?.phone || '';

      return {
        id: order.id,
        receiverName: name,
        receiverPhone: phone,
        orderTime: order.orderTime,
        total: order.total,
        status: order.status,
      };
    });

    return {
      data: mappedOrders,
      meta: {
        total: totalRecords,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRecords / limitNum)
      }
    };
  }

  // --- CÁC HÀM XỬ LÝ RIÊNG BIỆT BIỂU ĐỒ (Giữ nguyên của bạn) ---

  private async getRevenueByDays(now: Date, limit: number) {
    const result = [];
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    for (let i = limit - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1, 0, 0, 0);

      const aggregate = await this.prisma.order.aggregate({
        _sum: {
          total: true, // Tính tổng trường total trong model Order
        },
        where: {
          bill: {
            paymentStatus: PaymentStatus.PAID,
            paymentTime: { gte: start, lt: end },
          },
        },
      });

      result.push({
        date: dayNames[start.getDay()],
        revenue: aggregate._sum.total || 0,
      });
    }
    return result;
  }

  private async getRevenueByWeeks(now: Date, limit: number) {
    const result = [];
    for (let i = limit - 1; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 7);

      const aggregate = await this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          bill: {
            paymentStatus: PaymentStatus.PAID,
            paymentTime: { gte: start, lt: end },
          },
        },
      });

      const labels = ['3 tuần trước', '2 tuần trước', 'Tuần trước', 'Tuần này'];

      result.push({
        date: labels[limit - 1 - i],
        revenue: aggregate._sum.total || 0,
      });
    }
    return result;
  }

  private async getRevenueByMonths(now: Date, limit: number) {
    const result = [];
    for (let i = limit - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const aggregate = await this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          bill: {
            paymentStatus: PaymentStatus.PAID,
            paymentTime: { gte: start, lt: end },
          },
        },
      });

      result.push({
        date: `Thg ${start.getMonth() + 1}`,
        revenue: aggregate._sum.total || 0,
      });
    }
    return result;
  }

  private async getRevenueByYears(now: Date, limit: number) {
    const result = [];
    for (let i = limit - 1; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);

      const aggregate = await this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          bill: {
            paymentStatus: PaymentStatus.PAID,
            paymentTime: { gte: start, lt: end },
          },
        },
      });

      result.push({
        date: `${year}`,
        revenue: aggregate._sum.total || 0,
      });
    }
    return result;
  }
}