import { JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

/**
 * JWT Configuration
 *
 * OOP Concepts:
 * - Encapsulation: JWT config in one place
 */
export const jwtConfig = (): JwtModuleOptions => {
  const secret = process.env.JWT_SECRET || 'mymedina_secret_key';
  console.log('🔑 JWT Config Secret:', secret);

  const rawExpires = process.env.JWT_EXPIRES_IN ?? '7d';
  const expiresIn: SignOptions['expiresIn'] = isNaN(Number(rawExpires))
    ? (rawExpires as unknown as SignOptions['expiresIn'])
    : (Number(rawExpires) as SignOptions['expiresIn']);

  return {
    secret,
    signOptions: {
      expiresIn,
    },
  };
};
