import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { EmailService } from '../../shared/email/email.service';

import { DaftarDto } from './dto/daftar.dto';
import { LoginDto } from './dto/login.dto';
import { LupaPasswordDto } from './dto/lupa-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from './entities/user.entity';

/**
 * Auth Service
 *
 * OOP Concepts:
 * - Encapsulation: Business logic untuk authentication
 * - Single Responsibility: Hanya handle auth logic
 * - Dependency Injection: Inject Repository, JwtService, EmailService
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access via TypeORM Repository
 *
 * Based on:
 * - Sequence-Register-SIMPLIFIED.puml
 * - Sequence-Login.puml
 * - Sequence-Email-Verification-SIMPLIFIED.puml
 * - Sequence-Auth-Forgot-Password.puml
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Daftar Pengguna Baru (Register)
   *
   * Flow:
   * 1. Cek apakah email sudah terdaftar
   * 2. Hash password dengan bcrypt (cost 12)
   * 3. Generate token verifikasi email (6 digit random)
   * 4. Set token expiry (24 jam dari sekarang)
   * 5. Simpan user ke database dengan token
   * 6. Kirim email verifikasi (TODO: implement email service)
   *
   * @param daftarDto - Data pendaftaran user
   * @returns User yang baru dibuat (tanpa password)
   */
  async daftarPengguna(daftarDto: DaftarDto) {
    const { email, password, nama, nomorTelepon } = daftarDto;

    // Cek apakah email sudah terdaftar
    const userSudahAda = await this.userRepository.findOne({
      where: { email },
    });

    if (userSudahAda) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password dengan bcrypt (cost 12)
    const hashPassword = await bcrypt.hash(password, 12);

    // Generate token verifikasi email (6 digit random number)
    const tokenVerifikasi = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Set token expiry (24 jam dari sekarang)
    const tokenVerifikasiKadaluarsa = new Date();
    tokenVerifikasiKadaluarsa.setHours(
      tokenVerifikasiKadaluarsa.getHours() + 24,
    );

    // Buat user baru dengan token verifikasi
    const userBaru = this.userRepository.create({
      email,
      hashPassword,
      nama,
      nomorTelepon,
      emailTerverifikasi: false,
      aktif: true,
      tokenVerifikasi,
      tokenVerifikasiKadaluarsa,
    });

    // Simpan ke database
    const userTersimpan = await this.userRepository.save(userBaru);

    // Kirim email verifikasi (async, tidak perlu await agar tidak blocking)
    this.emailService
      .kirimEmailVerifikasi(email, nama, userTersimpan.id, tokenVerifikasi)
      .catch((error) => {
        // Log error tapi tidak throw agar registrasi tetap berhasil
        console.error('Error sending verification email:', error);
      });

    // Return user tanpa password
    const { hashPassword: _, ...userTanpaPassword } = userTersimpan;
    return {
      message: 'Pendaftaran berhasil! Silakan cek email untuk verifikasi.',
      user: userTanpaPassword,
      // Untuk development, return token (HAPUS di production!)
      tokenVerifikasi:
        process.env.NODE_ENV === 'development' ? tokenVerifikasi : undefined,
    };
  }

  /**
   * Login Pengguna
   *
   * Flow:
   * 1. Cari user berdasarkan email
   * 2. Validasi password dengan bcrypt.compare()
   * 3. Cek apakah email sudah terverifikasi
   * 4. Cek apakah user aktif
   * 5. Generate JWT token
   * 6. Return token dan user data
   *
   * @param loginDto - Data login (email, password)
   * @returns JWT access token dan user data
   */
  async loginPengguna(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Cari user berdasarkan email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Validasi password
    const passwordValid = await bcrypt.compare(password, user.hashPassword);

    if (!passwordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Cek apakah email sudah terverifikasi
    if (!user.emailTerverifikasi) {
      throw new UnauthorizedException(
        'Email belum diverifikasi. Silakan cek email Anda.',
      );
    }

    // Cek apakah user aktif
    if (!user.aktif) {
      throw new UnauthorizedException(
        'Akun Anda telah dinonaktifkan. Hubungi admin.',
      );
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Return token dan user data (tanpa password)
    const { hashPassword: _, ...userTanpaPassword } = user;

    return {
      message: 'Login berhasil',
      accessToken,
      user: userTanpaPassword,
    };
  }

  /**
   * Verifikasi Email
   *
   * Flow:
   * 1. Cari user berdasarkan userId
   * 2. Cek apakah token verifikasi valid dan belum expired
   * 3. Bandingkan token dari request dengan token di database
   * 4. Update emailTerverifikasi = true
   * 5. Hapus token verifikasi dari database
   *
   * @param userId - ID user yang akan diverifikasi
   * @param token - Token verifikasi (6 digit)
   * @returns Success message
   */
  async verifikasiEmail(userId: string, token: string) {
    // Cari user berdasarkan userId
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Cek apakah token verifikasi ada
    if (!user.tokenVerifikasi || !user.tokenVerifikasiKadaluarsa) {
      throw new BadRequestException(
        'Token verifikasi tidak valid atau sudah kadaluarsa',
      );
    }

    // Cek apakah token sudah expired
    if (new Date() > user.tokenVerifikasiKadaluarsa) {
      throw new BadRequestException('Token verifikasi sudah kadaluarsa');
    }

    // Bandingkan token
    if (token !== user.tokenVerifikasi) {
      throw new BadRequestException('Token verifikasi salah');
    }

    // Update user: set emailTerverifikasi = true dan hapus token
    user.emailTerverifikasi = true;
    user.tokenVerifikasi = null;
    user.tokenVerifikasiKadaluarsa = null;
    await this.userRepository.save(user);

    // Kirim email welcome (optional, async)
    this.emailService
      .kirimEmailWelcome(user.email, user.nama)
      .catch((error) => {
        console.error('Error sending welcome email:', error);
      });

    return {
      message: 'Email berhasil diverifikasi! Silakan login.',
    };
  }

  /**
   * Kirim Token Reset Password
   *
   * Flow:
   * 1. Cari user berdasarkan email
   * 2. Generate random token (32 bytes hex)
   * 3. Set token expiry (1 jam dari sekarang)
   * 4. Simpan token dan expiry ke database
   * 5. Kirim email dengan link reset password
   *
   * @param lupaPasswordDto - Email user
   * @returns Success message
   */
  async kirimTokenResetPassword(lupaPasswordDto: LupaPasswordDto) {
    const { email } = lupaPasswordDto;

    // Cari user berdasarkan email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Jangan kasih tahu kalau email tidak terdaftar (security best practice)
      return {
        message:
          'Jika email terdaftar, link reset password akan dikirim ke email Anda.',
      };
    }

    // Generate random token (32 bytes = 64 karakter hex)
    const tokenReset = randomBytes(32).toString('hex');

    // Set token expiry (1 jam dari sekarang)
    const tokenResetKadaluarsa = new Date();
    tokenResetKadaluarsa.setHours(tokenResetKadaluarsa.getHours() + 1);

    // Simpan token ke database
    user.tokenReset = tokenReset;
    user.tokenResetKadaluarsa = tokenResetKadaluarsa;
    await this.userRepository.save(user);

    // Kirim email reset password (async, tidak blocking)
    this.emailService
      .kirimEmailResetPassword(email, user.nama, tokenReset)
      .catch((error) => {
        console.error('Error sending reset password email:', error);
      });

    return {
      message:
        'Jika email terdaftar, link reset password akan dikirim ke email Anda.',
      // Untuk development, return token (HAPUS di production!)
      tokenReset:
        process.env.NODE_ENV === 'development' ? tokenReset : undefined,
    };
  }

  /**
   * Reset Password
   *
   * Flow:
   * 1. Cari user berdasarkan token reset
   * 2. Cek apakah token masih valid (belum kadaluarsa)
   * 3. Hash password baru
   * 4. Update password dan hapus token reset
   *
   * @param token - Token reset password
   * @param resetPasswordDto - Password baru
   * @returns Success message
   */
  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { passwordBaru } = resetPasswordDto;

    // Cari user berdasarkan token
    const user = await this.userRepository.findOne({
      where: { tokenReset: token },
    });

    if (!user) {
      throw new BadRequestException('Token reset password tidak valid');
    }

    // Cek apakah token sudah kadaluarsa
    if (!user.tokenResetKadaluarsa || user.tokenResetKadaluarsa < new Date()) {
      throw new BadRequestException('Token reset password sudah kadaluarsa');
    }

    // Hash password baru
    const hashPasswordBaru = await bcrypt.hash(passwordBaru, 12);

    // Update password dan hapus token
    user.hashPassword = hashPasswordBaru;
    user.tokenReset = null;
    user.tokenResetKadaluarsa = null;
    await this.userRepository.save(user);

    return {
      message: 'Password berhasil direset! Silakan login dengan password baru.',
    };
  }
}
