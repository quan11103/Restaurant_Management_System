import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) { }

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { waiterId, tableId, items } = createOrderDto;

    // Tính tổng số lượng và tổng tiền
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      return await this.prisma.$transaction(async (tx) => {

        const newOrder = await tx.order.create({
          data: {
            waiterId: waiterId,
            orderType: 'DINE_IN',
            status: 'PENDING',
            totalQuantity: totalQuantity,
            total: totalAmount,
          },
        });

        // Gọi OrderTable để liên kết bàn
        await tx.orderTable.create({
          data: {
            orderId: newOrder.id,
            tableId: tableId,
            isPaid: false,
          },
        });

        // Gọi OrderedDish để lưu danh sách món ăn
        const orderedDishesData = items.map(item => ({
          orderId: newOrder.id,
          dishId: item.dishId,
          price: item.price,
          quantity: item.quantity,
          subTotal: item.price * item.quantity,
        }));

        await tx.orderedDish.createMany({
          data: orderedDishesData,
        });

        return {
          status: 'success',
          message: 'Tạo đơn hàng thành công',
          orderId: newOrder.id,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi lưu hóa đơn!');
    }
  }
}
