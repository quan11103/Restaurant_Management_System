import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GoodsBillService } from './goods-bill.service';
import { CreateGoodsBillDto } from './dto/create-goods-bill.dto';
import { UpdateGoodsBillDto } from './dto/update-goods-bill.dto';

@Controller('goods-bill')
export class GoodsBillController {
  constructor(private readonly goodsBillService: GoodsBillService) { }

  @Post()
  createGoodsBill(@Body() dto: CreateGoodsBillDto) {
    return this.goodsBillService.createGoodsBill(dto);
  }

  @Get()
  findAll() {
    return this.goodsBillService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goodsBillService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGoodsBillDto: UpdateGoodsBillDto) {
    return this.goodsBillService.update(+id, updateGoodsBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goodsBillService.remove(+id);
  }
}
