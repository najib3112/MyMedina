import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for tracking parameters
 * Used in: GET /shipment/tracking/:waybill/:courier
 */
export class TrackingParamDto {
  /**
   * Waybill/Resi number
   * Example: "1234567890"
   */
  @IsString({ message: 'Waybill harus berupa string' })
  @IsNotEmpty({ message: 'Waybill wajib diisi' })
  waybill: string;

  /**
   * Courier code
   * Example: "jne", "tiki", "pos"
   */
  @IsString({ message: 'Courier harus berupa string' })
  @IsNotEmpty({ message: 'Courier wajib diisi' })
  courier: string;
}