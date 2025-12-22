/**
 * Shipment Status Enum
 * Defines the status of order shipments
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum ShipmentStatus {
  /**
   * PENDING - Shipment not yet created
   */
  PENDING = 'PENDING',

  /**
   * READY_TO_SHIP - Order is ready and waiting to be shipped
   */
  READY_TO_SHIP = 'READY_TO_SHIP',

  /**
   * SHIPPED - Package handed to courier
   */
  SHIPPED = 'SHIPPED',

  /**
   * IN_TRANSIT - Package in transit
   */
  IN_TRANSIT = 'IN_TRANSIT',

  /**
   * DELIVERED - Package delivered to customer
   */
  DELIVERED = 'DELIVERED',

  /**
   * CANCELLED - Shipment was cancelled
   */
  CANCELLED = 'CANCELLED',
}
