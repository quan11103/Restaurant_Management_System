import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { IngredientSupplierService } from './ingredient-supplier.service';
import { CreateIngredientSupplierDto } from './dto/create-ingredient-supplier.dto';
import { UpdateIngredientSupplierDto } from './dto/update-ingredient-supplier.dto';

@Controller('ingredient-supplier')
export class IngredientSupplierController {
  constructor(private readonly ingredientSupplierService: IngredientSupplierService) { }

  @Get('search')
  searchIngredientSupplier(
    @Query('supplierId', ParseIntPipe) supplierId: number,
    @Query('keyword') keyword: string,
  ) {
    return this.ingredientSupplierService.searchIngredientSupplier(supplierId, keyword);
  }

  @Post()
  create(@Body() createIngredientSupplierDto: CreateIngredientSupplierDto) {
    return this.ingredientSupplierService.create(createIngredientSupplierDto);
  }

  @Get()
  findAll() {
    return this.ingredientSupplierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingredientSupplierService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngredientSupplierDto: UpdateIngredientSupplierDto) {
    return this.ingredientSupplierService.update(+id, updateIngredientSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingredientSupplierService.remove(+id);
  }
}
