import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * Category Entity
 *
 * OOP Concepts:
 * - Encapsulation: Category data and relationships in one class
 * - Abstraction: Hides database implementation details
 * - Self-referencing relationship: Parent-child categories (nested)
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 * - Composite Pattern: Tree structure for nested categories
 *
 * Based on: Database/schema-simplified.sql (categories table)
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (Category)
 * - Properties: Bahasa Indonesia (nama, deskripsi, etc.)
 * - Database columns: English snake_case (name, description, etc.)
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nama: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ default: true })
  aktif: boolean;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * Parent Category (Self-referencing)
   * Untuk nested categories (e.g., "Gamis" -> "Gamis Syar'i")
   */
  @ManyToOne(() => Category, (category) => category.subKategori, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category;

  /**
   * Sub Categories (Children)
   * Kategori anak dari kategori ini
   */
  @OneToMany(() => Category, (category) => category.parent)
  subKategori: Category[];

  /**
   * Products Relationship
   * Setiap kategori bisa memiliki banyak produk (0..*)
   * Based on: Class Diagram - Category contains 0..* Product
   */
  @OneToMany(() => Product, (product) => product.category, {
    nullable: true,
  })
  products: Product[];

  // ========================================
  // METHODS (sesuai Class Diagram)
  // ========================================

  /**
   * Ambil semua sub kategori
   *
   * @returns Array dari Category (sub-categories)
   */
  ambilSubKategori(): Category[] {
    return this.subKategori || [];
  }

  /**
   * Ambil semua products dalam kategori ini
   *
   * @returns Array dari Product
   */
  ambilProducts(): Product[] {
    return this.products || [];
  }
}
