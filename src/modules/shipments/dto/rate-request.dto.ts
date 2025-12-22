import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Origin/Destination coordinates for rate calculation
 */
export class LocationDto {
  /**
   * Country code (e.g., "ID" for Indonesia)
   */
  @IsString({ message: 'Country harus berupa string' })
  @IsNotEmpty({ message: 'Country wajib diisi' })
  country: string;

  /**
   * Administrative level 1 (e.g., province name)
   */
  @IsString({ message: 'Admin level 1 harus berupa string' })
  @IsNotEmpty({ message: 'Admin level 1 wajib diisi' })
  admin_level_1: string;

  /**
   * Administrative level 2 (e.g., city name)
   */
  @IsString({ message: 'Admin level 2 harus berupa string' })
  @IsNotEmpty({ message: 'Admin level 2 wajib diisi' })
  admin_level_2: string;

  /**
   * Postal code (optional)
   */
  @IsString({ message: 'Postal code harus berupa string' })
  @IsOptional()
  postal_code?: string;

  /**
   * Latitude (optional, for GPS precision)
   */
  @IsNumber({}, { message: 'Latitude harus berupa number' })
  @IsOptional()
  latitude?: number;

  /**
   * Longitude (optional, for GPS precision)
   */
  @IsNumber({}, { message: 'Longitude harus berupa number' })
  @IsOptional()
  longitude?: number;
}

/**
 * Item/Barang yang akan dikirim
 */
export class ItemDto {
  /**
   * Nama item
   */
  @IsString({ message: 'Name harus berupa string' })
  @IsNotEmpty({ message: 'Name wajib diisi' })
  name: string;

  /**
   * Deskripsi item (optional)
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
   * Nilai item (untuk asuransi)
   */
  @IsNumber({}, { message: 'Value harus berupa number' })
  @IsOptional()
  value?: number;
}

/**
 * DTO for calculating shipping rates
 * Used in: POST /shipment/rates
 */
export class RateRequestDto {
  /**
   * Origin location
   */
  @IsObject({ message: 'Origin harus berupa object' })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty({ message: 'Origin wajib diisi' })
  origin: LocationDto;

  /**
   * Destination location
   */
  @IsObject({ message: 'Destination harus berupa object' })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty({ message: 'Destination wajib diisi' })
  destination: LocationDto;

  /**
   * List of items being shipped
   */
  @IsNotEmpty({ message: 'Items wajib diisi' })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  /**
   * Preferred couriers (optional, e.g., ["jne", "tiki"])
   * If not provided, all available couriers will be returned
   */
  @IsOptional()
  couriers?: string[];
}