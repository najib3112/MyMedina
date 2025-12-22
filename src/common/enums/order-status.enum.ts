/**
 * Order Status Enum
 * Defines the lifecycle status of orders
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum OrderStatus {
  /**
   * PENDING_PAYMENT - Order created, waiting for payment
   */
  PENDING_PAYMENT = 'PENDING_PAYMENT',

  /**
   * PAID - Payment received and verified
   */
  PAID = 'PAID',

  /**
   * PROCESSING - Order is being processed (payment confirmed, preparing order)
   */
  PROCESSING = 'PROCESSING',

  /**
   * IN_PRODUCTION - Order is being produced (for PO orders)
   */
  IN_PRODUCTION = 'IN_PRODUCTION',

  /**
   * READY_TO_SHIP - Order is ready and waiting to be shipped
   */
  READY_TO_SHIP = 'READY_TO_SHIP',

  /**
   * SHIPPED - Order has been shipped
   */
  SHIPPED = 'SHIPPED',

  /**
   * DELIVERED - Order has been delivered
   */
  DELIVERED = 'DELIVERED',

  /**
   * COMPLETED - Order completed
   */
  COMPLETED = 'COMPLETED',

  /**
   * CANCELLED - Order was cancelled
   */
  CANCELLED = 'CANCELLED',

  /**
   * REFUNDED - Order was refunded
   */
  REFUNDED = 'REFUNDED',

  /**
   * EXPIRED - Order payment expired
   */
  EXPIRED = 'EXPIRED',
}
