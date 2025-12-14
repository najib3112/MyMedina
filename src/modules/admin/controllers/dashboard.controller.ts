import { Controller, Get, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { DashboardService } from '../services/dashboard.service';
import {
  DateRangeDto,
  RevenueTrendQueryDto,
  PaginationQueryDto,
} from '../dto/dashboard.dto';

/**
 * Admin Dashboard Controller
 * Provides statistics and analytics endpoints for admin dashboard
 */
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OWNER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /admin/dashboard/summary
   * Get dashboard summary (cards data)
   */
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getDashboardSummary(@Query() dateRange: DateRangeDto) {
    const dates = dateRange.startDate && dateRange.endDate
      ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        }
      : undefined;

    const summary = await this.dashboardService.getDashboardSummary(dates);

    return {
      message: 'Dashboard summary berhasil diambil',
      data: summary,
    };
  }

  /**
   * GET /admin/dashboard/orders/statistics
   * Get order statistics
   */
  @Get('orders/statistics')
  @HttpCode(HttpStatus.OK)
  async getOrderStatistics(@Query() dateRange: DateRangeDto) {
    const dates = dateRange.startDate && dateRange.endDate
      ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        }
      : undefined;

    const stats = await this.dashboardService.getOrderStatistics(dates);

    return {
      message: 'Order statistics berhasil diambil',
      data: stats,
    };
  }

  /**
   * GET /admin/dashboard/payments/statistics
   * Get payment statistics
   */
  @Get('payments/statistics')
  @HttpCode(HttpStatus.OK)
  async getPaymentStatistics(@Query() dateRange: DateRangeDto) {
    const dates = dateRange.startDate && dateRange.endDate
      ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        }
      : undefined;

    const stats = await this.dashboardService.getPaymentStatistics(dates);

    return {
      message: 'Payment statistics berhasil diambil',
      data: stats,
    };
  }

  /**
   * GET /admin/dashboard/revenue/trends
   * Get revenue trends (daily/weekly/monthly)
   */
  @Get('revenue/trends')
  @HttpCode(HttpStatus.OK)
  async getRevenueTrends(@Query() query: RevenueTrendQueryDto) {
    const trends = await this.dashboardService.getRevenueTrends(
      query.period || 'daily',
      query.days || 30,
    );

    return {
      message: 'Revenue trends berhasil diambil',
      data: trends,
    };
  }

  /**
   * GET /admin/dashboard/products/top
   * Get top products
   */
  @Get('products/top')
  @HttpCode(HttpStatus.OK)
  async getTopProducts(
    @Query() dateRange: DateRangeDto,
    @Query('limit') limit: string = '10',
  ) {
    const dates = dateRange.startDate && dateRange.endDate
      ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        }
      : undefined;

    const products = await this.dashboardService.getTopProducts(
      parseInt(limit, 10),
      dates,
    );

    return {
      message: 'Top products berhasil diambil',
      data: products,
    };
  }

  /**
   * GET /admin/dashboard/products/performance
   * Get product performance
   */
  @Get('products/performance')
  @HttpCode(HttpStatus.OK)
  async getProductPerformance(@Query() dateRange: DateRangeDto) {
    const dates = dateRange.startDate && dateRange.endDate
      ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        }
      : undefined;

    const performance = await this.dashboardService.getProductPerformance(dates);

    return {
      message: 'Product performance berhasil diambil',
      data: performance,
    };
  }

  /**
   * GET /admin/dashboard/customers/statistics
   * Get customer statistics
   */
  @Get('customers/statistics')
  @HttpCode(HttpStatus.OK)
  async getCustomerStatistics(@Query() dateRange: DateRangeDto) {
    const dates = dateRange.startDate && dateRange.endDate
      ? {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
        }
      : undefined;

    const stats = await this.dashboardService.getCustomerStatistics(dates);

    return {
      message: 'Customer statistics berhasil diambil',
      data: stats,
    };
  }

  /**
   * GET /admin/dashboard/activity/recent
   * Get recent activity
   */
  @Get('activity/recent')
  @HttpCode(HttpStatus.OK)
  async getRecentActivity(@Query('limit') limit: string = '20') {
    const activity = await this.dashboardService.getRecentActivity(
      parseInt(limit, 10),
    );

    return {
      message: 'Recent activity berhasil diambil',
      data: activity,
    };
  }
}
