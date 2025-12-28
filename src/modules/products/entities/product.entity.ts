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
 * Product Entity - FIXED VERSION
 *
 * Pastikan column names sesuai dengan database schema
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({
    name: 'base_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  hargaDasar: number;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: false,
  })
  berat: number;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: false,
  })
  panjang: number;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: false,
  })
  lebar: number;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
    nullable: false,
  })
  tinggi: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.READY,
  })
  status: ProductStatus;

  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  gambarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  dihapusPada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  @ManyToOne(() => Category, {
    nullable: false,
    onDelete: 'RESTRICT',
    eager: false, // Jangan auto-load, gunakan explicit relations
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    eager: false,
  })
  variants: ProductVariant[];

  // ========================================
  // METHODS
  // ========================================

  ambilVariants(): ProductVariant[] {
    return this.variants || [];
  }

  ambilStokTersedia(): number {
    if (!this.variants || this.variants.length === 0) {
      return 0;
    }
    return this.variants.reduce(
      (total, variant) => total + (variant.stok || 0),
      0,
    );
  }

  isTersedia(): boolean {
    return this.aktif && this.ambilStokTersedia() > 0;
  }
}
