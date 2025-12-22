import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderType } from '../../../common/enums/order-type.enum';

/**
 * Order Entity
 *
 * OOP Concepts:
 * - Encapsulation: Order data and behavior in one class
 * - Abstraction: Hides database implementation details
 * - Data Modeling: Represents Order table in database
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (Order)
 * - Properties: Bahasa Indonesia (nomorOrder, userId, etc.)
 * - Database columns: English snake_case (order_number, user_id, etc.)
 */
@Entity('orders')
export class Order {
  // ========================================
  // PRIMARY KEY
  // ========================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // BASIC FIELDS
  // ========================================

  @Column({ name: 'order_number', unique: true, length: 50 })
  nomorOrder: string;

  // Note: userId is managed by the @ManyToOne relation below
  // Do not add a separate @Column for user_id as it conflicts with @JoinColumn

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  tipe: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  // ========================================
  // PRICING FIELDS
  // ========================================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: number;

  @Column({
    name: 'shipping_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  ongkosKirim: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  total: number;

  // ========================================
  // ADDITIONAL FIELDS
  // ========================================

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  metodePembayaran: string;

  @Column({ name: 'estimated_delivery', type: 'timestamp', nullable: true })
  estimasiPengiriman: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  dibayarPada: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  diselesaikanPada: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  dibatalkanPada: Date;

  // ========================================
  // ADDRESS SNAPSHOT (Denormalized)
  // ========================================

  @Column({ name: 'receiver_name', length: 255 })
  namaPenerima: string;

  @Column({ name: 'receiver_phone', length: 20 })
  teleponPenerima: string;

  @Column({ name: 'address_line1', type: 'text' })
  alamatBaris1: string;

  @Column({ name: 'address_line2', type: 'text', nullable: true })
  alamatBaris2: string;

  @Column({ length: 100 })
  kota: string;

  @Column({ length: 100 })
  provinsi: string;

  @Column({ name: 'postal_code', length: 10 })
  kodePos: string;

  // ========================================
  // TIMESTAMPS
  // ========================================

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  dikirimPada: Date;

  // Shipment-related optional fields
  @Column({ nullable: true })
  shipmentWaybill: string;

  @Column({ nullable: true })
  shipmentCourierCode: string;

  @Column({ type: 'timestamp', nullable: true })
  shipmentCreatedAt: Date;

  @Column({ nullable: true })
  selectedCourierCode: string;

  @Column({ nullable: true })
  selectedServiceCode: string;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * User Relationship
   * Setiap order belongs to satu user
   */
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * OrderItems Relationship
   * Setiap order memiliki banyak order items (1..*)
   * Based on: Class Diagram - Order contains 1..* OrderItem
   */
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  /**
   * Payment Relationship
   * Setiap order bisa memiliki banyak payments (1..*)
   * Based on: Class Diagram - Order has 1..* Payment
   */
  @OneToMany(() => Payment, (payment) => payment.order, {
    cascade: true,
  })
  payments: Payment[];

  /**
   * Shipment Relationship
   * Setiap order bisa memiliki maksimal 1 shipment (0..1)
   * Based on: Class Diagram - Order has 0..1 Shipment
   */
  @OneToOne(() => Shipment, (shipment) => shipment.order, {
    nullable: true,
    cascade: true,
  })
  shipment: Shipment;

  // ========================================
  // METHODS (sesuai Class Diagram)
  // ========================================

  /**
   * Generate nomor order unik
   * Format: ORD-YYYYMMDD-XXXXXX
   * Implementation: Dihandle di service layer
   *
   * @returns Nomor order yang baru
   */
  generateNomorOrder(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${year}${month}${day}-${random}`;
  }

  /**
   * Hitung total order
   * Total = subtotal + ongkosKirim
   *
   * @returns Total order (decimal)
   */
  hitungTotal(): number {
    return Number(this.subtotal) + Number(this.ongkosKirim);
  }

  /**
   * Update status order
   * Implementation: Dihandle di service layer dengan validation
   *
   * @param statusBaru Status order yang baru
   */
  updateStatus(statusBaru: OrderStatus): void {
    this.status = statusBaru;
    this.diupdatePada = new Date();
  }

  /**
   * Batalkan order
   * Set status = CANCELLED dan simpan waktu pembatalan
   * Implementation: Dihandle di service layer
   */
  batalkanOrder(): void {
    this.status = OrderStatus.CANCELLED;
    this.dibatalkanPada = new Date();
    this.diupdatePada = new Date();
  }

  /**
   * Ambil semua items dalam order
   *
   * @returns Array dari OrderItem
   */
  ambilItems(): OrderItem[] {
    return this.items || [];
  }

  /**
   * Ambil semua payments untuk order
   *
   * @returns Array dari Payment
   */
  ambilPayments(): Payment[] {
    return this.payments || [];
  }

  /**
   * Ambil shipment untuk order
   *
   * @returns Shipment atau undefined jika belum ada
   */
  ambilShipment(): Shipment | undefined {
    return this.shipment;
  }
}
