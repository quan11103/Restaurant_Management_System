import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InteractionService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async viewDish(
    clientId: number,
    dishId: number,
  ) {
    return this.prisma.interaction.upsert({
      where: {
        clientId_dishId: {
          clientId,
          dishId,
        },
      },
      create: {
        clientId,
        dishId,
        viewCount: 1,
      },
      update: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async syncCartQuantity(
    clientId: number,
    dishId: number,
    quantity: number
  ) {

    await this.prisma.interaction.upsert({

      where: {
        clientId_dishId: {
          clientId,
          dishId,
        },
      },

      create: {
        clientId,
        dishId,
        cartQuantity: quantity,
      },

      update: {
        cartQuantity: quantity,
      },
    });
  }

  async increaseOrderedQuantity(
    clientId: number,
    dishId: number,
    quantity: number,
  ) {
    return this.prisma.interaction.upsert({
      where: {
        clientId_dishId: {
          clientId,
          dishId,
        },
      },
      create: {
        clientId,
        dishId,
        orderedQuantity: quantity,
      },
      update: {
        orderedQuantity: {
          increment: quantity,
        },
      },
    });
  }

  // async updateReviewRating(
  //   clientId: number,
  //   dishId: number,
  //   rating: number,
  // ) {
  //   return this.prisma.interaction.upsert({
  //     where: {
  //       clientId_dishId: {
  //         clientId,
  //         dishId,
  //       },
  //     },
  //     create: {
  //       clientId,
  //       dishId,
  //       reviewRating: rating,
  //     },
  //     update: {
  //       reviewRating: rating,
  //     },
  //   });
  // }

  async getRecommendationHistory(clientId: number) {
    const interactions = await this.prisma.interaction.findMany({
      where: {
        clientId,
      },
      select: {
        dishId: true,
        viewCount: true,
        cartQuantity: true,
        orderedQuantity: true,
      },
    });

    return interactions
      .map((item) => ({
        dishId: item.dishId,
        interaction:
          item.viewCount * 50 +
          item.cartQuantity * 60 +
          item.orderedQuantity * 70,
      }))
      .filter((item) => item.interaction > 0);
  }

  findAll() {
    return `This action returns all interaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} interaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} interaction`;
  }
}
