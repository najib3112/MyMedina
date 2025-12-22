import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../../common/enums/order-type.enum';

/**
 * DTO for Order Item in Create Order Request
 */
export class CreateOrderItemDto {
  @IsUUID('4', { message: 'Product Variant ID harus berupa UUID yang valid' })
  @IsNotEmpty({ message: 'Product Variant ID wajib diisi' })
  productVariantId: string;

  @IsNumber({}, { message: 'Kuantitas harus berupa angka' })
  @Min(1, { message: 'Kuantitas minimal 1' })
  @IsNotEmpty({ message: 'Kuantitas wajib diisi' })
  kuantitas: number;
}

/**
 * DTO for Shipping Address in Create Order Request
 */
export class AlamatPengirimanDto {
  @IsString({ message: 'Nama penerima harus berupa string' })
  @IsNotEmpty({ message: 'Nama penerima wajib diisi' })
  @MaxLength(255, { message: 'Nama penerima maksimal 255 karakter' })
  namaPenerima: string;

  @IsString({ message: 'Telepon penerima harus berupa string' })
  @IsNotEmpty({ message: 'Telepon penerima wajib diisi' })
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Nomor telepon tidak valid (contoh: 081234567890)',
  })
  teleponPenerima: string;

  @IsString({ message: 'Alamat baris 1 harus berupa string' })
  @IsNotEmpty({ message: 'Alamat baris 1 wajib diisi' })
  alamatBaris1: string;

  @IsString({ message: 'Alamat baris 2 harus berupa string' })
  @IsOptional()
  alamatBaris2?: string;

  @IsString({ message: 'Kota harus berupa string' })
  @IsNotEmpty({ message: 'Kota wajib diisi' })
  @MaxLength(100, { message: 'Kota maksimal 100 karakter' })
  kota: string;

  @IsString({ message: 'Provinsi harus berupa string' })
  @IsNotEmpty({ message: 'Provinsi wajib diisi' })
  @MaxLength(100, { message: 'Provinsi maksimal 100 karakter' })
  provinsi: string;

  @IsString({ message: 'Kode pos harus berupa string' })
  @IsNotEmpty({ message: 'Kode pos wajib diisi' })
  @Matches(/^[0-9]{5}$/, {
    message: 'Kode pos harus 5 digit angka',
  })
  kodePos: string;
}

/**
 * Create Order DTO (Checkout)
 *
 * Design Pattern: DTO Pattern
 * - Validates incoming data
 * - Transforms data structure
 * - Separates API contract from domain model
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (CreateOrderDto)
 * - Properties: Bahasa Indonesia (items, alamatPengiriman, etc.)
 *
 * Opsi 1: Gunakan saved address (reuse)
 * - Provide addressId untuk pakai saved address
 * - Pre-selected dengan default address jika tidak specify
 *
 * Opsi 2: Gunakan alamat baru (inline)
 * - Provide alamatPengiriman untuk input address baru
 * - Address baru juga bisa disave ke user addresses
 */
export class CreateOrderDto {
  @IsArray({ message: 'Items harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty({ message: 'Items wajib diisi' })
  items: CreateOrderItemDto[];

  /**
   * Option 1: Gunakan saved address (UUID)
   * Jika addressId disediakan, alamatPengiriman boleh kosong
   * Jika tidak ada addressId, harus provide alamatPengiriman
   */
  @IsUUID('4', { message: 'Address ID harus berupa UUID yang valid' })
  @IsOptional()
  addressId?: string;

  /**
   * Option 2: Gunakan alamat baru (inline input)
   * Jika alamatPengiriman disediakan, akan digunakan untuk order
   * Optional: bisa di-save ke user addresses dengan flag saveToDaftar
   *
   * Jika addressId kosong, alamatPengiriman wajib diisi
   */
  @ValidateNested()
  @Type(() => AlamatPengirimanDto)
  @IsOptional()
  alamatPengiriman?: AlamatPengirimanDto;

  /**
   * Simpan alamat pengiriman ke daftar alamat user?
   * Hanya berlaku jika menggunakan alamatPengiriman (Option 2)
   * Default: false
   */
  @IsBoolean({ message: 'saveToDaftar harus boolean' })
  @IsOptional()
  saveToDaftar?: boolean;

  /**
   * Label untuk saved address (jika saveToDaftar = true)
   * Contoh: "Kantor", "Rumah Orang Tua"
   */
  @IsString({ message: 'Label alamat harus berupa string' })
  @IsOptional()
  @MaxLength(50, { message: 'Label maksimal 50 karakter' })
  labelAlamat?: string;

  @IsEnum(OrderType, { message: 'Tipe order tidak valid' })
  @IsNotEmpty({ message: 'Tipe order wajib diisi' })
  tipe: OrderType;

  @IsNumber({}, { message: 'Ongkos kirim harus berupa angka' })
  @Min(0, { message: 'Ongkos kirim minimal 0' })
  @IsNotEmpty({ message: 'Ongkos kirim wajib diisi' })
  ongkosKirim: number;

  @IsString({ message: 'Catatan harus berupa string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Catatan maksimal 1000 karakter' })
  catatan?: string;
}
