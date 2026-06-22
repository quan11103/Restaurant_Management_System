import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Đọc danh sách Role được phép truy cập từ Decorator @Roles()
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu API không gắn @Roles(), mặc định là ai cũng vào được (đã qua lớp đăng nhập)
        if (!requiredRoles) {
            return true;
        }

        // 2. Lấy thông tin user từ request (được nhúng vào từ JwtAuthGuard trước đó)
        const { user } = context.switchToHttp().getRequest();

        // Nếu không có user (chưa đăng nhập), báo lỗi ngay
        if (!user) {
            throw new ForbiddenException('Bạn chưa đăng nhập.');
        }

        // 3. Kiểm tra xem role của user có nằm trong danh sách được phép không
        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException('Bạn không có quyền truy cập vào chức năng này!');
        }

        return true;
    }
}