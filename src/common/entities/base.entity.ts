import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Base Entity
 * Abstract class that all entities will extend
 *
 * OOP Concepts:
 * - Abstraction: Abstract class cannot be instantiated directly
 * - Inheritance: All entities inherit from this base class
 * - DRY Principle: Common fields defined once
 * - Encapsulation: Common behavior in one place
 */
export abstract class BaseEntity {
  /**
   * Primary Key (UUID)
   * Auto-generated UUID for all entities
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Created At Timestamp
   * Automatically set when entity is created
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Updated At Timestamp
   * Automatically updated when entity is modified
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Deleted At Timestamp (Soft Delete)
   * When set, entity is considered deleted but still in database
   */
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  /**
   * Check if entity is soft deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Check if entity is new (not yet saved to database)
   */
  isNew(): boolean {
    return !this.id;
  }
}
