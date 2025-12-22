/**
 * CONTOH IMPLEMENTASI - Shipment Module Integration
 * 
 * File ini menunjukkan cara mengintegrasikan Shipment Module
 * dengan bagian lain dari aplikasi (payments, orders, email, etc)
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository, MigrationInterface, QueryRunner, TableColumn, Entity, BaseEntity, Column } from 'typeorm';
import { BiteshipService } from './biteship.service';
import { ShipmentsService } from './shipments.service';
import { EmailService as SharedEmailService } from '../../shared/email/email.service';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Test, TestingModule } from '@nestjs/testing';

// ============================================================================
// 1. PAYMENT WEBHOOK - Saat Payment Berhasil (Midtrans Callback)
// ============================================================================

// payments.service.ts
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private ordersRepository: Repository<Order>,
    private shipmentService: ShipmentsService,
    private emailService: SharedEmailService,
  ) {}

  /**
   * Handle payment callback dari Midtrans
   * CRITICAL: Call shipment order creation di sini
   */
  async handleMidtransCallback(transactionData: any) {
    const { order_id, transaction_status } = transactionData;
    
    // Get order
    const order = await this.ordersRepository.findOne({
      where: { nomorOrder: order_id },
      relations: ['user', 'items', 'address'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update payment status
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      order.status = OrderStatus.PAID;
      // Mark paid timestamp instead of non-existing paymentStatus column
      order.dibayarPada = new Date();
      await this.ordersRepository.save(order);

      this.logger.log(`Payment success for order ${order.id}`, PaymentsService.name);

      // ================================================================
      // PENTING: Langsung create shipment order di Biteship
      // ================================================================
      try {
        const shipmentResult = await this.shipmentService.createShipment(order);
        
        // Simpan waybill ke order
        order.shipmentWaybill = shipmentResult.data.waybill;
        order.shipmentCourierCode = shipmentResult.data.courier_code;
        order.shipmentCreatedAt = new Date();
        await this.ordersRepository.save(order);

        // Send email dengan waybill
        await this.emailService.sendWaybillEmail(
          order.user.email,
          order,
          shipmentResult.data.waybill,
        );

        this.logger.log(`Shipment created: Waybill ${shipmentResult.data.waybill}`, PaymentsService.name);
      } catch (error) {
        this.logger.error('Failed to create shipment order', (error && error.message) || error, PaymentsService.name);
        // Handle gracefully - user sudah bayar, jangan fail
        // Bisa retry nanti via manual trigger
      }
    }
  }
}

// Shipment service is implemented in src/modules/shipments/shipments.service.ts
// Use that service via DI; do not redeclare it here to avoid runtime initialization errors.

/*
  Frontend checkout flow example removed from server-side file.
  Keep frontend/browser code in client app to avoid mixing runtime environments.
*/

/* Tracking component (Angular) removed from server code. Keep UI components in client app. */

/* Email sending utility removed — use shared/email EmailService instead (imported as SharedEmailService). */

/* Duplicated Order entity and migration removed from this example file. Real definitions exist in src/modules/orders/entities/order.entity.ts and migrations folder. */

// ============================================================================
// 8. ERROR HANDLING
// ============================================================================

// Helper to call Biteship and normalize errors
async function callBiteshipCreate(biteshipService: BiteshipService, orderData: any) {
  try {
    const result = await biteshipService.createOrder(orderData);
    return result;
  } catch (error) {
    if (error.response?.status === 400) {
      // Bad request - invalid data format
      throw new BadRequestException(error.response.data.message);
    } else if (error.response?.status === 401) {
      // Unauthorized - invalid API key
      throw new UnauthorizedException('Biteship API key invalid');
    } else if (error.response?.status === 500) {
      // Biteship server error - retry later
      throw new InternalServerErrorException(
        'Shipment service temporarily unavailable',
      );
    }
    throw error;
  }
}

// ============================================================================
// 9. TESTING
// ============================================================================

import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';

@Controller('shipment')
export class ShipmentController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly biteshipService: BiteshipService,
  ) {}

  @Post('rates')
  async getRates(@Body() body: any) {
    return await this.biteshipService.getRates(body);
  }

  @Get('areas')
  async getAreas(@Query('input') input: string) {
    return await this.biteshipService.cariLokasi(input, 'ID');
  }

  @Post('order')
  async createOrder(@Body() body: any) {
    // If orderId present, create shipment via ShipmentsService which will create Biteship order and record Shipment
    if (body && body.orderId) {
      return await this.shipmentsService.buatPengirimanDenganBiteship(body);
    }
    return await this.biteshipService.createOrder(body);
  }

  @Get('tracking/:waybill/:courier')
  async tracking(@Param('waybill') waybill: string, @Param('courier') courier: string) {
    return await this.biteshipService.trackingShipment(waybill, courier);
  }
}
