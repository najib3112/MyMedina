import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

/**
 * OrderItem Entity
 *
 * OOP Concepts:
 * - Encapsulation: OrderItem data and behavior in one class
 * - Abstraction: Hides database implementation details
 * - Data Modeling: Represents OrderItem table in database
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (OrderItem)
 * - Properties: Bahasa Indonesia (orderId, productId, etc.)
 * - Database columns: English snake_case (order_id, product_id, etc.)
 *
 * Note: Product/Variant data is DENORMALIZED (snapshot) for data integrity
 * Even if product/variant is deleted or price changes, order history remains accurate
 */
@Entity('order_items')
export class OrderItem {
  // ========================================
  // PRIMARY KEY
  // ========================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // FOREIGN KEYS
  // ========================================

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'variant_id' })
  variantId: string;

  // ========================================
  // PRODUCT/VARIANT SNAPSHOT (Denormalized)
  // ========================================

  @Column({ name: 'product_name', length: 255 })
  namaProduct: string;

  @Column({ name: 'product_sku', length: 100 })
  skuProduct: string;

  @Column({ name: 'variant_size', length: 50 })
  ukuranVariant: string;

  @Column({ name: 'variant_color', length: 50 })
  warnaVariant: string;

  // ========================================
  // QUANTITY & PRICING
  // ========================================

  @Column({ type: 'int' })
  kuantitas: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  hargaSatuan: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: number;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * Order Relationship
   * Setiap order item belongs to satu order
   */
  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  /**
   * Product Relationship
   * Reference to product (for historical tracking)
   */
  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /**
   * ProductVariant Relationship
   * Reference to variant (for historical tracking)
   */
  @ManyToOne(() => ProductVariant, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // ========================================
  // METHODS (sesuai Class Diagram)
  // ========================================

  /**
   * Hitung subtotal item
   * Subtotal = hargaSatuan * kuantitas
   *
   * @returns Subtotal (decimal)
   */
  hitungSubtotal(): number {
    return Number(this.hargaSatuan) * this.kuantitas;
  }
}
