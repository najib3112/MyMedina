import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentsService } from './payments.service';

/**
 * Payments Controller
 *
 * OOP Concepts:
 * - Encapsulation: HTTP handling logic in controller
 * - Single Responsibility: Handles only HTTP requests/responses
 *
 * Design Patterns:
 * - Controller Pattern: Handles HTTP requests
 * - Dependency Injection: PaymentsService injected
 * - Guard Pattern: Authentication and authorization
 *
 * Note: Webhook endpoint is public (no auth) for Midtrans callback
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /payments - Create Payment
   * Customer only
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async buatPembayaran(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentsService.buatPembayaran(createPaymentDto);

    return {
      message: 'Pembayaran berhasil dibuat',
      payment,
    };
  }

  /**
   * GET /payments/order/:orderId - Get Payments by Order ID
   * Customer (own orders) or Admin (all orders)
   */
  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async ambilPembayaranByOrderId(@Param('orderId') orderId: string) {
    const payments =
      await this.paymentsService.ambilPembayaranByOrderId(orderId);

    return {
      message: 'Berhasil mengambil daftar pembayaran',
      total: payments.length,
      payments,
    };
  }

  /**
   * GET /payments/:id - Get Payment by ID
   * Customer (own payments) or Admin (all payments)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async ambilPembayaranById(@Param('id') id: string) {
    const payment = await this.paymentsService.ambilPembayaranById(id);

    return {
      message: 'Berhasil mengambil detail pembayaran',
      payment,
    };
  }

  /**
   * PUT /payments/:id/status - Update Payment Status
   * Admin/Owner only (manual update)
   */
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async updateStatusPembayaran(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.paymentsService.updateStatusPembayaran(
      id,
      updatePaymentStatusDto,
    );

    return {
      message: 'Status pembayaran berhasil diupdate',
      payment,
    };
  }

  /**
   * POST /payments/webhook - Midtrans Webhook Handler
   * Public endpoint (no auth) - called by Midtrans payment gateway
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: any) {
    // Verify Midtrans signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto
      .createHash('sha512')
      .update(
        `${webhookData.order_id}${webhookData.status_code}${webhookData.gross_amount}${serverKey}`,
      )
      .digest('hex');

    if (hash !== webhookData.signature_key) {
      throw new BadRequestException('Invalid signature');
    }

    // Get payment by transaction ID
    const payment = await this.paymentsService.ambilPembayaranByTransactionId(
      webhookData.order_id,
    );

    // Map Midtrans transaction status to our PaymentStatus
    let status: PaymentStatus;
    const transactionStatus = webhookData.transaction_status;
    const fraudStatus = webhookData.fraud_status;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        status = PaymentStatus.SETTLEMENT;
      } else if (fraudStatus === 'challenge') {
        status = PaymentStatus.PENDING;
      } else {
        status = PaymentStatus.DENY;
      }
    } else if (transactionStatus === 'settlement') {
      status = PaymentStatus.SETTLEMENT;
    } else if (transactionStatus === 'pending') {
      status = PaymentStatus.PENDING;
    } else if (transactionStatus === 'deny') {
      status = PaymentStatus.DENY;
    } else if (transactionStatus === 'expire') {
      status = PaymentStatus.EXPIRE;
    } else if (transactionStatus === 'cancel') {
      status = PaymentStatus.CANCEL;
    } else if (transactionStatus === 'refund') {
      status = PaymentStatus.REFUND;
    } else {
      status = PaymentStatus.PENDING;
    }

    // Update payment status
    await this.paymentsService.updateStatusPembayaran(payment.id, {
      status,
      webhookPayload: JSON.stringify(webhookData),
      signatureKey: webhookData.signature_key,
    });

    return {
      message: 'Webhook processed successfully',
    };
  }
}
