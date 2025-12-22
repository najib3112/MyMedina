import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import { DashboardController } from './controllers/dashboard.controller';
import { ReportsController } from './controllers/reports.controller';
import { DashboardService } from './services/dashboard.service';
import { ReportsService } from './services/reports.service';
import { ExportService } from './services/export.service';

/**
 * Admin Module
 * Provides dashboard, analytics, and reporting functionality for admins
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, Product, User])],
  controllers: [DashboardController, ReportsController],
  providers: [DashboardService, ReportsService, ExportService],
  exports: [DashboardService, ReportsService, ExportService],
})
export class AdminModule {}
