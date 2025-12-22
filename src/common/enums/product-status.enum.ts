/**
 * Product Status Enum
 * Defines the availability status of products
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum ProductStatus {
  /**
   * READY - Product is in stock and ready to ship
   */
  READY = 'READY',

  /**
   * PO - Pre-Order product (will be produced after order)
   */
  PO = 'PO',

  /**
   * DISCONTINUED - Product is no longer available
   */
  DISCONTINUED = 'DISCONTINUED',
}
