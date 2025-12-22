import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

/**
 * Payments Module
 *
 * OOP Concepts:
 * - Encapsulation: Groups related payment functionality
 * - Module Pattern: Organizes code into cohesive units
 *
 * Design Patterns:
 * - Module Pattern: NestJS module system
 * - Dependency Injection: Provides services and repositories
 */
@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
