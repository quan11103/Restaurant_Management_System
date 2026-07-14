import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartItemService {
  constructor(private readonly prisma: PrismaService) { }

  async create(clientId: number, createCartItemDto: CreateCartItemDto) {
    const { dishId, quantity = 1 } = createCartItemDto;

    // Kiểm tra xem món ăn này đã có trong giỏ hàng của user chưa
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        clientId_dishId: {
          clientId,
          dishId,
        },
      },
    });

    if (existingCartItem) {
      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        clientId,
        dishId,
        quantity,
      },
    });
  }

  async findAll(clientId: number) {
    return this.prisma.cartItem.findMany({
      where: { clientId },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              where: { isMain: true },
              take: 1
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, clientId: number) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id, clientId },
      include: { dish: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Không tìm thấy món ăn này trong giỏ hàng của bạn');
    }

    return cartItem;
  }

  async update(id: number, clientId: number, updateCartItemDto: UpdateCartItemDto) {
    await this.findOne(id, clientId);

    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity: updateCartItemDto.quantity },
    });
  }

  async remove(id: number, clientId: number) {
    // Đảm bảo quyền sở hữu trước khi xóa
    await this.findOne(id, clientId);

    return this.prisma.cartItem.delete({
      where: { id },
    });
  }

  async clearCart(clientId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { clientId },
    });
  }
}