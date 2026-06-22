import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
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
  @Auth(Role.MANAGER)
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Get()
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER, Role.CLIENT) // Cho phép nhiều role xem mã
  findAll() {
    return this.promotionService.findAll();
  }

  @Get(':id')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER, Role.CLIENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promotionService.findOne(id);
  }

  // Lấy khuyến mãi theo mã Code
  @Get('code/:code')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER, Role.CLIENT)
  findByCode(@Param('code') code: string) {
    return this.promotionService.findByCode(code);
  }

  @Patch(':id')
  @Auth(Role.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @Auth(Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionService.remove(id);
  }
}