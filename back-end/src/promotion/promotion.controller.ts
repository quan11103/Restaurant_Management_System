import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo mã khuyến mãi mới (Admin)' })
  @Auth(Role.MANAGER)
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả khuyến mãi (Admin/Nhân viên)' })
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  findAll() {
    return this.promotionService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Kiểm tra mã giảm giá và tính số tiền khấu trừ cho giỏ hàng' })
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER, Role.CLIENT)
  findByCode(
    @Param('code') code: string,
    @Query('total') total?: string
  ) {
    if (total) {
      return this.promotionService.validateAndCalculate(code, Number(total));
    }
    return this.promotionService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết khuyến mãi theo ID' })
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promotionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin khuyến mãi theo ID (Admin)' })
  @Auth(Role.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mã khuyến mãi theo ID (Admin)' })
  @Auth(Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionService.remove(id);
  }
}