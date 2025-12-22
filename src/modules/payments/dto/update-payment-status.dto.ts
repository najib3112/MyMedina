import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

/**
 * Update Payment Status DTO
 *
 * Design Pattern: DTO Pattern
 * - Validates incoming data for payment status update
 * - Used for manual status update or webhook processing
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (UpdatePaymentStatusDto)
 * - Properties: Bahasa Indonesia (status, webhookPayload, signatureKey)
 */
export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus, { message: 'Status pembayaran tidak valid' })
  @IsNotEmpty({ message: 'Status wajib diisi' })
  status: PaymentStatus;

  @IsString({ message: 'Webhook payload harus berupa string' })
  @IsOptional()
  webhookPayload?: string;

  @IsString({ message: 'Signature key harus berupa string' })
  @IsOptional()
  signatureKey?: string;
}
