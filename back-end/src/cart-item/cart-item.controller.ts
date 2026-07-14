import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart-item')
@UseGuards(JwtAuthGuard)
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) { }

  @Post()
  create(@Req() req: any, @Body() createCartItemDto: CreateCartItemDto) {
    // Lấy id của user đang đăng nhập từ token (passport/jwt tự động gán vào req.user)
    const clientId = req.user.sub;
    return this.cartItemService.create(clientId, createCartItemDto);
  }

  @Get()
  findAll(@Req() req: any) {
    // Chỉ lấy các món trong giỏ hàng của chính user đang gọi API
    const clientId = req.user.id;
    return this.cartItemService.findAll(clientId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    // Kiểm tra xem món này có đúng là thuộc giỏ hàng của user này không
    const clientId = req.user.id;
    return this.cartItemService.findOne(+id, clientId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto
  ) {
    const clientId = req.user.id;
    return this.cartItemService.update(+id, clientId, updateCartItemDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const clientId = req.user.id;
    return this.cartItemService.remove(+id, clientId);
  }

  @Delete('clear')
  clearCart(@Req() req: any) {
    const clientId = req.user.sub;
    return this.cartItemService.clearCart(clientId);
  }
}