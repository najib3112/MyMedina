import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Response,
  BadRequestException,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { ReportsService } from '../services/reports.service';
import { DateRangeDto } from '../dto/reports.dto';
import { ExportService } from '../services/export.service';

/**
 * Owner Reports Controller
 * Provides report generation and export endpoints for financial reports
 * Only accessible by OWNER role
 */
@Controller('owner/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * GET /owner/reports/sales
   * Get sales report for date range
   */
  @Get('sales')
  @HttpCode(HttpStatus.OK)
  async getSalesReport(@Query() dateRange: DateRangeDto) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateSalesReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    return {
      message: 'Sales report berhasil dibuat',
      data: report,
    };
  }

  /**
   * GET /owner/reports/sales/export
   * Export sales report to CSV
   */
  @Get('sales/export')
  @HttpCode(HttpStatus.OK)
  async exportSalesReport(
    @Query() dateRange: DateRangeDto,
    @Response() res: ExpressResponse,
  ) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateSalesReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    const csv = this.exportService.generateSalesReportCSV(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }

  /**
   * GET /owner/reports/customers
   * Get customer report
   */
  @Get('customers')
  @HttpCode(HttpStatus.OK)
  async getCustomerReport(@Query() dateRange: DateRangeDto) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateCustomerReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    return {
      message: 'Customer report berhasil dibuat',
      data: report,
    };
  }

  /**
   * GET /owner/reports/customers/export
   * Export customer report to CSV
   */
  @Get('customers/export')
  @HttpCode(HttpStatus.OK)
  async exportCustomerReport(
    @Query() dateRange: DateRangeDto,
    @Response() res: ExpressResponse,
  ) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateCustomerReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    const csv = this.exportService.generateCustomerReportCSV(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customer-report-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }

  /**
   * GET /owner/reports/orders
   * Get order report
   */
  @Get('orders')
  @HttpCode(HttpStatus.OK)
  async getOrderReport(@Query() dateRange: DateRangeDto) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateOrderReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    return {
      message: 'Order report berhasil dibuat',
      data: report,
    };
  }

  /**
   * GET /owner/reports/orders/export
   * Export order report to CSV
   */
  @Get('orders/export')
  @HttpCode(HttpStatus.OK)
  async exportOrderReport(
    @Query() dateRange: DateRangeDto,
    @Response() res: ExpressResponse,
  ) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateOrderReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    const csv = this.exportService.generateOrderReportCSV(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="order-report-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }

  /**
   * GET /owner/reports/inventory
   * Get inventory report
   */
  @Get('inventory')
  @HttpCode(HttpStatus.OK)
  async getInventoryReport() {
    const report = await this.reportsService.generateInventoryReport();

    return {
      message: 'Inventory report berhasil dibuat',
      data: report,
    };
  }

  /**
   * GET /owner/reports/inventory/export
   * Export inventory report to CSV
   */
  @Get('inventory/export')
  @HttpCode(HttpStatus.OK)
  async exportInventoryReport(@Response() res: ExpressResponse) {
    const report = await this.reportsService.generateInventoryReport();

    const csv = this.exportService.generateInventoryReportCSV(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory-report-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }

  /**
   * GET /owner/reports/category
   * Get category performance report
   */
  @Get('category')
  @HttpCode(HttpStatus.OK)
  async getCategoryReport(@Query() dateRange: DateRangeDto) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateCategoryReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    return {
      message: 'Category report berhasil dibuat',
      data: report,
    };
  }

  /**
   * GET /owner/reports/category/export
   * Export category report to CSV
   */
  @Get('category/export')
  @HttpCode(HttpStatus.OK)
  async exportCategoryReport(
    @Query() dateRange: DateRangeDto,
    @Response() res: ExpressResponse,
  ) {
    if (!dateRange.startDate || !dateRange.endDate) {
      throw new BadRequestException('startDate dan endDate diperlukan');
    }

    const report = await this.reportsService.generateCategoryReport(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate),
    );

    const csv = this.exportService.generateCategoryReportCSV(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="category-report-${new Date().toISOString().split('T')[0]}.csv"`,
    );
    res.send(csv);
  }
}
