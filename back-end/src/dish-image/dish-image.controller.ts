import { Controller, Get, Post, Body, Param, Delete, Query, Patch, ParseIntPipe } from '@nestjs/common';
import { DishImageService } from './dish-image.service';
import { CreateDishImageDto } from './dto/create-dish-image.dto';
import { UpdateDishImageDto } from './dto/update-dish-image.dto';

@Controller('dish-image')
export class DishImageController {
  constructor(private readonly dishImageService: DishImageService) { }

  @Post()
  create(@Body() createDishImageDto: CreateDishImageDto) {
    return this.dishImageService.create(createDishImageDto);
  }

  @Get()
  findAll(@Query('dishId') dishId?: string) {
    return this.dishImageService.findAll(dishId ? +dishId : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishImageService.findOne(id);
  }

  // Đặt 1 ảnh làm ảnh chính
  @Patch(':id/set-main')
  setMainImage(
    @Param('id', ParseIntPipe) id: number,
    @Body('dishId', ParseIntPipe) dishId: number,
  ) {
    return this.dishImageService.setMainImage(id, dishId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dishImageService.remove(id);
  }
}
