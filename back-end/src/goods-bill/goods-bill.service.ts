import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGoodsBillDto } from './dto/create-goods-bill.dto';
import { UpdateGoodsBillDto } from './dto/update-goods-bill.dto';

@Injectable()
export class GoodsBillService {
  constructor(private prisma: PrismaService) { }
  async createGoodsBill(dto: CreateGoodsBillDto) {
    const { warehouseStaffId, items } = dto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Phiếu nhập kho phải có ít nhất một nguyên liệu.');
    }

    // Tính toán tổng tiền và tổng số lượng
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Transaction
    return this.prisma.$transaction(async (tx) => {

      // Cập nhật số lượng
      for (const item of items) {
        // Tìm thông tin liên kết để lấy ingredientId
        const ingSup = await tx.ingredientSupplier.findUnique({
          where: { id: item.ingredientSupplierId },
          select: { ingredientId: true },
        });

        if (!ingSup) {
          throw new BadRequestException(`Không tìm thấy nguyên liệu có ID: ${item.ingredientSupplierId}`);
        }

        // Cộng số lượng vào bảng IngredientSupplier
        await tx.ingredientSupplier.update({
          where: { id: item.ingredientSupplierId },
          data: {
            quantity: { increment: item.quantity },
          },
        });

        // Cộng dồn số lượng tổng vào bảng Ingredient
        await tx.ingredient.update({
          where: { id: ingSup.ingredientId },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      // Tạo phiếu nhập
      const newGoodsBill = await tx.goodsBill.create({
        data: {
          warehouseStaffId: warehouseStaffId,
          totalQuantity: totalQuantity,
          total: totalAmount,
        },
      });

      // Tạo chi tiết phiếu nhập
      const goodsBillDetailsData = items.map(item => ({
        goodsBillId: newGoodsBill.id,
        ingredientSupplierId: item.ingredientSupplierId,
        price: item.price,
        quantity: item.quantity,
        subTotal: item.price * item.quantity,
      }));

      await tx.goodsBillDetail.createMany({
        data: goodsBillDetailsData,
      });

      // Trả kết quả thành công
      return {
        success: true,
        message: 'Tạo phiếu nhập và cập nhật tồn kho thành công',
        goodsBillId: newGoodsBill.id,
      };
    });
  }

  create(createGoodsBillDto: CreateGoodsBillDto) {
    return 'This action adds a new goodsBill';
  }

  findAll() {
    return `This action returns all goodsBill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} goodsBill`;
  }

  update(id: number, updateGoodsBillDto: UpdateGoodsBillDto) {
    return `This action updates a #${id} goodsBill`;
  }

  remove(id: number) {
    return `This action removes a #${id} goodsBill`;
  }
}
