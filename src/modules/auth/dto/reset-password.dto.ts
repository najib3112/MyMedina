import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO untuk Reset Password
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam satu class
 * - Data Transfer Object Pattern: Transfer data antar layers
 *
 * Based on: Sequence-Auth-Forgot-Password.puml
 */
export class ResetPasswordDto {
  @IsString({ message: 'Password baru harus berupa string' })
  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  passwordBaru: string;
}
