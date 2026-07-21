import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { DishService, DishQueryDto } from './dish.service';
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
  @ApiOperation({ summary: 'Tạo món ăn mới (Chỉ Manager)' })
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách món ăn (Phân trang, lọc, tìm kiếm)' })
  findAll(@Query() query: DishQueryDto) {
    return this.dishService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết món ăn theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.MANAGER) // Chỉ Quản lý mới được sửa giá hoặc tên món
  @ApiOperation({ summary: 'Cập nhật món ăn (Chỉ Manager)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
  ) {
    return this.dishService.update(id, updateDishDto);
  }

  @Delete(':id')
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Xóa món ăn (Chỉ Manager)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.remove(id);
  }
}