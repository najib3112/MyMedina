import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Location DTO with Biteship area_id
 */
export class LocationDto {
  /**
   * Biteship Area ID (REQUIRED for rate calculation)
   * Example: "IDNP6IDNC148IDND2321"
   * Get from /shipment/areas endpoint
   */
  @IsString({ message: 'Area ID harus berupa string' })
  @IsOptional()
  area_id?: string;

  /**
   * Province name (Admin Level 1)
   * Example: "DKI Jakarta", "Jawa Barat"
   */
  @IsString({ message: 'Admin level 1 harus berupa string' })
  @IsNotEmpty({ message: 'Admin level 1 wajib diisi' })
  admin_level_1: string;

  /**
   * City/District name (Admin Level 2)
   * Example: "Jakarta Selatan", "Bandung"
   */
  @IsString({ message: 'Admin level 2 harus berupa string' })
  @IsNotEmpty({ message: 'Admin level 2 wajib diisi' })
  admin_level_2: string;

  /**
   * Postal code (5 digits)
   * Example: "12160"
   */
  @IsString({ message: 'Postal code harus berupa string' })
  @IsOptional()
  postal_code?: string;

  /**
   * Latitude (from Biteship area search)
   */
  @IsNumber({}, { message: 'Latitude harus berupa number' })
  @IsOptional()
  latitude?: number;

  /**
   * Longitude (from Biteship area search)
   */
  @IsNumber({}, { message: 'Longitude harus berupa number' })
  @IsOptional()
  longitude?: number;
}

/**
 * Item/Product to be shipped
 */
export class ItemDto {
  /**
   * Product name
   */
  @IsString({ message: 'Name harus berupa string' })
  @IsNotEmpty({ message: 'Name wajib diisi' })
  name: string;

  /**
   * Product description (optional)
   */
  @IsString({ message: 'Description harus berupa string' })
  @IsOptional()
  description?: string;

  /**
   * Quantity
   */
  @IsNumber({}, { message: 'Quantity harus berupa number' })
  @IsNotEmpty({ message: 'Quantity wajib diisi' })
  quantity: number;

  /**
   * Weight in grams
   * Example: 500 (for 500 grams)
   */
  @IsNumber({}, { message: 'Weight harus berupa number' })
  @IsNotEmpty({ message: 'Weight wajib diisi' })
  weight: number;

  /**
   * Item value (for insurance)
   * Example: 100000 (Rp 100,000)
   */
  @IsNumber({}, { message: 'Value harus berupa number' })
  @IsOptional()
  value?: number;

  /**
   * Length in cm
   */
  @IsNumber({}, { message: 'Length harus berupa number' })
  @IsOptional()
  length?: number;

  /**
   * Width in cm
   */
  @IsNumber({}, { message: 'Width harus berupa number' })
  @IsOptional()
  width?: number;

  /**
   * Height in cm
   */
  @IsNumber({}, { message: 'Height harus berupa number' })
  @IsOptional()
  height?: number;
}

/**
 * Rate calculation request DTO
 * Used in: POST /shipment/rates
 */
export class RateRequestDto {
  /**
   * Origin location (your store)
   */
  @IsObject({ message: 'Origin harus berupa object' })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty({ message: 'Origin wajib diisi' })
  origin: LocationDto;

  /**
   * Destination location (customer)
   */
  @IsObject({ message: 'Destination harus berupa object' })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty({ message: 'Destination wajib diisi' })
  destination: LocationDto;

  /**
   * Items being shipped
   */
  @IsArray({ message: 'Items harus berupa array' })
  @IsNotEmpty({ message: 'Items wajib diisi' })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  /**
   * Preferred couriers (optional)
   * Example: ["jne", "jnt", "sicepat"]
   * If not provided, all available couriers will be returned
   */
  @IsArray({ message: 'Couriers harus berupa array' })
  @IsOptional()
  couriers?: string[];
}