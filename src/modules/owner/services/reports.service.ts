import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Product } from '../../products/entities/product.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

/**
 * Reports Service - Analytics dan Report Generation
 * Financial reports untuk Owner
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Generate Sales Report
   */
  async generateSalesReport(startDate: Date, endDate: Date) {
    // Total sales
    const totalSalesResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COUNT(payment.id)', 'totalTransactions')
      .addSelect('SUM(payment.amount)', 'totalRevenue')
      .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    // Sales by payment method
    const salesByMethod = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.method', 'method')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('payment.method')
      .getRawMany();

    // Daily sales
    const dailySales = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE_FORMAT(payment.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Product sales
    const productSales = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .select('item.namaProduct', 'productName')
      .addSelect('SUM(item.kuantitas)', 'quantitySold')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('item.namaProduct')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalTransactions: parseInt(
          totalSalesResult?.totalTransactions || 0,
          10,
        ),
        totalRevenue: Number(totalSalesResult?.totalRevenue || 0),
      },
      salesByMethod: salesByMethod.map((item) => ({
        method: item.method,
        count: parseInt(item.count, 10),
        total: Number(item.total),
      })),
      dailySales: dailySales.map((item) => ({
        date: item.date,
        count: parseInt(item.count, 10),
        total: Number(item.total),
      })),
      productSales: productSales.map((item) => ({
        productName: item.productName,
        quantitySold: parseInt(item.quantitySold, 10),
        totalRevenue: Number(item.totalRevenue),
      })),
    };
  }

  /**
   * Generate Customer Report
   */
  async generateCustomerReport(startDate: Date, endDate: Date) {
    // Total customers in period
    const newCustomersResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.userId)', 'count')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    // Customer segmentation by spending
    const customerSegmentation = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.userId', 'userId')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'totalSpent')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('order.userId')
      .getRawMany();

    // Segment customers
    const highValue = customerSegmentation.filter(
      (c) => Number(c.totalSpent) > 500000,
    ).length;
    const medium = customerSegmentation.filter(
      (c) => Number(c.totalSpent) >= 100000 && Number(c.totalSpent) <= 500000,
    ).length;
    const lowValue = customerSegmentation.filter(
      (c) => Number(c.totalSpent) < 100000,
    ).length;

    // Customer retention
    const repeatCustomers = customerSegmentation.filter(
      (c) => c.orderCount > 1,
    ).length;

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        newCustomers: parseInt(newCustomersResult?.count || 0, 10),
        repeatCustomers,
        totalCustomers: customerSegmentation.length,
      },
      segmentation: {
        highValue: {
          count: highValue,
          percentage: parseFloat(
            ((highValue / customerSegmentation.length) * 100).toFixed(2),
          ),
        },
        medium: {
          count: medium,
          percentage: parseFloat(
            ((medium / customerSegmentation.length) * 100).toFixed(2),
          ),
        },
        lowValue: {
          count: lowValue,
          percentage: parseFloat(
            ((lowValue / customerSegmentation.length) * 100).toFixed(2),
          ),
        },
      },
      topCustomers: customerSegmentation
        .sort((a, b) => Number(b.totalSpent) - Number(a.totalSpent))
        .slice(0, 10)
        .map((customer) => ({
          userId: customer.userId,
          orderCount: parseInt(customer.orderCount, 10),
          totalSpent: Number(customer.totalSpent),
          averageOrderValue: parseFloat(
            (Number(customer.totalSpent) / customer.orderCount).toFixed(2),
          ),
        })),
    };
  }

  /**
   * Generate Inventory Report
   */
  async generateInventoryReport() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .select('product.id', 'id')
      .addSelect('product.nama', 'name')
      .addSelect('product.deskripsi', 'description')
      .addSelect('product.status', 'status')
      .addSelect('SUM(variant.stok)', 'totalStock')
      .addSelect('COUNT(variant.id)', 'totalVariants')
      .groupBy('product.id')
      .getRawMany();

    // Categorize products
    const lowStockProducts = products
      .filter((p) => Number(p.totalStock) < 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        totalStock: Number(p.totalStock),
        totalVariants: parseInt(p.totalVariants, 10),
        stockStatus:
          Number(p.totalStock) === 0
            ? 'OUT_OF_STOCK'
            : Number(p.totalStock) < 10
              ? 'LOW_STOCK'
              : 'IN_STOCK',
      }));

    const outOfStockProducts = products
      .filter((p) => Number(p.totalStock) === 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        totalStock: Number(p.totalStock),
        totalVariants: parseInt(p.totalVariants, 10),
        stockStatus: 'OUT_OF_STOCK',
      }));

    return {
      summary: {
        totalProducts: products.length,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
      },
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        totalStock: Number(p.totalStock),
        totalVariants: parseInt(p.totalVariants, 10),
        stockStatus:
          Number(p.totalStock) === 0
            ? 'OUT_OF_STOCK'
            : Number(p.totalStock) < 10
              ? 'LOW_STOCK'
              : 'IN_STOCK',
      })),
      lowStockProducts,
      outOfStockProducts,
    };
  }

  /**
   * Generate Order Report
   */
  async generateOrderReport(startDate: Date, endDate: Date) {
    // Orders by status
    const ordersByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total)', 'totalValue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('order.status')
      .getRawMany();

    // Orders by type
    const ordersByType = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.type', 'type')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total)', 'totalValue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('order.type')
      .getRawMany();

    // Orders by city
    const ordersByCity = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.city', 'city')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total)', 'totalValue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('order.city')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Total orders summary
    const summary = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.total)', 'totalRevenue')
      .addSelect('AVG(order.total)', 'averageOrderValue')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalOrders: parseInt(summary?.totalOrders || 0, 10),
        totalRevenue: Number(summary?.totalRevenue || 0),
        averageOrderValue: parseFloat(
          (Number(summary?.averageOrderValue) || 0).toFixed(2),
        ),
      },
      ordersByStatus: ordersByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count, 10),
        totalValue: Number(item.totalValue),
      })),
      ordersByType: ordersByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count, 10),
        totalValue: Number(item.totalValue),
      })),
      ordersByCity: ordersByCity.map((item) => ({
        city: item.city,
        count: parseInt(item.count, 10),
        totalValue: Number(item.totalValue),
      })),
    };
  }

  /**
   * Generate Product Category Report
   */
  async generateCategoryReport(startDate: Date, endDate: Date) {
    const categoryReport = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.kategori', 'category')
      .select('category.nama', 'categoryName')
      .addSelect('COUNT(DISTINCT item.id)', 'itemsSold')
      .addSelect('SUM(item.subtotal)', 'revenue')
      .addSelect('AVG(item.hargaSnapshot)', 'avgPrice')
      .where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('category.nama')
      .orderBy('revenue', 'DESC')
      .getRawMany();

    return {
      period: {
        startDate,
        endDate,
      },
      categories: categoryReport.map((cat) => ({
        categoryName: cat.categoryName,
        itemsSold: parseInt(cat.itemsSold, 10),
        revenue: Number(cat.revenue),
        averagePrice: parseFloat((Number(cat.avgPrice) || 0).toFixed(2)),
      })),
    };
  }
}
