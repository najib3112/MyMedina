import { Injectable } from '@nestjs/common';

/**
 * Export Service - Generate CSV files for reports
 * For Owner financial reports
 */
@Injectable()
export class ExportService {
  /**
   * Generate Sales Report CSV
   */
  generateSalesReportCSV(report: any): string {
    let csv = 'Sales Report\n';
    csv += `Period: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}\n\n`;

    // Summary section
    csv += 'SUMMARY\n';
    csv += 'Total Transactions,Total Revenue\n';
    csv += `${report.summary.totalTransactions},${report.summary.totalRevenue}\n\n`;

    // Sales by method
    csv += 'SALES BY PAYMENT METHOD\n';
    csv += 'Method,Count,Total\n';
    report.salesByMethod.forEach((item) => {
      csv += `${item.method},${item.count},${item.total}\n`;
    });
    csv += '\n';

    // Daily sales
    csv += 'DAILY SALES\n';
    csv += 'Date,Count,Total\n';
    report.dailySales.forEach((item) => {
      csv += `${item.date},${item.count},${item.total}\n`;
    });
    csv += '\n';

    // Product sales
    csv += 'PRODUCT SALES\n';
    csv += 'Product,Quantity Sold,Revenue\n';
    report.productSales.forEach((item) => {
      csv += `"${item.productName}",${item.quantitySold},${item.totalRevenue}\n`;
    });

    return csv;
  }

  /**
   * Generate Customer Report CSV
   */
  generateCustomerReportCSV(report: any): string {
    let csv = 'Customer Report\n';
    csv += `Period: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}\n\n`;

    // Summary section
    csv += 'SUMMARY\n';
    csv += 'New Customers,Repeat Customers,Total Customers\n';
    csv += `${report.summary.newCustomers},${report.summary.repeatCustomers},${report.summary.totalCustomers}\n\n`;

    // Segmentation
    csv += 'CUSTOMER SEGMENTATION BY SPENDING\n';
    csv += 'Segment,Count,Percentage\n';
    csv += `High Value (>Rp500k),${report.segmentation.highValue.count},${report.segmentation.highValue.percentage}%\n`;
    csv += `Medium (Rp100k-500k),${report.segmentation.medium.count},${report.segmentation.medium.percentage}%\n`;
    csv += `Low Value (<Rp100k),${report.segmentation.lowValue.count},${report.segmentation.lowValue.percentage}%\n\n`;

    // Top customers
    csv += 'TOP CUSTOMERS\n';
    csv += 'User ID,Order Count,Total Spent,Average Order Value\n';
    report.topCustomers.forEach((customer) => {
      csv += `${customer.userId},${customer.orderCount},${customer.totalSpent},${customer.averageOrderValue}\n`;
    });

    return csv;
  }

  /**
   * Generate Order Report CSV
   */
  generateOrderReportCSV(report: any): string {
    let csv = 'Order Report\n';
    csv += `Period: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}\n\n`;

    // Summary
    csv += 'SUMMARY\n';
    csv += 'Total Orders,Total Revenue,Average Order Value\n';
    csv += `${report.summary.totalOrders},${report.summary.totalRevenue},${report.summary.averageOrderValue}\n\n`;

    // Orders by status
    csv += 'ORDERS BY STATUS\n';
    csv += 'Status,Count,Total Value\n';
    report.ordersByStatus.forEach((item) => {
      csv += `${item.status},${item.count},${item.totalValue}\n`;
    });
    csv += '\n';

    // Orders by type
    csv += 'ORDERS BY TYPE\n';
    csv += 'Type,Count,Total Value\n';
    report.ordersByType.forEach((item) => {
      csv += `${item.type},${item.count},${item.totalValue}\n`;
    });
    csv += '\n';

    // Orders by city
    csv += 'ORDERS BY CITY\n';
    csv += 'City,Count,Total Value\n';
    report.ordersByCity.forEach((item) => {
      csv += `"${item.city}",${item.count},${item.totalValue}\n`;
    });

    return csv;
  }

  /**
   * Generate Inventory Report CSV
   */
  generateInventoryReportCSV(report: any): string {
    let csv = 'Inventory Report\n';
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    // Summary
    csv += 'SUMMARY\n';
    csv += 'Total Products,Low Stock,Out of Stock\n';
    csv += `${report.summary.totalProducts},${report.summary.lowStockProducts},${report.summary.outOfStockProducts}\n\n`;

    // Product details
    csv += 'PRODUCT INVENTORY\n';
    csv += 'Product ID,Name,Status,Total Stock,Variants,Stock Status\n';
    report.products.forEach((product) => {
      csv += `${product.id},"${product.name}",${product.status},${product.totalStock},${product.totalVariants},${product.stockStatus}\n`;
    });

    return csv;
  }

  /**
   * Generate Category Report CSV
   */
  generateCategoryReportCSV(report: any): string {
    let csv = 'Category Performance Report\n';
    csv += `Period: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}\n\n`;

    csv += 'CATEGORY PERFORMANCE\n';
    csv += 'Category,Items Sold,Revenue,Average Price\n';
    report.categories.forEach((category) => {
      csv += `"${category.categoryName}",${category.itemsSold},${category.revenue},${category.averagePrice}\n`;
    });

    return csv;
  }

  /**
   * Convert object array to CSV
   * Generic method for custom exports
   */
  convertToCsv(data: any[], headers: string[]): string {
    let csv = headers.join(',') + '\n';

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix: string, extension: string = 'csv'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}-${timestamp}.${extension}`;
  }
}
