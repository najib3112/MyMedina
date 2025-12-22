import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 *
 * OOP Concepts:
 * - Inheritance: Extends AuthGuard dari Passport
 * - Encapsulation: Authentication logic dalam satu class
 *
 * Design Pattern:
 * - Guard Pattern: Protect routes yang memerlukan authentication
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@Request() req) {
 *   return req.user; // User dari JWT token
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
