import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * DTO untuk Request Lupa Password
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam satu class
 * - Data Transfer Object Pattern: Transfer data antar layers
 *
 * Based on: Sequence-Auth-Forgot-Password.puml
 */
export class LupaPasswordDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;
}
