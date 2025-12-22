import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as midtransClient from 'midtrans-client';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Payment } from './entities/payment.entity';

/**
 * Payments Service
 *
 * OOP Concepts:
 * - Encapsulation: Business logic encapsulated in service
 * - Single Responsibility: Handles only payment-related operations
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access through TypeORM repositories
 * - Dependency Injection: Dependencies injected via constructor
 *
 * Midtrans Integration:
 * - Uses Midtrans Snap API for payment gateway
 * - Supports multiple payment methods (Bank Transfer, QRIS, E-Wallet, Credit Card)
 */
@Injectable()
export class PaymentsService {
  private snap: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    // Initialize Midtrans Snap Client
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }

  /**
   * Generate unique transaction ID with timestamp for better uniqueness
   * Format: TRX-YYYYMMDD-HHMMSS-RND
   * 
   * FIX: Menambahkan timestamp lengkap dan random number untuk menghindari collision
   */
  private generateTransactionId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Add random 4-digit number untuk extra uniqueness
    const random = Math.floor(1000 + Math.random() * 9000);
    
    return `TRX-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  }

  /**
   * Create Payment
   * Initiates payment for an order
   */
  async buatPembayaran(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { orderId, metode } = createPaymentDto;

    // Get order with relations
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    // Validate order status
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order dengan status ${order.status} tidak dapat dibayar`,
      );
    }

    // Check if there's already a pending payment
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        orderId,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment) {
      throw new BadRequestException(
        'Order ini sudah memiliki pembayaran yang sedang pending',
      );
    }

    // Generate transaction ID (synchronous sekarang, lebih cepat)
    const transactionId = this.generateTransactionId();

    // Calculate expiry (24 hours from now)
    const kadaluarsaPada = new Date();
    kadaluarsaPada.setHours(kadaluarsaPada.getHours() + 24);

    // Format start_time for Midtrans expiry (yyyy-MM-dd hh:mm:ss Z)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const startTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;

    // Prepare item_details array (must include ALL items + shipping)
    const itemDetails = [
      // Product items
      ...order.items.map((item) => ({
        id: item.variantId,
        price: Math.round(Number(item.hargaSatuan)),
        quantity: item.kuantitas,
        name: `${item.namaProduct} - ${item.ukuranVariant} ${item.warnaVariant}`.substring(0, 50), // Midtrans limit 50 chars
      })),
      // Shipping cost as separate item
      {
        id: 'SHIPPING',
        price: Math.round(Number(order.ongkosKirim)),
        quantity: 1,
        name: 'Ongkos Kirim',
      },
    ];

    // Prepare Midtrans transaction parameters
    const parameter = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: Math.round(Number(order.total)),
      },
      customer_details: {
        first_name: order.namaPenerima,
        email: order.user.email,
        phone: order.teleponPenerima,
        billing_address: {
          first_name: order.namaPenerima,
          phone: order.teleponPenerima,
          address: order.alamatBaris1,
          city: order.kota,
          postal_code: order.kodePos,
          country_code: 'IDN',
        },
        shipping_address: {
          first_name: order.namaPenerima,
          phone: order.teleponPenerima,
          address: order.alamatBaris1,
          city: order.kota,
          postal_code: order.kodePos,
          country_code: 'IDN',
        },
      },
      item_details: itemDetails,
      expiry: {
        start_time: startTime,
        unit: 'hours',
        duration: 24,
      },
    };

    // Create payment entity FIRST before calling Midtrans
    const payment = this.paymentRepository.create({
      orderId,
      transactionId,
      metode,
      status: PaymentStatus.PENDING,
      jumlah: order.total,
      kadaluarsaPada,
      diinisiasiPada: new Date(),
    });

    try {
      // Call Midtrans Snap API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const midtransResponse = await this.snap.createTransaction(parameter);

      // Update payment with Midtrans URL
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      payment.urlPembayaran = midtransResponse.redirect_url;

      // Save to database
      return await this.paymentRepository.save(payment);
      
    } catch (error) {
      // Log detailed error untuk debugging
      console.error('Midtrans Error Details:', {
        transactionId,
        orderId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: error?.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        response: error?.ApiResponse,
      });

      // Jika error "already been taken", coba generate ID baru dan retry
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.message?.includes('already been taken')) {
        console.log('Transaction ID collision detected, generating new ID...');
        
        // Generate new transaction ID with extra random suffix
        const retryTransactionId = `${transactionId}-RETRY-${Date.now()}`;
        payment.transactionId = retryTransactionId;
        parameter.transaction_details.order_id = retryTransactionId;

        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          const retryResponse = await this.snap.createTransaction(parameter);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          payment.urlPembayaran = retryResponse.redirect_url;
          return await this.paymentRepository.save(payment);
        } catch (retryError) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          throw new BadRequestException(`Gagal membuat pembayaran setelah retry: ${retryError?.message}`);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const errorMessage = error?.message || 'Unknown error';
      throw new BadRequestException(
        `Gagal membuat pembayaran: ${errorMessage}`,
      );
    }
  }

  /**
   * Map PaymentMethod enum to Midtrans payment type
   */
  private mapPaymentMethodToMidtrans(metode: PaymentMethod): string {
    const mapping = {
      [PaymentMethod.BANK_TRANSFER]: 'bank_transfer',
      [PaymentMethod.QRIS]: 'qris',
      [PaymentMethod.E_WALLET]: 'gopay',
      [PaymentMethod.CREDIT_CARD]: 'credit_card',
    };

    return mapping[metode] || 'bank_transfer';
  }

  /**
   * Get Payment by Order ID
   */
  async ambilPembayaranByOrderId(orderId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { orderId },
      relations: ['order'],
      order: { dibuatPada: 'DESC' },
    });
  }

  /**
   * Get Payment by ID
   */
  async ambilPembayaranById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment dengan ID ${paymentId} tidak ditemukan`,
      );
    }

    return payment;
  }

  /**
   * Get Payment by Transaction ID
   * Used for webhook processing
   */
  async ambilPembayaranByTransactionId(
    transactionId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment dengan transaction ID ${transactionId} tidak ditemukan`,
      );
    }

    return payment;
  }

  /**
   * Update Payment Status
   * Updates payment status and order status accordingly
   */
  async updateStatusPembayaran(
    paymentId: string,
    updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment dengan ID ${paymentId} tidak ditemukan`,
      );
    }

    const { status, webhookPayload, signatureKey } = updatePaymentStatusDto;

    // Update payment status
    payment.status = status;

    if (webhookPayload) {
      payment.webhookPayload = webhookPayload;
    }

    if (signatureKey) {
      payment.signatureKey = signatureKey;
    }

    // Update settlement time if payment is successful
    if (status === PaymentStatus.SETTLEMENT) {
      payment.waktuSettlement = new Date();

      // Update order status to PAID
      const order = payment.order;
      order.status = OrderStatus.PAID;
      order.dibayarPada = new Date();
      await this.orderRepository.save(order);
    }

    // If payment expired or cancelled, allow new payment attempt
    if (
      status === PaymentStatus.EXPIRE ||
      status === PaymentStatus.CANCEL ||
      status === PaymentStatus.DENY
    ) {
      // Order remains in PENDING_PAYMENT status
      // Customer can create new payment
    }

    return await this.paymentRepository.save(payment);
  }

  /**
   * Buat transaksi Midtrans
   * Menggunakan method entity: buatTransaksiMidtrans()
   *
   * @param paymentId - ID payment
   * @returns Transaction ID atau Snap token
   */
  async buatTransaksiMidtransPayment(paymentId: string): Promise<string> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    // Gunakan method entity
    return payment.buatTransaksiMidtrans();
  }

  /**
   * Handle webhook dari Midtrans
   * Menggunakan method entity: handleWebhook()
   *
   * @param paymentId - ID payment
   * @param payload - Webhook payload dari Midtrans
   */
  async handleWebhookPayment(
    paymentId: string,
    payload: Record<string, any>,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    // Gunakan method entity
    payment.handleWebhook(payload);

    return await this.paymentRepository.save(payment);
  }

  /**
   * Verifikasi signature dari webhook Midtrans
   * Menggunakan method entity: verifySignature()
   *
   * @param paymentId - ID payment
   * @param signature - Signature dari Midtrans
   * @returns true jika valid
   */
  async verifySignaturePayment(
    paymentId: string,
    signature: string,
  ): Promise<boolean> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    // Gunakan method entity
    return payment.verifySignature(signature);
  }

  /**
   * Proses refund untuk payment
   * Menggunakan method entity: prosesRefund()
   *
   * @param paymentId - ID payment
   * @returns true jika refund berhasil
   */
  async prosesRefundPayment(paymentId: string): Promise<boolean> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    // Gunakan method entity
    const refundSuccess = payment.prosesRefund();

    if (refundSuccess) {
      // Update order status
      const order = payment.order;
      order.status = OrderStatus.REFUNDED;
      await this.orderRepository.save(order);

      await this.paymentRepository.save(payment);
    }

    return refundSuccess;
  }
}