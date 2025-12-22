import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

/**
 * Payment Entity
 *
 * OOP Concepts:
 * - Encapsulation: Payment data and behavior in one class
 * - Abstraction: Hides database implementation details
 * - Data Modeling: Represents Payment table in database
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (Payment)
 * - Properties: Bahasa Indonesia (orderId, transactionId, etc.)
 * - Database columns: English snake_case (order_id, transaction_id, etc.)
 *
 * Note: Designed for Midtrans payment gateway integration
 * One order can have multiple payment attempts (if first payment fails/expires)
 */
@Entity('payments')
export class Payment {
  // ========================================
  // PRIMARY KEY
  // ========================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // FOREIGN KEY
  // ========================================

  @Column({ name: 'order_id' })
  orderId: string;

  // ========================================
  // PAYMENT FIELDS
  // ========================================

  @Column({ name: 'transaction_id', unique: true, length: 255 })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  metode: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  jumlah: number;

  @Column({ name: 'payment_url', length: 500, nullable: true })
  urlPembayaran: string;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  kadaluarsaPada: Date;

  // ========================================
  // MIDTRANS WEBHOOK FIELDS
  // ========================================

  @Column({ name: 'webhook_payload', type: 'text', nullable: true })
  webhookPayload: string;

  @Column({ name: 'signature_key', length: 255, nullable: true })
  signatureKey: string;

  // ========================================
  // TIMESTAMPS
  // ========================================

  @Column({
    name: 'initiated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  diinisiasiPada: Date;

  @Column({ name: 'settlement_time', type: 'timestamp', nullable: true })
  waktuSettlement: Date;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * Order Relationship
   * Setiap payment belongs to satu order
   * One order can have multiple payments (retry if failed)
   * Based on: Class Diagram - Payment has relationship with Order (1..*)
   */
  @ManyToOne(() => Order, (order) => order.payments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // ========================================
  // METHODS (sesuai Class Diagram)
  // ========================================

  /**
   * Buat transaksi Midtrans
   * Implementation: Dihandle di PaymentService untuk integration dengan Midtrans API
   *
   * @returns Transaction ID atau Snap token dari Midtrans
   */
  buatTransaksiMidtrans(): string {
    // Implementation di service layer
    return this.transactionId;
  }

  /**
   * Handle webhook dari Midtrans
   * Implementation: Dihandle di PaymentService untuk process webhook payload
   *
   * @param payload Webhook payload dari Midtrans
   */
  handleWebhook(payload: Record<string, any>): void {
    if (payload) {
      this.webhookPayload = JSON.stringify(payload);
      this.diupdatePada = new Date();
    }
  }

  /**
   * Verifikasi signature dari webhook Midtrans
   * Implementation: Dihandle di PaymentService dengan Midtrans secret key
   *
   * @param signature Signature dari Midtrans
   * @returns true jika valid, false jika tidak
   */
  verifySignature(signature: string): boolean {
    // Implementation di service layer dengan Midtrans secret key
    return signature === this.signatureKey;
  }

  /**
   * Proses refund untuk payment
   * Implementation: Dihandle di PaymentService untuk integration dengan Midtrans refund API
   *
   * @returns true jika refund berhasil, false jika gagal
   */
  prosesRefund(): boolean {
    // Implementation di service layer
    if (this.status === PaymentStatus.SETTLEMENT) {
      this.status = PaymentStatus.REFUND;
      this.diupdatePada = new Date();
      return true;
    }
    return false;
  }
}
