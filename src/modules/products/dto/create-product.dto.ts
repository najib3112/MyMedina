import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductStatus } from '../../../common/enums/product-status.enum';

/**
 * Create Product DTO
 *
 * Data Transfer Object untuk membuat produk baru.
 *
 * OOP Concepts:
 * - Encapsulation: Data validation rules dalam DTO
 * - Single Responsibility: Hanya untuk validasi input create product
 *
 * Design Pattern:
 * - DTO Pattern: Separate data structure for API input
 */
export class CreateProductDto {
  @IsNotEmpty({ message: 'Category ID harus diisi' })
  @IsUUID('4', { message: 'Category ID harus berupa UUID yang valid' })
  categoryId: string;

  @IsNotEmpty({ message: 'Nama produk harus diisi' })
  @IsString({ message: 'Nama produk harus berupa string' })
  @MaxLength(255, { message: 'Nama produk maksimal 255 karakter' })
  nama: string;

  @IsNotEmpty({ message: 'Slug produk harus diisi' })
  @IsString({ message: 'Slug produk harus berupa string' })
  @MaxLength(255, { message: 'Slug produk maksimal 255 karakter' })
  slug: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi produk harus berupa string' })
  deskripsi?: string;

  @IsNotEmpty({ message: 'Harga dasar harus diisi' })
  @IsNumber({}, { message: 'Harga dasar harus berupa angka' })
  @Min(0, { message: 'Harga dasar tidak boleh negatif' })
  hargaDasar: number;

  @IsNotEmpty({ message: 'Berat produk harus diisi' })
  @IsNumber({}, { message: 'Berat produk harus berupa angka' })
  @Min(0, { message: 'Berat produk tidak boleh negatif' })
  berat: number;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Status produk tidak valid' })
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean({ message: 'Aktif harus berupa boolean' })
  aktif?: boolean;

  @IsOptional()
  @IsUrl({}, { message: 'Gambar URL harus berupa URL yang valid' })
  @MaxLength(500, { message: 'Gambar URL maksimal 500 karakter' })
  gambarUrl?: string;
}
