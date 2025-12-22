import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ShipmentStatus } from '../../../common/enums/shipment-status.enum';

/**
 * Update Shipment Status DTO
 *
 * Design Pattern: DTO Pattern
 * - Validates incoming data for shipment status update
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (UpdateShipmentStatusDto)
 * - Properties: Bahasa Indonesia (status, nomorResi)
 */
export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus, { message: 'Status pengiriman tidak valid' })
  @IsNotEmpty({ message: 'Status wajib diisi' })
  status: ShipmentStatus;

  @IsString({ message: 'Nomor resi harus berupa string' })
  @IsOptional()
  @MaxLength(255, { message: 'Nomor resi maksimal 255 karakter' })
  nomorResi?: string;
}
