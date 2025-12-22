/**
 * Order Type Enum
 * Defines whether order is for ready stock or pre-order
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum OrderType {
  /**
   * READY - Order for ready stock products
   */
  READY = 'READY',

  /**
   * PO - Pre-Order (will be produced after order)
   */
  PO = 'PO',
}
