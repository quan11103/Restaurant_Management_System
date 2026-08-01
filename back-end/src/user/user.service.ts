import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';

// Whitelist các trường được phép sắp xếp để tránh Prisma bị crash khi truyền sai sortBy
const ALLOWED_SORT_FIELDS = ['id', 'username', 'fullName', 'email', 'role'];

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  //Helper function: Loại bỏ trường password trước khi trả data về cho client
  private excludePassword(user: any) {
    if (!user) return user;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Lấy danh sách người dùng (Tìm kiếm, Lọc, Sắp xếp, Phân trang)
  async findAll(query: UserQueryDto) {
    const {
      search,
      role,
      sortBy = 'id',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.UserWhereInput = {};

    if (role && role !== 'Tất cả') {
      where.role = role as Role;
    }

    // Tìm kiếm từ khóa (Theo username, fullName, email hoặc phone)
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderBy = { [validSortBy]: validSortOrder };

    // Transaction lấy tổng số lượng và danh sách song song
    const [users, totalRecords] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        // BỔ SUNG: Include đếm số lượng đơn hàng và đánh giá
        include: {
          _count: {
            select: {
              clientOrders: true,
              clientReviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNumber,
      }),
      this.prisma.user.count({ where }),
    ]);

    const mappedUsers = users.map((user) => this.excludePassword(user));

    return {
      data: mappedUsers,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalRecords / limitNumber) || 1,
        totalRecords,
      },
    };
  }

  // Tìm người dùng theo ID
  async findOne(id: number | string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID người dùng không hợp lệ!');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID = ${numericId}`);
    }

    return this.excludePassword(user);
  }

  // Tạo người dùng mới
  async create(createUserDto: CreateUserDto) {
    const { username, password, email, phone, fullName, role, address, position, description } = createUserDto as any;

    const orConditions: Prisma.UserWhereInput[] = [{ username }];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    const existUser = await this.prisma.user.findFirst({
      where: { OR: orConditions },
    });

    if (existUser) {
      if (existUser.username === username) throw new ConflictException(`Tên đăng nhập '${username}' đã tồn tại!`);
      if (email && existUser.email === email) throw new ConflictException(`Email '${email}' đã được sử dụng!`);
      if (phone && existUser.phone === phone) throw new ConflictException(`Số điện thoại '${phone}' đã được sử dụng!`);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          phone,
          fullName,
          address,
          position,
          description,
          role: role || 'CLIENT',
        },
      });

      return this.excludePassword(newUser);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Có lỗi xảy ra khi tạo người dùng!');
    }
  }

  // Cập nhật thông tin người dùng
  async update(id: number | string, updateUserDto: UpdateUserDto) {
    const numericId = Number(id);
    await this.findOne(numericId); // Báo lỗi 404 nếu không tồn tại

    const { username, password, email, phone, fullName, role, address, position, description } = updateUserDto as any;

    // Kiểm tra trùng lặp thông tin nếu có cập nhật
    const orConditions: Prisma.UserWhereInput[] = [];
    if (username) orConditions.push({ username });
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    if (orConditions.length > 0) {
      const existUser = await this.prisma.user.findFirst({
        where: {
          OR: orConditions,
          NOT: { id: numericId },
        },
      });

      if (existUser) {
        if (username && existUser.username === username) throw new ConflictException(`Tên đăng nhập '${username}' đã tồn tại!`);
        if (email && existUser.email === email) throw new ConflictException(`Email '${email}' đã được sử dụng!`);
        if (phone && existUser.phone === phone) throw new ConflictException(`Số điện thoại '${phone}' đã được sử dụng!`);
      }
    }

    // Mã hóa mật khẩu nếu có nhập mật khẩu mới
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: numericId },
      data: {
        ...(username && { username }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(fullName && { fullName }),
        ...(role && { role }),
        ...(address !== undefined && { address }),
        ...(position !== undefined && { position }),
        ...(description !== undefined && { description }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return this.excludePassword(updatedUser);
  }

  // Xóa người dùng (Bắt lỗi Ràng buộc dữ liệu)
  async remove(id: number | string) {
    const numericId = Number(id);
    await this.findOne(numericId); // Check tồn tại

    try {
      await this.prisma.user.delete({
        where: { id: numericId },
      });

      return {
        status: 'success',
        message: 'Xóa tài khoản người dùng thành công!',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('Không thể xóa tài khoản này do đã có dữ liệu liên quan (Đơn hàng, Hóa đơn, Đánh giá)!');
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi xóa người dùng!');
    }
  }

  // Xem chi tiết hồ sơ Khách hàng (Dành cho Admin Dashboard)
  async findCustomerDetail(id: number | string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ!');
    }

    // 1. Lấy thông tin cơ bản và lịch sử hoạt động gần nhất (Dùng 1 query duy nhất)
    const customer = await this.prisma.user.findUnique({
      where: {
        id: numericId,
        // Đảm bảo chỉ lấy data nếu user này là CLIENT
        role: 'CLIENT'
      },
      include: {
        // Đếm tổng số lượng đơn hàng và đánh giá
        _count: {
          select: {
            clientOrders: true,
            clientReviews: true,
          },
        },

        // Lấy 5 đơn hàng gần nhất của khách này
        clientOrders: {
          take: 5,
          orderBy: { orderTime: 'desc' },
          select: {
            id: true,
            orderTime: true,
            orderType: true, // DINE_IN hay DELIVERY
            status: true,
            total: true,
            totalQuantity: true,
            // Kéo theo trạng thái thanh toán từ bảng Bill
            bill: {
              select: {
                paymentStatus: true,
                paymentMethod: true,
              }
            }
          },
        },

        // Lấy 5 đánh giá gần nhất
        clientReviews: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            updatedAt: true,
            dish: {
              select: { id: true, name: true } // Biết khách đánh giá món nào
            }
          }
        },

        // Ứng dụng bảng Interaction: Lấy Top 5 món khách hay mua / tương tác nhất
        interactions: {
          take: 5,
          orderBy: { orderedQuantity: 'desc' },
          where: { orderedQuantity: { gt: 0 } }, // Chỉ lấy những món thực sự đã mua
          select: {
            orderedQuantity: true,
            viewCount: true,
            dish: {
              select: { id: true, name: true, price: true }
            }
          }
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng (CLIENT) có ID = ${numericId}`);
    }

    // 2. Tính tổng tiền khách đã chi tiêu (Chỉ tính các đơn đã COMPLETED hoặc bill đã PAID)
    // Vì array clientOrders ở trên chỉ lấy 5 đơn, nên ta cần 1 query aggregate riêng cho tổng tiền
    const aggregateData = await this.prisma.order.aggregate({
      where: {
        clientId: numericId,
        status: 'COMPLETED' // Chỉ tính tiền những đơn thành công
      },
      _sum: {
        total: true
      },
      _count: {
        _all: true
      }
    });

    const totalSpent = aggregateData._sum.total || 0;
    const totalCompletedOrders = aggregateData._count._all;

    // 3. Format lại data trả về cho Frontend dễ map UI
    const customerWithoutPassword = this.excludePassword(customer);

    return {
      profile: {
        id: customerWithoutPassword.id,
        username: customerWithoutPassword.username,
        fullName: customerWithoutPassword.fullName,
        email: customerWithoutPassword.email,
        phone: customerWithoutPassword.phone,
        address: customerWithoutPassword.address, // Field dành riêng cho Client
        role: customerWithoutPassword.role,
      },
      statistics: {
        totalOrders: totalCompletedOrders, // Tổng số đơn đã hoàn thành
        totalReviews: customer._count.clientReviews,
        totalSpent: totalSpent, // Tổng doanh thu mang lại
      },
      recentOrders: customer.clientOrders,
      recentReviews: customer.clientReviews,
      favoriteDishes: customer.interactions.map(interaction => ({
        dishId: interaction.dish.id,
        dishName: interaction.dish.name,
        price: interaction.dish.price,
        timesOrdered: interaction.orderedQuantity,
        views: interaction.viewCount,
      })),
    };
  }
}