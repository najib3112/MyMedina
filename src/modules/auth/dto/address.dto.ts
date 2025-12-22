import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsBoolean,
  IsNumberString,
} from 'class-validator';

/**
 * DTO for Creating a New Address
 */
export class CreateAddressDto {
  /**
   * Label untuk address (e.g., "Rumah", "Kantor")
   * Optional
   */
  @IsString({ message: 'Label harus berupa string' })
  @IsOptional()
  @MaxLength(50, { message: 'Label maksimal 50 karakter' })
  label?: string;

  /**
   * Nama penerima
   */
  @IsString({ message: 'Nama penerima harus berupa string' })
  @IsNotEmpty({ message: 'Nama penerima wajib diisi' })
  @MaxLength(255, { message: 'Nama penerima maksimal 255 karakter' })
  namaPenerima: string;

  /**
   * Nomor telepon penerima
   * Format: 08xx atau +62xx
   */
  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Nomor telepon tidak valid (contoh: 081234567890)',
  })
  teleponPenerima: string;

  /**
   * Alamat baris 1 (jalan, nomor rumah, dll)
   */
  @IsString({ message: 'Alamat baris 1 harus berupa string' })
  @IsNotEmpty({ message: 'Alamat baris 1 wajib diisi' })
  alamatBaris1: string;

  /**
   * Alamat baris 2 (optional - kompleks, blok, dll)
   */
  @IsString({ message: 'Alamat baris 2 harus berupa string' })
  @IsOptional()
  alamatBaris2?: string;

  /**
   * Kota/Kabupaten (admin_level_2 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih lokasi → auto-fill dari response
   * Contoh: "Jakarta Pusat", "Surabaya", "Medan"
   */
  @IsString({ message: 'Kota harus berupa string' })
  @IsNotEmpty({ message: 'Kota wajib diisi' })
  @MaxLength(100, { message: 'Kota maksimal 100 karakter' })
  kota: string;

  /**
   * Provinsi (admin_level_1 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih lokasi → auto-fill dari response
   * Contoh: "DKI Jakarta", "Jawa Timur", "Sumatera Utara"
   */
  @IsString({ message: 'Provinsi harus berupa string' })
  @IsNotEmpty({ message: 'Provinsi wajib diisi' })
  @MaxLength(100, { message: 'Provinsi maksimal 100 karakter' })
  provinsi: string;

  /**
   * Kode pos (dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih lokasi → auto-fill dari response
   */
  @IsNumberString({}, { message: 'Kode pos harus berupa angka' })
  @IsNotEmpty({ message: 'Kode pos wajib diisi' })
  @MaxLength(10, { message: 'Kode pos maksimal 10 karakter' })
  kodePos: string;

  /**
   * Latitude untuk GPS (optional)
   */
  @IsOptional()
  @IsNumberString({}, { message: 'Latitude harus berupa angka' })
  latitude?: string;

  /**
   * Longitude untuk GPS (optional)
   */
  @IsOptional()
  @IsNumberString({}, { message: 'Longitude harus berupa angka' })
  longitude?: string;

  /**
   * Set sebagai default address?
   * Jika true dan sudah ada default, yang lama akan di-unset
   */
  @IsBoolean({ message: 'isDefault harus boolean' })
  @IsOptional()
  isDefault?: boolean;
}

/**
 * DTO for Updating an Address
 */
export class UpdateAddressDto {
  @IsString({ message: 'Label harus berupa string' })
  @IsOptional()
  @MaxLength(50, { message: 'Label maksimal 50 karakter' })
  label?: string;

  @IsString({ message: 'Nama penerima harus berupa string' })
  @IsOptional()
  @MaxLength(255, { message: 'Nama penerima maksimal 255 karakter' })
  namaPenerima?: string;

  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsOptional()
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Nomor telepon tidak valid (contoh: 081234567890)',
  })
  teleponPenerima?: string;

  @IsString({ message: 'Alamat baris 1 harus berupa string' })
  @IsOptional()
  alamatBaris1?: string;

  @IsString({ message: 'Alamat baris 2 harus berupa string' })
  @IsOptional()
  alamatBaris2?: string;

  @IsString({ message: 'Kota harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Kota maksimal 100 karakter' })
  kota?: string;

  @IsString({ message: 'Provinsi harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Provinsi maksimal 100 karakter' })
  provinsi?: string;

  @IsNumberString({}, { message: 'Kode pos harus berupa angka' })
  @IsOptional()
  @MaxLength(10, { message: 'Kode pos maksimal 10 karakter' })
  kodePos?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Latitude harus berupa angka' })
  latitude?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Longitude harus berupa angka' })
  longitude?: string;

  @IsBoolean({ message: 'isDefault harus boolean' })
  @IsOptional()
  isDefault?: boolean;
}

/**
 * DTO for Address Response
 */
export class AddressDto {
  id: string;

  label?: string;

  namaPenerima: string;

  teleponPenerima: string;

  alamatBaris1: string;

  alamatBaris2?: string;

  kota: string;

  provinsi: string;

  kodePos: string;

  latitude?: number;

  longitude?: number;

  isDefault: boolean;

  aktif: boolean;

  dibuatPada: Date;

  diupdatePada: Date;
}

/**
 * DTO for Set Default Address
 */
export class SetDefaultAddressDto {
  @IsString({ message: 'Address ID harus berupa string' })
  @IsNotEmpty({ message: 'Address ID wajib diisi' })
  addressId: string;
}