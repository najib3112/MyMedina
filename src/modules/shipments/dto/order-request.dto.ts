import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEmail,
  IsObject,
  ValidateNested,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Shipper (pengirim) information
 * Data dari Biteship getAreas API atau master data store
 */
export class ShipperDto {
  /**
   * Nama pengirim
   */
  @IsString({ message: 'Name harus berupa string' })
  @IsNotEmpty({ message: 'Name wajib diisi' })
  @MaxLength(255, { message: 'Name maksimal 255 karakter' })
  name: string;

  /**
   * Email pengirim
   */
  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  /**
   * Nomor telepon pengirim
   */
  @IsString({ message: 'Phone harus berupa string' })
  @IsNotEmpty({ message: 'Phone wajib diisi' })
  @MinLength(10, { message: 'Phone minimal 10 karakter' })
  phone: string;

  /**
   * Alamat pengirim (jalan, nomor, dll)
   */
  @IsString({ message: 'Address harus berupa string' })
  @IsNotEmpty({ message: 'Address wajib diisi' })
  address: string;

  /**
   * Negara pengirim (e.g., "ID")
   */
  @IsString({ message: 'Country harus berupa string' })
  @IsNotEmpty({ message: 'Country wajib diisi' })
  country: string;

  /**
   * Provinsi pengirim (admin_level_1 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * Contoh: "DKI Jakarta", "Jawa Timur"
   */
  @IsString({ message: 'Province harus berupa string' })
  @IsNotEmpty({ message: 'Province wajib diisi' })
  province: string;

  /**
   * Kota pengirim (admin_level_2 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * Contoh: "Jakarta Pusat", "Surabaya"
   */
  @IsString({ message: 'City harus berupa string' })
  @IsNotEmpty({ message: 'City wajib diisi' })
  city: string;

  /**
   * Kode pos pengirim (dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   */
  @IsString({ message: 'Postal code harus berupa string' })
  @IsNotEmpty({ message: 'Postal code wajib diisi' })
  postal_code: string;
}

/**
 * Receiver (penerima) information
 * Data dari Biteship getAreas API
 */
export class ReceiverDto {
  /**
   * Nama penerima
   */
  @IsString({ message: 'Name harus berupa string' })
  @IsNotEmpty({ message: 'Name wajib diisi' })
  @MaxLength(255, { message: 'Name maksimal 255 karakter' })
  name: string;

  /**
   * Email penerima
   */
  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  /**
   * Nomor telepon penerima
   */
  @IsString({ message: 'Phone harus berupa string' })
  @IsNotEmpty({ message: 'Phone wajib diisi' })
  @MinLength(10, { message: 'Phone minimal 10 karakter' })
  phone: string;

  /**
   * Alamat penerima (jalan, nomor, blok, dll)
   */
  @IsString({ message: 'Address harus berupa string' })
  @IsNotEmpty({ message: 'Address wajib diisi' })
  address: string;

  /**
   * Negara penerima
   */
  @IsString({ message: 'Country harus berupa string' })
  @IsNotEmpty({ message: 'Country wajib diisi' })
  country: string;

  /**
   * Provinsi penerima (admin_level_1 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih kota → auto-fill province dari response
   * Contoh: "DKI Jakarta", "Jawa Timur", "Sumatera Utara"
   */
  @IsString({ message: 'Province harus berupa string' })
  @IsNotEmpty({ message: 'Province wajib diisi' })
  province: string;

  /**
   * Kota penerima (admin_level_2 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * Contoh: "Jakarta Pusat", "Surabaya", "Medan"
   */
  @IsString({ message: 'City harus berupa string' })
  @IsNotEmpty({ message: 'City wajib diisi' })
  city: string;

  /**
   * Kode pos penerima (dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   */
  @IsString({ message: 'Postal code harus berupa string' })
  @IsNotEmpty({ message: 'Postal code wajib diisi' })
  postal_code: string;
}

/**
 * Items/Barang yang akan dikirim
 */
export class OrderItemDto {
  /**
   * Nama item
   */
  @IsString({ message: 'Name harus berupa string' })
  @IsNotEmpty({ message: 'Name wajib diisi' })
  name: string;

  /**
   * Deskripsi item
   */
  @IsString({ message: 'Description harus berupa string' })
  @IsOptional()
  description?: string;

  /**
   * Jumlah item
   */
  @IsNumber({}, { message: 'Quantity harus berupa number' })
  @IsNotEmpty({ message: 'Quantity wajib diisi' })
  quantity: number;

  /**
   * Berat item dalam gram
   */
  @IsNumber({}, { message: 'Weight harus berupa number' })
  @IsNotEmpty({ message: 'Weight wajib diisi' })
  weight: number;

  /**
   * Panjang item dalam cm
   */
  @IsNumber({}, { message: 'Length harus berupa number' })
  @IsNotEmpty({ message: 'Length wajib diisi' })
  length: number;

  /**
   * Lebar item dalam cm
   */
  @IsNumber({}, { message: 'Width harus berupa number' })
  @IsNotEmpty({ message: 'Width wajib diisi' })
  width: number;

  /**
   * Tinggi item dalam cm
   */
  @IsNumber({}, { message: 'Height harus berupa number' })
  @IsNotEmpty({ message: 'Height wajib diisi' })
  height: number;

  /**
   * Nilai item per unit (untuk asuransi)
   */
  @IsNumber({}, { message: 'Value harus berupa number' })
  @IsOptional()
  value?: number;
}

/**
 * DTO for creating shipment order
 * Used in: POST /shipment/order
 * Called AFTER payment success
 */
export class OrderRequestDto {
  /**
   * Order reference ID dari backend (e.g., Order ID)
   * Untuk tracking di backend
   */
  @IsString({ message: 'Reference harus berupa string' })
  @IsNotEmpty({ message: 'Reference wajib diisi' })
  reference: string;

  /**
   * Shipper information
   */
  @IsObject({ message: 'Shipper harus berupa object' })
  @ValidateNested()
  @Type(() => ShipperDto)
  @IsNotEmpty({ message: 'Shipper wajib diisi' })
  shipper: ShipperDto;

  /**
   * Receiver information
   */
  @IsObject({ message: 'Receiver harus berupa object' })
  @ValidateNested()
  @Type(() => ReceiverDto)
  @IsNotEmpty({ message: 'Receiver wajib diisi' })
  receiver: ReceiverDto;

  /**
   * Items being shipped
   */
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'Items wajib diisi' })
  items: OrderItemDto[];

  /**
   * Courier code (e.g., "jne", "tiki")
   * Hasil dari rates endpoint
   */
  @IsString({ message: 'Courier code harus berupa string' })
  @IsNotEmpty({ message: 'Courier code wajib diisi' })
  courier_code: string;

  /**
   * Courier service code (e.g., "jne:reg", "tiki:reg")
   * Hasil dari rates endpoint
   */
  @IsString({ message: 'Courier service code harus berupa string' })
  @IsNotEmpty({ message: 'Courier service code wajib diisi' })
  courier_service_code: string;

  /**
   * Notes/catatan untuk pengiriman (optional)
   */
  @IsString({ message: 'Notes harus berupa string' })
  @IsOptional()
  notes?: string;

  /**
   * Asuransi pengiriman (optional)
   * true = dengan asuransi, false = tanpa asuransi
   */
  @IsOptional()
  insurance_amount?: number;

  /**
   * Custom field untuk data tambahan (optional)
   */
  @IsOptional()
  metadata?: Record<string, any>;
}