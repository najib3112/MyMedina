import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ShipmentStatus } from '../../../common/enums/shipment-status.enum';

/**
 * Shipment Entity - Disesuaikan dengan Class Diagram
 */
@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', unique: true })
  orderId: string;

  // BITESHIP INTEGRATION FIELDS
  @Column({ name: 'biteship_order_id', nullable: true })
  biteshipOrderId: string;

  @Column({ name: 'biteship_tracking_id', nullable: true })
  biteshipTrackingId: string;

  @Column({ name: 'courier_tracking_url', nullable: true })
  courierTrackingUrl: string;

  @Column({ name: 'courier_waybill_id', nullable: true })
  courierWaybillId: string;

  // SHIPMENT FIELDS (sesuai diagram)
  @Column({ length: 100, nullable: true })
  kurir: string;

  @Column({ length: 100, nullable: true })
  layanan: string;

  @Column({ name: 'tracking_number', length: 255, nullable: true })
  nomorResi: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  biaya: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  deskripsi: string;

  @Column({ name: 'estimated_delivery', type: 'timestamp', nullable: true })
  estimasiPengiriman: Date;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  dikirimPada: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  diterimaPada: Date;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * Order Relationship
   * Setiap shipment memiliki hubungan OneToOne dengan Order
   * Based on: Class Diagram - Shipment has 0..1 relationship with Order
   */
  @OneToOne(() => Order, (order) => order.shipment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // ========================================
  // METHODS (sesuai Class Diagram)
  // ========================================

  /**
   * Update tracking info (nomor resi)
   *
   * @param nomorResi Nomor resi pengiriman baru
   */
  updateTrackingInfo(nomorResi: string): void {
    this.nomorResi = nomorResi;
    this.diupdatePada = new Date();
  }

  /**
   * Update status shipment
   *
   * @param statusBaru Status shipment yang baru
   */
  updateStatus(statusBaru: ShipmentStatus): void {
    this.status = statusBaru;
    this.diupdatePada = new Date();
  }

  /**
   * Tandai shipment sebagai dikirim
   * Set status ke SHIPPED dan simpan waktu pengiriman
   */
  tandaSebagaiDikirim(): void {
    this.status = ShipmentStatus.SHIPPED;
    this.dikirimPada = new Date();
    this.diupdatePada = new Date();
  }

  /**
   * Tandai shipment sebagai diterima
   * Set status ke DELIVERED dan simpan waktu penerimaan
   */
  tandaSebagaiDiterima(): void {
    this.status = ShipmentStatus.DELIVERED;
    this.diterimaPada = new Date();
    this.diupdatePada = new Date();
  }
}
