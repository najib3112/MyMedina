import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

/**
 * Roles Guard
 *
 * OOP Concepts:
 * - Encapsulation: Authorization logic dalam satu class
 * - Single Responsibility: Hanya handle role-based authorization
 *
 * Design Pattern:
 * - Guard Pattern: Protect routes berdasarkan role
 * - Decorator Pattern: Menggunakan @Roles() decorator
 *
 * Usage:
 * @Roles(Role.ADMIN, Role.OWNER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnly() {
 *   return 'Only admin and owner can access this';
 * }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil roles yang dibutuhkan dari @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada @Roles() decorator, allow access
    if (!requiredRoles) {
      return true;
    }

    // Ambil user dari request (sudah di-attach oleh JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Cek apakah user memiliki salah satu role yang dibutuhkan
    return requiredRoles.some((role) => user.role === role);
  }
}
