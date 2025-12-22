import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';

/**
 * Update Order Status DTO
 *
 * Design Pattern: DTO Pattern
 * - Validates incoming data for status update
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (UpdateOrderStatusDto)
 * - Properties: Bahasa Indonesia (status)
 */
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Status order tidak valid' })
  @IsNotEmpty({ message: 'Status wajib diisi' })
  status: OrderStatus;
}
