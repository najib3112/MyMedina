/**
 * Payment Status Enum
 * Defines the status of payment transactions
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 * Aligned with Midtrans payment statuses
 */
export enum PaymentStatus {
  /**
   * PENDING - Payment initiated, waiting for customer to pay
   */
  PENDING = 'PENDING',

  /**
   * SETTLEMENT - Payment successful and settled
   */
  SETTLEMENT = 'SETTLEMENT',

  /**
   * EXPIRE - Payment link expired
   */
  EXPIRE = 'EXPIRE',

  /**
   * CANCEL - Payment cancelled by customer or system
   */
  CANCEL = 'CANCEL',

  /**
   * DENY - Payment denied by payment gateway
   */
  DENY = 'DENY',

  /**
   * REFUND - Payment refunded to customer
   */
  REFUND = 'REFUND',
}
