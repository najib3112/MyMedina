import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ShipmentController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { BiteshipService } from './biteship.service';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';

/**
 * Shipments Module
 * 
 * Production-ready module untuk Shipment Management
 * dengan integrasi Biteship Shipping API
 * 
 * Menyediakan:
 * - Shipping rate calculation
 * - Order creation & waybill generation
 * - Real-time tracking
 * - Location/Area search
 * - Courier information
 * 
 * OOP Concepts:
 * - Encapsulation: Groups related shipment functionality
 * - Module Pattern: Organizes code into cohesive units
 * - Single Responsibility: Each service handles specific concern
 * 
 * Design Patterns:
 * - Module Pattern: NestJS module system
 * - Dependency Injection: Provides services and repositories
 * - Service Locator: BiteshipService untuk API integration
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, Order]),
    HttpModule,  // Untuk HTTP calls ke Biteship API
  ],
  controllers: [ShipmentController],
  providers: [
    ShipmentsService,
    BiteshipService,  // Service untuk Biteship API integration
  ],
  exports: [ShipmentsService, BiteshipService, TypeOrmModule],
})
export class ShipmentsModule {}