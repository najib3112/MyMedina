import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

/**
 * DTO untuk Register/Daftar Pengguna Baru
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam satu class
 * - Data Transfer Object Pattern: Transfer data antar layers
 *
 * Based on: Sequence-Register-SIMPLIFIED.puml
 */
export class DaftarDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString({ message: 'Password harus berupa string' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
  })
  password: string;

  @IsString({ message: 'Nama harus berupa string' })
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  nama: string;

  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsOptional()
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Nomor telepon tidak valid (contoh: 081234567890)',
  })
  nomorTelepon?: string;
}
