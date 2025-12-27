import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * ProductVariant Entity
 *
 * Menyimpan data variant produk seperti ukuran, warna, stok, dan harga khusus.
 */
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ unique: true, length: 100 })
  sku: string;

  @Column({ length: 50 })
  ukuran: string;

  @Column({ length: 50 })
  warna: string;

  @Column({ type: 'int', default: 0 })
  stok: number;

  /**
   * Harga tambahan untuk variant ini (misal: +50.000 karena ukuran besar atau warna spesial)
   */
  @Column({
    name: 'price_additional',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    default: null,
  })
  hargaTambahan: number | null;

  /**
   * Harga override: jika diisi, harga variant akan menggunakan nilai ini secara total
   * (mengabaikan hargaDasar produk + hargaTambahan)
   *
   * Kosong/null → gunakan logika harga normal (hargaDasar produk + hargaTambahan)
   */
  @Column({
    name: 'price_override',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    default: null,
  })
  hargaOverride: number | null;

  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @Column({ nullable: true, length: 500 })
  gambar?: string;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  @ManyToOne(() => Product, (product) => product.variants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // ========================================
  // METHODS
  // ========================================

  /**
   * Ambil harga akhir variant
   *
   * Logika prioritas:
   * 1. Jika hargaOverride terisi → pakai nilai itu (override total)
   * 2. Jika tidak → hargaDasar produk + hargaTambahan variant
   *
   * @returns Harga akhir dalam bentuk number (decimal aman)
   */
  ambilHarga(): number {
    // Prioritas 1: hargaOverride
    if (this.hargaOverride !== null) {
      return Number(this.hargaOverride);
    }

    // Prioritas 2: harga dasar produk + tambahan variant
    const hargaDasar = this.product?.hargaDasar ?? 0;
    const tambahan = this.hargaTambahan ?? 0;

    return Number(hargaDasar) + Number(tambahan);
  }

  /**
   * Kurangi stok variant
   *
   * @param kuantitas Jumlah yang dikurangi
   */
  kurangiStok(kuantitas: number): void {
    if (kuantitas > 0) {
      this.stok -= kuantitas;
      if (this.stok < 0) {
        this.stok = 0;
      }
    }
  }

  /**
   * Kembalikan stok variant (misalnya saat order dibatalkan)
   *
   * @param kuantitas Jumlah yang dikembalikan
   */
  kembalikanStok(kuantitas: number): void {
    if (kuantitas > 0) {
      this.stok += kuantitas;
    }
  }

  /**
   * Cek apakah stok cukup dan variant aktif
   *
   * @param kuantitas Jumlah yang dibutuhkan (default 1)
   * @returns true jika stok tersedia
   */
  isStokTersedia(kuantitas: number = 1): boolean {
    return this.aktif && this.stok >= kuantitas && kuantitas > 0;
  }
}