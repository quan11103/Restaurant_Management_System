import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { InteractionService } from 'src/interaction/interaction.service';

@Injectable()
export class CartItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly interactionService: InteractionService,
  ) { }

  async create(clientId: number, createCartItemDto: CreateCartItemDto) {
    const { dishId, quantity = 1 } = createCartItemDto;

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        clientId_dishId: {
          clientId,
          dishId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      cartItem = await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      cartItem = await this.prisma.cartItem.create({
        data: {
          clientId,
          dishId,
          quantity,
        },
      });
    }

    await this.interactionService.syncCartQuantity(
      clientId,
      dishId,
      quantity
    );

    return cartItem;
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

  async update(
    id: number,
    clientId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {

    const cartItem = await this.findOne(id, clientId);

    const updated = await this.prisma.cartItem.update({
      where: { id },
      data: {
        quantity: updateCartItemDto.quantity,
      },
    });

    await this.interactionService.syncCartQuantity(
      clientId,
      cartItem.dishId,
      updateCartItemDto.quantity,
    );

    return updated;
  }

  async remove(
    id: number,
    clientId: number,
  ) {

    const cartItem = await this.findOne(id, clientId);

    await this.prisma.cartItem.delete({
      where: {
        id,
      },
    });

    await this.interactionService.syncCartQuantity(
      clientId,
      cartItem.dishId,
      0,
    );

    return {
      message: 'Đã xóa món khỏi giỏ hàng.',
    };
  }

  async clearCart(clientId: number) {

    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        clientId,
      },
      select: {
        dishId: true,
      },
    });

    await this.prisma.cartItem.deleteMany({
      where: {
        clientId,
      },
    });

    for (const item of cartItems) {
      await this.interactionService.syncCartQuantity(
        clientId,
        item.dishId,
        0
      );
    }

    return {
      message: 'Đã xóa toàn bộ giỏ hàng.',
    };
  }
}