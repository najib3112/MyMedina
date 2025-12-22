import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

/**
 * Roles Decorator
 *
 * OOP Concepts:
 * - Decorator Pattern: Add metadata ke route handler
 *
 * Usage:
 * @Roles(Role.ADMIN, Role.OWNER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnly() {
 *   return 'Only admin and owner can access this';
 * }
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
