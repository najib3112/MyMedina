/**
 * Payment Method Enum
 * Defines available payment methods via Midtrans
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 */
export enum PaymentMethod {
  /**
   * BANK_TRANSFER - Bank transfer (BCA, BNI, Mandiri, etc.)
   */
  BANK_TRANSFER = 'BANK_TRANSFER',

  /**
   * QRIS - Quick Response Code Indonesian Standard
   */
  QRIS = 'QRIS',

  /**
   * E_WALLET - E-wallet (GoPay, OVO, DANA, etc.)
   */
  E_WALLET = 'E_WALLET',

  /**
   * CREDIT_CARD - Credit/Debit card
   */
  CREDIT_CARD = 'CREDIT_CARD',
}
