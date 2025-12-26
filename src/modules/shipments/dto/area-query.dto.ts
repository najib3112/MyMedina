import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for searching areas via Biteship
 * Used in: GET /shipment/areas?input=...
 */
export class AreaQueryDto {
  /**
   * Search query for area (city/province/district)
   * Minimum 3 characters
   * Example: "Jakarta", "Surabaya", "Bandung"
   */
  @IsString({ message: 'Input harus berupa string' })
  @IsNotEmpty({ message: 'Input wajib diisi' })
  @MinLength(3, { message: 'Input minimal 3 karakter' })
  input: string;
}