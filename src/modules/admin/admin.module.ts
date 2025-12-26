import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

/**
 * Admin Module
 * Provides dashboard and analytics functionality for admins
 * Financial reports have been moved to Owner Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, Product, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class AdminModule {}
