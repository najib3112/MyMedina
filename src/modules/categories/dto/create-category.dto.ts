import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/**
 * Create Category DTO
 *
 * Data Transfer Object untuk membuat kategori baru.
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam DTO
 * - Single Responsibility: Hanya untuk validasi input create category
 *
 * Design Pattern:
 * - DTO Pattern: Separate data structure for API input
 */
export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Nama kategori harus diisi' })
  @IsString({ message: 'Nama kategori harus berupa string' })
  @MaxLength(255, { message: 'Nama kategori maksimal 255 karakter' })
  nama: string;

  @IsNotEmpty({ message: 'Slug kategori harus diisi' })
  @IsString({ message: 'Slug kategori harus berupa string' })
  @MaxLength(255, { message: 'Slug kategori maksimal 255 karakter' })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi kategori harus berupa string' })
  deskripsi?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Parent ID harus berupa UUID yang valid' })
  parentId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Aktif harus berupa boolean' })
  aktif?: boolean;
}
