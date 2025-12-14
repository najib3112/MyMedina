import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../auth/entities/user.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

/**
 * Dashboard Service - Statistik dan Analytics
 * Menyediakan data untuk dashboard admin
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get Dashboard Summary Statistics
   * Used for main dashboard cards
   */
  async getDashboardSummary(dateRange?: { startDate: Date; endDate: Date }) {
    const where = dateRange
      ? {
          createdAt: Between(dateRange.startDate, dateRange.endDate),
        }
      : {};

    // Get total orders
    const totalOrders = await this.orderRepository.count({ where });

    // Get completed orders
    const completedOrders = await this.orderRepository.count({
      where: {
        ...where,
        status: OrderStatus.COMPLETED,
      },
    });

    // Get total revenue (from completed payments)
    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .innerJoin(Order, 'order', 'order.id = payment.orderId')
      .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
      .andWhere(dateRange ? 'payment.createdAt BETWEEN :startDate AND :endDate' : '1=1', dateRange)
      .getRawOne();

    const totalRevenue = revenueResult?.total || 0;

    // Get total products
    const totalProducts = await this.productRepository.count();

    // Get total users
    const totalUsers = await this.userRepository.count();

    // Get pending orders
    const pendingOrders = await this.orderRepository.count({
      where: {
        ...where,
        status: OrderStatus.PENDING_PAYMENT,
      },
    });

    // Get pending payments
    const pendingPayments = await this.paymentRepository.count({
      where: {
        status: PaymentStatus.PENDING,
      },
    });

    // Calculate conversion rate
    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Get average order value
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    return {
      totalOrders,
      completedOrders,
      totalRevenue: Number(totalRevenue),
      totalProducts,
      totalUsers,
      pendingOrders,
      pendingPayments,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      averageOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    };
  }

  /**
   * Get Order Statistics
   */
  async getOrderStatistics(dateRange?: { startDate: Date; endDate: Date }) {
    const where = dateRange
      ? {
          createdAt: Between(dateRange.startDate, dateRange.endDate),
        }
      : {};

    // Orders by status
    const ordersByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .where(dateRange ? 'order.createdAt BETWEEN :startDate AND :endDate' : '1=1', dateRange)
      .groupBy('order.status')
      .getRawMany();

    // Orders by type
    const ordersByType = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.type', 'type')
      .addSelect('COUNT(order.id)', 'count')
      .where(dateRange ? 'order.createdAt BETWEEN :startDate AND :endDate' : '1=1', dateRange)
      .groupBy('order.type')
      .getRawMany();

    // Top cities by orders
    const topCities = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.city', 'city')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total)', 'revenue')
      .where(dateRange ? 'order.createdAt BETWEEN :startDate AND :endDate' : '1=1', dateRange)
      .groupBy('order.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      ordersByStatus: ordersByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count, 10),
      })),
      ordersByType: ordersByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count, 10),
      })),
      topCities: topCities.map((item) => ({
        city: item.city,
        count: parseInt(item.count, 10),
        revenue: Number(item.revenue),
      })),
    };
  }

  /**
   * Get Payment Statistics
   */
  async getPaymentStatistics(dateRange?: { startDate: Date; endDate: Date }) {
    const where = dateRange
      ? {
          createdAt: Between(dateRange.startDate, dateRange.endDate),
        }
      : {};

    // Revenue by payment method
    const revenueByMethod = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.method', 'method')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
      .andWhere(dateRange ? 'payment.createdAt BETWEEN :startDate AND :endDate' : '1=1', dateRange)
      .groupBy('payment.method')
      .getRawMany();

    // Payment status breakdown
    const paymentsByStatus = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.status', 'status')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where(dateRange ? 'payment.createdAt BETWEEN :startDate AND :endDate' : '1=1', dateRange)
      .groupBy('payment.status')
      .getRawMany();

    return {
      revenueByMethod: revenueByMethod.map((item) => ({
        method: item.method,
        count: parseInt(item.count, 10),
        total: Number(item.total),
      })),
      paymentsByStatus: paymentsByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count, 10),
        total: Number(item.total),
      })),
    };
  }

  /**
   * Get Revenue Trends (Daily/Weekly/Monthly)
   */
  async getRevenueTrends(
    period: 'daily' | 'weekly' | 'monthly',
    days: number = 30,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let dateFormat: string;
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateFormat = '%Y-W%u';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
    }

    const trends = await this.paymentRepository
      .createQueryBuilder('payment')
      .select(`DATE_FORMAT(payment.createdAt, '${dateFormat}')`, 'period')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
      .andWhere('payment.createdAt >= :startDate', { startDate })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return trends.map((item) => ({
      period: item.period,
      count: parseInt(item.count, 10),
      total: Number(item.total),
    }));
  }

  /**
   * Get Top Products
   */
  async getTopProducts(limit: number = 10, dateRange?: { startDate: Date; endDate: Date }) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .addSelect((subQuery) => {
        let subQueryBuilder = subQuery
          .select('COUNT(orderItem.id)', 'count')
          .from('order_items', 'orderItem')
          .where('orderItem.product_id = product.id');

        if (dateQuery) {
          subQueryBuilder = subQueryBuilder.andWhere(
            'orderItem.created_at BETWEEN :startDate AND :endDate',
          );
        }

        return subQueryBuilder;
      }, 'totalSold')
      .addSelect((subQuery) => {
        let subQueryBuilder = subQuery
          .select('SUM(orderItem.subtotal)', 'revenue')
          .from('order_items', 'orderItem')
          .where('orderItem.product_id = product.id');

        if (dateRange) {
          subQueryBuilder = subQueryBuilder.andWhere(
            'orderItem.created_at BETWEEN :startDate AND :endDate',
          );
        }

        return subQueryBuilder;
      }, 'revenue')
      .orderBy('totalSold', 'DESC')
      .limit(limit);

    if (dateRange) {
      query.setParameter('startDate', dateRange.startDate).setParameter('endDate', dateRange.endDate);
    }

    return await query.getMany();
  }

  /**
   * Get Customer Statistics
   */
  async getCustomerStatistics(dateRange?: { startDate: Date; endDate: Date }) {
    const where = dateRange
      ? {
          createdAt: Between(dateRange.startDate, dateRange.endDate),
        }
      : {};

    // Total customers
    const totalCustomers = await this.userRepository.count();

    // New customers (this period)
    const newCustomers = dateRange
      ? await this.userRepository.count({ where })
      : await this.userRepository.count();

    // Repeat customers (customers with multiple orders)
    const repeatCustomers = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.userId', 'userId')
      .addSelect('COUNT(order.id)', 'orderCount')
      .groupBy('order.userId')
      .having('COUNT(order.id) > 1')
      .getCount();

    // Customer lifetime value
    const customerLTV = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.userId', 'userId')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.total)', 'totalSpent')
      .groupBy('order.userId')
      .orderBy('totalSpent', 'DESC')
      .limit(1)
      .getRawOne();

    // Top customers by revenue
    const topCustomers = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.nama', 'name')
      .addSelect('user.email', 'email')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.total)', 'totalSpent')
      .groupBy('user.id')
      .orderBy('totalSpent', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalCustomers,
      newCustomers,
      repeatCustomers,
      averageLifetimeValue: customerLTV?.totalSpent
        ? Number(customerLTV.totalSpent) / customerLTV.totalOrders
        : 0,
      topCustomers: topCustomers.map((item) => ({
        userId: item.userId,
        name: item.name,
        email: item.email,
        totalOrders: parseInt(item.totalOrders, 10),
        totalSpent: Number(item.totalSpent),
      })),
    };
  }

  /**
   * Get Product Performance
   */
  async getProductPerformance(dateRange?: { startDate: Date; endDate: Date }) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .select('product.id', 'id')
      .addSelect('product.nama', 'name')
      .addSelect('product.deskripsi', 'description')
      .addSelect('COUNT(orderItem.id)', 'totalSold')
      .addSelect('SUM(orderItem.subtotal)', 'revenue')
      .addSelect('AVG(orderItem.quantity)', 'avgQuantityPerOrder')
      .leftJoin('order_items', 'orderItem', 'orderItem.product_id = product.id');

    if (dateRange) {
      query.andWhere('orderItem.created_at BETWEEN :startDate AND :endDate', dateRange);
    }

    return await query
      .groupBy('product.id')
      .orderBy('revenue', 'DESC')
      .getRawMany();
  }

  /**
   * Get Recent Activity
   */
  async getRecentActivity(limit: number = 20) {
    const recentOrders = await this.orderRepository
      .find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: limit,
      });

    return recentOrders.map((order) => ({
      type: 'order',
      id: order.id,
      userId: order.userId,
      userName: order.nomorOrder,
      action: `Order created - ${order.nomorOrder}`,
      amount: order.total,
      status: order.status,
      timestamp: order.createdAt,
    }));
  }
}
