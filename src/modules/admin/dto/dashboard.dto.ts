import { IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

/**
 * Dashboard Summary DTO
 */
export class DashboardSummaryDto {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  pendingPayments: number;
  conversionRate: number;
  averageOrderValue: number;
}

/**
 * Date Range Filter DTO
 */
export class DateRangeDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

/**
 * Pagination Query DTO
 */
export class PaginationQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}

/**
 * Revenue Trend Query DTO
 */
export enum RevenuePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class RevenueTrendQueryDto {
  @IsEnum(RevenuePeriod)
  @IsOptional()
  period?: RevenuePeriod = RevenuePeriod.DAILY;

  @IsNumber()
  @IsOptional()
  days?: number = 30;
}

/**
 * Order Statistics Response DTO
 */
export class OrderStatisticsDto {
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;

  ordersByType: Array<{
    type: string;
    count: number;
  }>;

  topCities: Array<{
    city: string;
    count: number;
    revenue: number;
  }>;
}

/**
 * Payment Statistics Response DTO
 */
export class PaymentStatisticsDto {
  revenueByMethod: Array<{
    method: string;
    count: number;
    total: number;
  }>;

  paymentsByStatus: Array<{
    status: string;
    count: number;
    total: number;
  }>;
}

/**
 * Revenue Trend Response DTO
 */
export class RevenueTrendDto {
  period: string;
  count: number;
  total: number;
}

/**
 * Product Performance DTO
 */
export class ProductPerformanceDto {
  id: string;
  name: string;
  description: string;
  totalSold: number;
  revenue: number;
  avgQuantityPerOrder: number;
}

/**
 * Customer Statistics DTO
 */
export class CustomerStatisticsDto {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  averageLifetimeValue: number;
  topCustomers: Array<{
    userId: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

/**
 * Recent Activity DTO
 */
export class RecentActivityDto {
  type: string;
  id: string;
  userId: string;
  userName: string;
  action: string;
  amount: number;
  status: string;
  timestamp: Date;
}
