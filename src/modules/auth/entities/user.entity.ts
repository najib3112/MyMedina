import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Address } from './address.entity';

/**
 * User Entity
 *
 * OOP Concepts:
 * - Encapsulation: User data and behavior in one class
 * - Abstraction: Hides database implementation details
 * - Data Modeling: Represents User table in database
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (User)
 * - Properties: Bahasa Indonesia (nama, nomorTelepon, etc.)
 * - Database columns: English snake_case (name, phone, etc.)
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  hashPassword: string;

  @Column({ length: 255 })
  nama: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  nomorTelepon: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
  })
  role: Role;

  @Column({ name: 'email_verified', default: false })
  emailTerverifikasi: boolean;

  @Column({ default: true })
  aktif: boolean;

  @Column({ name: 'profile_picture', nullable: true })
  fotoProfil: string;

  @Column({ name: 'verification_token', type: 'varchar', length: 6, nullable: true })
  tokenVerifikasi: string | null;

  @Column({ name: 'verification_token_expires', type: 'timestamp', nullable: true })
  tokenVerifikasiKadaluarsa: Date | null;

  @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  tokenReset: string | null;

  @Column({ name: 'reset_token_expires', type: 'timestamp', nullable: true })
  tokenResetKadaluarsa: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  dihapusPada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * User memiliki banyak addresses
   * Cascade delete: jika user dihapus, semua addresses juga dihapus
   */
  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
    eager: false,
  })
  addresses: Address[];

  // Methods akan ditambahkan di AuthService (mengikuti NestJS best practices)
  // - daftarPengguna()
  // - loginPengguna()
  // - verifikasiEmail()
  // - kirimTokenResetPassword()
  // - resetPassword()
  // - updateProfil()
}

