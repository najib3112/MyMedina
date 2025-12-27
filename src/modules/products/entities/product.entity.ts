import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../../../common/enums/product-status.enum';
import { Category } from '../../categories/entities/category.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

/**
 * Product Entity
 *
 * OOP Concepts:
 * - Encapsulation: Product data and relationships in one class
 * - Abstraction: Hides database implementation details
 * - Relationships: ManyToOne with Category
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: Database/schema-simplified.sql (products table)
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (Product)
 * - Properties: Bahasa Indonesia (nama, deskripsi, hargaDasar, etc.)
 * - Database columns: English snake_case (name, description, base_price, etc.)
 */
@Entity('products')
  export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'category_id' })
    categoryId: string;

    @Column({ length: 255 })
    nama: string;

    @Column({ unique: true, length: 255 })
    slug: string;

    @Column({ type: 'text', nullable: true })
    deskripsi: string;

    @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
    hargaDasar: number;

    @Column({ name: 'weight', type: 'decimal', precision: 8, scale: 2 })
    berat: number;

    @Column({ name: 'length', type: 'decimal', precision: 8, scale: 2 })
    panjang: number;

    @Column({ name: 'width', type: 'decimal', precision: 8, scale: 2 })
    lebar: number;

    @Column({ name: 'height', type: 'decimal', precision: 8, scale: 2 })
    tinggi: number;

    @Column({
      type: 'enum',
      enum: ProductStatus,
      default: ProductStatus.READY,
    })
    status: ProductStatus;

    @Column({ default: true })
    aktif: boolean;

    @Column({ name: 'image_url', length: 500, nullable: true })
    gambarUrl: string;

    @CreateDateColumn({ name: 'created_at' })
    dibuatPada: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    diupdatePada: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    dihapusPada: Date;

    // ========================================
    // RELATIONSHIPS
    // ======================================== 

    /**
     * Category Relationship
     * Setiap produk belongs to satu kategori
     */
    @ManyToOne(() => Category, {
      nullable: false,
      onDelete: 'RESTRICT', // Prevent category deletion if has products
    })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    /**
     * Product Variants Relationship
     * Satu produk bisa punya banyak variant (size, color)
     * Based on: Class Diagram - Product has 1..* ProductVariant
     */
    @OneToMany(() => ProductVariant, (variant) => variant.product)
    variants: ProductVariant[];

    // ========================================
    // METHODS (sesuai Class Diagram)
    // ========================================

    /**
     * Ambil semua variants dari product
     *
     * @returns Array dari ProductVariant
     */
    ambilVariants(): ProductVariant[] {
      return this.variants || [];
    }

    /**
     * Ambil total stok tersedia dari semua variants
     *
     * @returns Total stok (integer)
     */
    ambilStokTersedia(): number {
      if (!this.variants || this.variants.length === 0) {
        return 0;
      }
      return this.variants.reduce(
        (total, variant) => total + (variant.stok || 0),
        0,
      );
    }

    /**
     * Cek apakah product tersedia (ada stok dan aktif)
     *
     * @returns true jika tersedia, false jika tidak
     */
    isTersedia(): boolean {
      return this.aktif && this.ambilStokTersedia() > 0;
    }
  }
