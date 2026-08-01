import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của người dùng hiện tại' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findOne(user.sub);
  }

  @Patch('me')
  @Auth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân của người dùng hiện tại' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(user.sub, updateUserDto);
  }

  @Post()
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Tạo tài khoản người dùng mới (Chỉ Manager)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách người dùng (Phân trang, lọc, tìm kiếm)' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id/customer-detail')
  @Auth(Role.MANAGER, Role.CASHIER, Role.WAITER)
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết Khách hàng (Thống kê chi tiêu, Lịch sử mua hàng, Món yêu thích)'
  })
  findCustomerDetail(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findCustomerDetail(id);
  }

  @Get(':id')
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết người dùng theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng (Chỉ Manager)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Auth(Role.MANAGER)
  @ApiOperation({ summary: 'Xóa tài khoản người dùng (Chỉ Manager)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}