import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Address } from '../auth/entities/address.entity';
import { AddressService } from '../auth/services/address.service';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

/**
 * Orders Module
 *
 * OOP Concepts:
 * - Encapsulation: Groups related order functionality
 * - Module Pattern: Organizes code into cohesive units
 *
 * Design Patterns:
 * - Module Pattern: NestJS module system
 * - Dependency Injection: Provides services and repositories
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Address, ProductVariant, Product]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, AddressService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}

