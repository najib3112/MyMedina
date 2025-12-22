import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

/**
 * Create Payment DTO
 *
 * Design Pattern: DTO Pattern
 * - Validates incoming data
 * - Transforms data structure
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (CreatePaymentDto)
 * - Properties: Bahasa Indonesia (orderId, metode)
 */
export class CreatePaymentDto {
  @IsUUID('4', { message: 'Order ID harus berupa UUID yang valid' })
  @IsNotEmpty({ message: 'Order ID wajib diisi' })
  orderId: string;

  @IsEnum(PaymentMethod, { message: 'Metode pembayaran tidak valid' })
  @IsNotEmpty({ message: 'Metode pembayaran wajib diisi' })
  metode: PaymentMethod;
}
