import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { ExportService } from './services/export.service';

/**
 * Owner Module
 * Provides financial reports and analytics functionality for owners
 * Only accessible by OWNER role
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, Product])],
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
  exports: [ReportsService, ExportService],
})
export class OwnerModule {}
