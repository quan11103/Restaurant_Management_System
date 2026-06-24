import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tables')
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) { }

  @Post()
  @Auth(Role.MANAGER)
  create(@Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  @Get()
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  findAll() {
    return this.tableService.findAll();
  }

  // Lấy danh sách bàn theo trạng thái
  @Get('status')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  getTableByStatus(@Query('isOccupied') isOccupied: string) {
    const status = isOccupied === 'true';
    return this.tableService.getTableByStatus(status);
  }

  @Get(':id')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tableService.findOne(id);
  }

  // Cập nhật trạng thái
  @Patch(':id/status')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  updateStatus(
    @Param('id') id: string,
    @Body('isOccupied') isOccupied: boolean
  ) {
    return this.tableService.updateStatus(Number(id), isOccupied);
  }

  @Patch(':id')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTableDto: UpdateTableDto) {
    return this.tableService.update(id, updateTableDto);
  }

  @Delete(':id')
  @Auth(Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tableService.remove(id);
  }
}