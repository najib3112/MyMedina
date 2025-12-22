import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Create Shipment DTO
 *
 * Design Pattern: DTO Pattern
 * - Validates incoming data
 * - Transforms data structure
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (CreateShipmentDto)
 * - Properties: Bahasa Indonesia (orderId, kurir, etc.)
 */
export class CreateShipmentDto {
  @IsUUID('4', { message: 'Order ID harus berupa UUID yang valid' })
  @IsNotEmpty({ message: 'Order ID wajib diisi' })
  orderId: string;

  @IsString({ message: 'Kurir harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Kurir maksimal 100 karakter' })
  kurir?: string;

  @IsString({ message: 'Layanan harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Layanan maksimal 100 karakter' })
  layanan?: string;

  @IsString({ message: 'Nomor resi harus berupa string' })
  @IsOptional()
  @MaxLength(255, { message: 'Nomor resi maksimal 255 karakter' })
  nomorResi?: string;

  @IsNumber({}, { message: 'Biaya harus berupa angka' })
  @Min(0, { message: 'Biaya minimal 0' })
  @IsNotEmpty({ message: 'Biaya wajib diisi' })
  biaya: number;
}
