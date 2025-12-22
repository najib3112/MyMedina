import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

/**
 * Email Service
 *
 * Bertanggung jawab untuk mengirim email menggunakan Nodemailer.
 *
 * OOP Concepts:
 * - Encapsulation: Email sending logic dikapsulasi dalam service ini
 * - Single Responsibility: Hanya handle email sending
 * - Dependency Injection: Inject MailerService dan ConfigService
 *
 * Design Pattern:
 * - Service Pattern: Business logic untuk email
 * - Template Method Pattern: Reusable email templates
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Kirim Email Verifikasi
   *
   * Mengirim email berisi link verifikasi ke user yang baru register.
   *
   * @param email - Email tujuan
   * @param nama - Nama user
   * @param userId - ID user untuk link verifikasi
   * @param token - Token verifikasi (6 digit)
   */
  async kirimEmailVerifikasi(
    email: string,
    nama: string,
    userId: string,
    token: string,
  ): Promise<void> {
    try {
      const verificationUrl = `${this.frontendUrl}/verifikasi-email?userId=${userId}&token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: '✅ Verifikasi Email Anda - MyMedina',
        template: 'verification', // akan menggunakan verification.hbs
        context: {
          nama,
          token,
          verificationUrl,
          frontendUrl: this.frontendUrl,
        },
      });

      this.logger.log(`Email verifikasi berhasil dikirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal mengirim email verifikasi ke ${email}:`, error);
      // Tidak throw error agar proses registrasi tetap berhasil
      // User masih bisa verifikasi manual dengan token
    }
  }

  /**
   * Kirim Email Reset Password
   *
   * Mengirim email berisi link reset password ke user yang lupa password.
   *
   * @param email - Email tujuan
   * @param nama - Nama user
   * @param token - Token reset password
   */
  async kirimEmailResetPassword(
    email: string,
    nama: string,
    token: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: '🔐 Reset Password Anda - MyMedina',
        template: 'reset-password', // akan menggunakan reset-password.hbs
        context: {
          nama,
          resetUrl,
          frontendUrl: this.frontendUrl,
        },
      });

      this.logger.log(`Email reset password berhasil dikirim ke ${email}`);
    } catch (error) {
      this.logger.error(
        `Gagal mengirim email reset password ke ${email}:`,
        error,
      );
      // Tidak throw error agar proses request reset tetap berhasil
    }
  }

  /**
   * Kirim Email Welcome (Optional)
   *
   * Mengirim email selamat datang setelah user berhasil verifikasi email.
   *
   * @param email - Email tujuan
   * @param nama - Nama user
   */
  async kirimEmailWelcome(email: string, nama: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🎉 Selamat Datang di MyMedina!',
        template: 'welcome', // akan menggunakan welcome.hbs
        context: {
          nama,
          frontendUrl: this.frontendUrl,
        },
      });

      this.logger.log(`Email welcome berhasil dikirim ke ${email}`);
    } catch (error) {
      this.logger.error(`Gagal mengirim email welcome ke ${email}:`, error);
    }
  }

  /**
   * Send waybill/tracking email to customer
   */
  async sendWaybillEmail(recipientEmail: string, order: any, waybill: string) {
    try {
      const trackingUrl = `${this.frontendUrl}/tracking/${waybill}/${order.shipmentCourierCode}`;

      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: `Pesanan Anda #${order.nomorOrder} - Sudah Dikirim!`,
        template: 'waybill',
        context: {
          order,
          waybill,
          trackingUrl,
          frontendUrl: this.frontendUrl,
        },
      });

      this.logger.log(`Waybill email sent to ${recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send waybill email to ${recipientEmail}:`, error);
    }
  }
}

