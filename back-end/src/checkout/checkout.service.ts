import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateCheckoutDto } from './dto/update-checkout.dto';
import { ConfirmCheckoutDto } from './dto/confirm-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) { }

  create(createCheckoutDto: CreateCheckoutDto) {
    return 'This action adds a new checkout';
  }

  findAll() {
    return `This action returns all checkout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checkout`;
  }

  update(id: number, updateCheckoutDto: UpdateCheckoutDto) {
    return `This action updates a #${id} checkout`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkout`;
  }

  // Tìm OrderTable chưa thanh toán và lấy chi tiết Order
  async getOrderByTable(tableId: number) {
    const activeOrderTable = await this.prisma.orderTable.findFirst({
      where: {
        tableId: tableId,
        isPaid: false, // Chỉ lấy phiên ngồi chưa thanh toán
      },
      include: {
        order: {
          include: {
            orderedDishes: {
              include: { dish: true } // Lấy kèm thông tin món ăn để hiển thị chi tiết
            }
          }
        }
      }
    });

    if (!activeOrderTable) {
      throw new NotFoundException('Bàn này hiện không có hóa đơn nào cần thanh toán!');
    }

    return activeOrderTable;
  }

  async confirmCheckout(dto: ConfirmCheckoutDto) {
    const { orderTableId, orderId, tableId, cashierId, paymentMethod, promotionId, discountAmount, finalTotal } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Cập nhật trạng thái Table
      await tx.table.update({
        where: { id: tableId },
        data: { isOccupied: false }
      });

      // Cập nhật trạng thái OrderTable
      await tx.orderTable.update({
        where: { id: orderTableId },
        data: { isPaid: true }
      });

      // Cập nhật trạng thái Order
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
      });

      // Tạo Bill mới
      const newBill = await tx.bill.create({
        data: {
          orderId: orderId,
          cashierId: cashierId,
          promotionId: promotionId || null,
          paymentMethod: paymentMethod,
          discount: discountAmount,
          total: finalTotal,
        }
      });

      // Cập nhật số lượt đã dùng của Promotion (nếu có)
      if (promotionId) {
        await tx.promotion.update({
          where: { id: promotionId },
          data: { usedCount: { increment: 1 } }
        });
      }

      return {
        success: true,
        message: 'Thanh toán và giải phóng bàn thành công!',
        billId: newBill.id
      };
    });
  }
}
