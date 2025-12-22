import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity';

/**
 * Current User Decorator
 *
 * Mengekstrak user dari JWT token yang sudah diverifikasi
 * Digunakan di controllers untuk mendapatkan current user
 *
 * Usage:
 * @Post()
 * async create(@CurrentUser() user: User, @Body() dto: CreateDto) {
 *   // user adalah instance User dari JWT token
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
