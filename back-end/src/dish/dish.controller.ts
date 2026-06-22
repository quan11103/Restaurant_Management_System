import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dishes')
@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) { }

  @Post()
  @Auth(Role.MANAGER) // Chỉ Quản lý mới được thêm món vào Menu
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  // Khách và nhân viên xem được Menu
  @Get()
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER, Role.CLIENT)
  findAll(@Query('type') type?: string) { // Lọc theo loại
    return this.dishService.findAll(type);
  }

  @Get(':id')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER, Role.CLIENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.MANAGER) // Chỉ Quản lý mới được sửa giá hoặc tên món
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(id, updateDishDto);
  }

  @Delete(':id')
  @Auth(Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.remove(id);
  }
}