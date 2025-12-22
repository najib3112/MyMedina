import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for fetching areas from Biteship
 * Used in: GET /shipment/areas?input=...
 */
export class AreaQueryDto {
  /**
   * Search input for area (kota/province)
   * Example: "Jakarta", "Surabaya"
   */
  @IsString({ message: 'Input harus berupa string' })
  @IsNotEmpty({ message: 'Input wajib diisi' })
  input: string;
}