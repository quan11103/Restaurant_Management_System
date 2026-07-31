import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { DishService } from './dish.service';
import { DishQueryDto } from './dto/dish-query.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UseGuards } from '@nestjs/common';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RecommendNewUserDto } from '../recommendation/dto/recommend-new-user.dto';

@ApiTags('Dishes')
@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) { }

  @Post()
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Tạo món ăn mới (Chỉ Manager)' })
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách món ăn (Phân trang, lọc, tìm kiếm)' })
  findAll(@Query() query: DishQueryDto) {
    return this.dishService.findAll(query);
  }

  @Get("popular")
  getPopular(@Query("limit", new ParseIntPipe({ optional: true })) limit = 8) {
    return this.dishService.getPopular(limit);
  }

  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết món ăn theo ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.dishService.findOne(
      id,
      user?.sub,
    );
  }

  @Patch(':id')
  @Auth(Role.MANAGER)
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

  @Post('recommend')
  @UseGuards(OptionalJwtGuard)
  recommend(
    @CurrentUser() user: JwtPayload | undefined,
    @Body() dto: RecommendNewUserDto,
  ) {
    return this.dishService.recommend(user?.sub, dto);
  }
}