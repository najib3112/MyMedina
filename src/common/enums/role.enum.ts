/**
 * User Role Enum
 * Defines the different roles in the system
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum Role {
  /**
   * Customer - Regular user who can browse and purchase products
   */
  CUSTOMER = 'CUSTOMER',

  /**
   * Admin - Staff who can manage products, orders, and customers
   */
  ADMIN = 'ADMIN',

  /**
   * Owner - Has full access including financial reports
   */
  OWNER = 'OWNER',
}
