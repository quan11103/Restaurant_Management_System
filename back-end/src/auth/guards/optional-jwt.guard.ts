import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request = context.switchToHttp().getRequest<Request>();

        const token = this.extractTokenFromHeader(request);

        // Không có token -> vẫn cho phép truy cập
        if (!token) {
            return true;
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET,
                },
            );

            request['user'] = payload;
        } catch {
            // Token sai cũng không chặn request
            // Chỉ coi như chưa đăng nhập
        }

        return true;
    }

    private extractTokenFromHeader(
        request: Request,
    ): string | undefined {

        const [type, token] =
            request.headers.authorization?.split(' ') ?? [];

        return type === 'Bearer'
            ? token
            : undefined;
    }
}