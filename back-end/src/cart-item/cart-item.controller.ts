import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('cart-item')
@UseGuards(JwtAuthGuard)
export class CartItemController {
  constructor(
    private readonly cartItemService: CartItemService,
  ) { }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartItemService.create(
      user.sub,
      createCartItemDto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cartItemService.findAll(
      user.sub,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartItemService.findOne(
      id,
      user.sub,
    );
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartItemService.update(
      id,
      user.sub,
      updateCartItemDto,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartItemService.remove(
      id,
      user.sub,
    );
  }

  @Delete('clear')
  clearCart(
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cartItemService.clearCart(
      user.sub,
    );
  }
}