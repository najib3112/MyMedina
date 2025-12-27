import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Create Product Variant DTO
 *
 * Data Transfer Object untuk membuat variant produk baru.
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam DTO
 * - Single Responsibility: Hanya untuk validasi input create variant
 *
 * Design Pattern:
 * - DTO Pattern: Separate data structure for API input
 */
export class CreateProductVariantDto {
  @IsNotEmpty({ message: 'SKU harus diisi' })
  @IsString({ message: 'SKU harus berupa string' })
  @MaxLength(100, { message: 'SKU maksimal 100 karakter' })
  sku: string;

  @IsNotEmpty({ message: 'Ukuran harus diisi' })
  @IsString({ message: 'Ukuran harus berupa string' })
  @MaxLength(50, { message: 'Ukuran maksimal 50 karakter' })
  ukuran: string;

  @IsNotEmpty({ message: 'Warna harus diisi' })
  @IsString({ message: 'Warna harus berupa string' })
  @MaxLength(50, { message: 'Warna maksimal 50 karakter' })
  warna: string;

  @IsNotEmpty({ message: 'Stok harus diisi' })
  @IsNumber({}, { message: 'Stok harus berupa angka' })
  @Min(0, { message: 'Stok tidak boleh negatif' })
  stok: number;

  @IsOptional()
  @IsNumber({}, { message: 'Harga override harus berupa angka' })
  @Min(0, { message: 'Harga override tidak boleh negatif' })
  hargaOverride?: number;

  @IsOptional()
  @IsBoolean({ message: 'Aktif harus berupa boolean' })
  aktif?: boolean;

  @IsOptional()
  @IsString()
  gambar?: string;
}
