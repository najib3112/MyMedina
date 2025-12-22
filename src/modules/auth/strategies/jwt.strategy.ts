import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * JWT Strategy
 *
 * OOP Concepts:
 * - Inheritance: Extends PassportStrategy
 * - Encapsulation: JWT validation logic dalam satu class
 *
 * Design Pattern:
 * - Strategy Pattern: Passport strategy untuk JWT authentication
 *
 * Flow:
 * 1. Extract JWT token dari Authorization header
 * 2. Verify token dengan JWT_SECRET
 * 3. Validate user dari payload (sub = userId)
 * 4. Attach user ke request object
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const secret = process.env.JWT_SECRET || 'mymedina_secret_key';
    console.log('🔑 JWT Strategy Secret:', secret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT Payload
   *
   * Method ini dipanggil otomatis oleh Passport setelah token terverifikasi
   *
   * @param payload - JWT payload { sub: userId, email, role }
   * @returns User object (akan di-attach ke request.user)
   */
  async validate(payload: any) {
    const { sub: userId } = payload;

    // Cari user berdasarkan ID dari payload
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // Cek apakah user aktif
    if (!user.aktif) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    // Return user (akan di-attach ke request.user)
    // Jangan return password!
    const { hashPassword: _, ...userTanpaPassword } = user;
    return userTanpaPassword;
  }
}
