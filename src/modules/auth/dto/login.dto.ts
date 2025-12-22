import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO untuk Login Pengguna
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam satu class
 * - Data Transfer Object Pattern: Transfer data antar layers
 *
 * Based on: Sequence-Login.puml
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString({ message: 'Password harus berupa string' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;
}
