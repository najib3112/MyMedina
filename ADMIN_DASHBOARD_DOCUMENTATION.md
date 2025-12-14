# 📊 ADMIN DASHBOARD & REPORTS MODULE

**Project:** MyMedina Backend - E-Commerce API  
**Module:** Admin Dashboard & Analytics  
**Status:** ✅ COMPLETE  
**Date:** December 2025

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Endpoints](#endpoints)
5. [API Documentation](#api-documentation)
6. [Reports](#reports)
7. [Export Functionality](#export-functionality)
8. [Database Queries](#database-queries)
9. [Usage Examples](#usage-examples)
10. [Files Structure](#files-structure)

---

## 1. OVERVIEW

Admin Dashboard Module menyediakan comprehensive analytics dan reporting untuk MyMedina e-commerce platform. Module ini memungkinkan admin untuk:

- ✅ Monitor real-time sales dan revenue
- ✅ Track customer behavior dan segmentation
- ✅ Analyze product performance
- ✅ Generate detailed reports
- ✅ Export data to CSV format
- ✅ View inventory status
- ✅ Monitor order flows

**Key Metrics:**
- Total orders, revenue, conversion rate
- Sales trends (daily/weekly/monthly)
- Customer analytics dan segmentation
- Product performance tracking
- Order status breakdown
- Payment method analysis

---

## 2. ARCHITECTURE

### **Module Dependencies:**

```
AdminModule
├── TypeOrmModule (Order, Payment, Product, User)
├── DashboardService
│   ├── getDashboardSummary()
│   ├── getOrderStatistics()
│   ├── getPaymentStatistics()
│   ├── getRevenueTrends()
│   ├── getTopProducts()
│   ├── getProductPerformance()
│   ├── getCustomerStatistics()
│   └── getRecentActivity()
├── ReportsService
│   ├── generateSalesReport()
│   ├── generateCustomerReport()
│   ├── generateOrderReport()
│   ├── generateInventoryReport()
│   └── generateCategoryReport()
└── ExportService
    ├── generateSalesReportCSV()
    ├── generateCustomerReportCSV()
    ├── generateOrderReportCSV()
    ├── generateInventoryReportCSV()
    └── convertToCsv()
```

### **Service Layer:**

```
┌──────────────────────────────────┐
│   DashboardController            │
│   - GET /admin/dashboard/*       │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│   DashboardService               │
│   - Statistics & Analytics       │
│   - Real-time metrics            │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│   TypeORM Repositories           │
│   - Order, Payment, Product, User│
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│   PostgreSQL Database            │
└──────────────────────────────────┘
```

---

## 3. FEATURES

### **3.1 Dashboard Summary**
- Total orders count
- Completed orders count
- Total revenue (from completed payments)
- Total products
- Total customers
- Pending orders
- Pending payments
- Conversion rate (%)
- Average order value

### **3.2 Analytics**
- Order statistics (by status, type, city)
- Payment statistics (by method, status)
- Revenue trends (daily/weekly/monthly)
- Top products
- Product performance
- Customer statistics & segmentation
- Recent activity feed

### **3.3 Reports**
- Sales report (revenue, by method, daily, by product)
- Customer report (segmentation, top customers, LTV)
- Order report (by status, type, city)
- Inventory report (stock levels, low/out of stock)
- Category performance report

### **3.4 Export**
- CSV export untuk semua reports
- Consistent formatting
- Timestamp included
- Support untuk large datasets

---

## 4. ENDPOINTS

### **4.1 Dashboard Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/summary` | Get dashboard summary cards |
| GET | `/admin/dashboard/orders/statistics` | Get order statistics |
| GET | `/admin/dashboard/payments/statistics` | Get payment statistics |
| GET | `/admin/dashboard/revenue/trends` | Get revenue trends |
| GET | `/admin/dashboard/products/top` | Get top products |
| GET | `/admin/dashboard/products/performance` | Get product performance |
| GET | `/admin/dashboard/customers/statistics` | Get customer statistics |
| GET | `/admin/dashboard/activity/recent` | Get recent activity |

### **4.2 Reports Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/reports/sales` | Generate sales report |
| GET | `/admin/reports/sales/export` | Export sales report (CSV) |
| GET | `/admin/reports/customers` | Generate customer report |
| GET | `/admin/reports/customers/export` | Export customer report (CSV) |
| GET | `/admin/reports/orders` | Generate order report |
| GET | `/admin/reports/orders/export` | Export order report (CSV) |
| GET | `/admin/reports/inventory` | Generate inventory report |
| GET | `/admin/reports/inventory/export` | Export inventory report (CSV) |
| GET | `/admin/reports/category` | Generate category report |
| GET | `/admin/reports/category/export` | Export category report (CSV) |

---

## 5. API DOCUMENTATION

### **5.1 GET Dashboard Summary**

**Endpoint:**
```
GET /admin/dashboard/summary?startDate=2025-12-01&endDate=2025-12-14
```

**Query Parameters:**
```json
{
  "startDate": "2025-12-01",  // Optional
  "endDate": "2025-12-14"     // Optional
}
```

**Response:**
```json
{
  "message": "Dashboard summary berhasil diambil",
  "data": {
    "totalOrders": 150,
    "completedOrders": 120,
    "totalRevenue": 5250000,
    "totalProducts": 45,
    "totalUsers": 200,
    "pendingOrders": 20,
    "pendingPayments": 10,
    "conversionRate": 80.0,
    "averageOrderValue": 43750
  }
}
```

---

### **5.2 GET Order Statistics**

**Endpoint:**
```
GET /admin/dashboard/orders/statistics
```

**Response:**
```json
{
  "message": "Order statistics berhasil diambil",
  "data": {
    "ordersByStatus": [
      { "status": "COMPLETED", "count": 120 },
      { "status": "PENDING_PAYMENT", "count": 20 },
      { "status": "SHIPPED", "count": 10 }
    ],
    "ordersByType": [
      { "type": "READY", "count": 130 },
      { "type": "PO", "count": 20 }
    ],
    "topCities": [
      { "city": "Jakarta", "count": 85, "revenue": 3750000 },
      { "city": "Bandung", "count": 35, "revenue": 1200000 }
    ]
  }
}
```

---

### **5.3 GET Revenue Trends**

**Endpoint:**
```
GET /admin/dashboard/revenue/trends?period=daily&days=30
```

**Query Parameters:**
```json
{
  "period": "daily",  // daily | weekly | monthly
  "days": 30          // Number of days to fetch
}
```

**Response:**
```json
{
  "message": "Revenue trends berhasil diambil",
  "data": [
    { "period": "2025-12-01", "count": 10, "total": 450000 },
    { "period": "2025-12-02", "count": 12, "total": 520000 },
    { "period": "2025-12-03", "count": 8, "total": 380000 }
  ]
}
```

---

### **5.4 GET Customer Statistics**

**Endpoint:**
```
GET /admin/dashboard/customers/statistics?startDate=2025-12-01&endDate=2025-12-14
```

**Response:**
```json
{
  "message": "Customer statistics berhasil diambil",
  "data": {
    "totalCustomers": 200,
    "newCustomers": 45,
    "repeatCustomers": 95,
    "averageLifetimeValue": 26250,
    "topCustomers": [
      {
        "userId": "uuid-1",
        "name": "John Doe",
        "email": "john@example.com",
        "totalOrders": 15,
        "totalSpent": 750000
      }
    ]
  }
}
```

---

### **5.5 GET Top Products**

**Endpoint:**
```
GET /admin/dashboard/products/top?limit=10
```

**Response:**
```json
{
  "message": "Top products berhasil diambil",
  "data": [
    {
      "id": "product-uuid",
      "nama": "Hijab Premium",
      "deskripsi": "Hijab premium cotton",
      "variants": [
        {
          "id": "variant-uuid",
          "sku": "HIJAB-001",
          "ukuran": "Universal",
          "warna": "Black",
          "stok": 100
        }
      ]
    }
  ]
}
```

---

### **5.6 GET Sales Report**

**Endpoint:**
```
GET /admin/reports/sales?startDate=2025-12-01&endDate=2025-12-14
```

**Response:**
```json
{
  "message": "Sales report berhasil dibuat",
  "data": {
    "period": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-14"
    },
    "summary": {
      "totalTransactions": 150,
      "totalRevenue": 5250000
    },
    "salesByMethod": [
      { "method": "BANK_TRANSFER", "count": 80, "total": 2800000 },
      { "method": "QRIS", "count": 50, "total": 1750000 },
      { "method": "E_WALLET", "count": 20, "total": 700000 }
    ],
    "dailySales": [
      { "date": "2025-12-01", "count": 10, "total": 450000 }
    ],
    "productSales": [
      {
        "productName": "Hijab Premium",
        "quantitySold": 85,
        "totalRevenue": 1700000
      }
    ]
  }
}
```

---

### **5.7 EXPORT Sales Report (CSV)**

**Endpoint:**
```
GET /admin/reports/sales/export?startDate=2025-12-01&endDate=2025-12-14
```

**Response:** CSV file download dengan format:
```csv
Sales Report
Period: 12/1/2025 - 12/14/2025

SUMMARY
Total Transactions,Total Revenue
150,5250000

SALES BY PAYMENT METHOD
Method,Count,Total
BANK_TRANSFER,80,2800000
...
```

---

### **5.8 GET Customer Report**

**Endpoint:**
```
GET /admin/reports/customers?startDate=2025-12-01&endDate=2025-12-14
```

**Response:**
```json
{
  "message": "Customer report berhasil dibuat",
  "data": {
    "period": {
      "startDate": "2025-12-01",
      "endDate": "2025-12-14"
    },
    "summary": {
      "newCustomers": 45,
      "repeatCustomers": 95,
      "totalCustomers": 150
    },
    "segmentation": {
      "highValue": {
        "count": 30,
        "percentage": 20.0
      },
      "medium": {
        "count": 60,
        "percentage": 40.0
      },
      "lowValue": {
        "count": 60,
        "percentage": 40.0
      }
    },
    "topCustomers": [
      {
        "userId": "uuid",
        "orderCount": 15,
        "totalSpent": 750000,
        "averageOrderValue": 50000
      }
    ]
  }
}
```

---

### **5.9 GET Inventory Report**

**Endpoint:**
```
GET /admin/reports/inventory
```

**Response:**
```json
{
  "message": "Inventory report berhasil dibuat",
  "data": {
    "summary": {
      "totalProducts": 45,
      "lowStockProducts": 8,
      "outOfStockProducts": 2
    },
    "products": [
      {
        "id": "product-uuid",
        "name": "Hijab Premium",
        "status": "ACTIVE",
        "totalStock": 250,
        "totalVariants": 5,
        "stockStatus": "IN_STOCK"
      }
    ]
  }
}
```

---

## 6. REPORTS

### **6.1 Sales Report**

Includes:
- Total transactions & revenue
- Sales breakdown by payment method
- Daily sales trend
- Product sales ranking

**Use Case:** Track revenue, identify top payment methods, monitor daily sales patterns

---

### **6.2 Customer Report**

Includes:
- New vs repeat customers
- Customer segmentation by spending
- Customer lifetime value
- Top customers list

**Use Case:** Identify high-value customers, measure customer retention, plan marketing

---

### **6.3 Order Report**

Includes:
- Total orders & revenue
- Orders by status (COMPLETED, PENDING, SHIPPED, etc)
- Orders by type (READY, PO)
- Orders by city/location

**Use Case:** Monitor order flow, identify popular locations, analyze order patterns

---

### **6.4 Inventory Report**

Includes:
- Total products
- Low stock products (<10 units)
- Out of stock products
- Product-wise stock levels

**Use Case:** Manage inventory, reorder stock, identify slow-moving items

---

### **6.5 Category Performance Report**

Includes:
- Items sold per category
- Revenue per category
- Average price per category

**Use Case:** Identify best-selling categories, optimize product mix

---

## 7. EXPORT FUNCTIONALITY

### **7.1 CSV Export Format**

All reports can be exported to CSV format for:
- Data analysis in Excel
- Integration with other tools
- Archival purposes
- Sharing with stakeholders

### **7.2 Export Endpoints**

```
GET /admin/reports/{reportType}/export?startDate=&endDate=
```

Returns CSV file with:
- Timestamp in filename
- Proper headers
- All relevant data
- UTF-8 encoding

### **7.3 Example Export Usage**

```bash
# Download sales report
curl -H "Authorization: Bearer JWT_TOKEN" \
  "http://localhost:3000/admin/reports/sales/export?startDate=2025-12-01&endDate=2025-12-14" \
  -o sales-report-2025-12-14.csv

# Download customer report
curl -H "Authorization: Bearer JWT_TOKEN" \
  "http://localhost:3000/admin/reports/customers/export?startDate=2025-12-01&endDate=2025-12-14" \
  -o customer-report-2025-12-14.csv
```

---

## 8. DATABASE QUERIES

### **8.1 Query Optimization**

All queries use:
- TypeORM QueryBuilder untuk efficiency
- Proper indexing (dates, status, user_id)
- Aggregation functions (SUM, COUNT, AVG)
- Grouped results untuk analytics

### **8.2 Sample Query - Revenue Trends**

```typescript
await this.paymentRepository
  .createQueryBuilder('payment')
  .select(`DATE_FORMAT(payment.createdAt, '%Y-%m-%d')`, 'period')
  .addSelect('COUNT(payment.id)', 'count')
  .addSelect('SUM(payment.amount)', 'total')
  .where('payment.status = :status', { status: PaymentStatus.SETTLEMENT })
  .andWhere('payment.createdAt >= :startDate', { startDate })
  .groupBy('period')
  .orderBy('period', 'ASC')
  .getRawMany();
```

---

## 9. USAGE EXAMPLES

### **9.1 Get Dashboard Summary (Daily)**

```bash
curl -X GET \
  'http://localhost:3000/admin/dashboard/summary' \
  -H "Authorization: Bearer JWT_TOKEN"
```

---

### **9.2 Get Revenue Trends (Weekly)**

```bash
curl -X GET \
  'http://localhost:3000/admin/dashboard/revenue/trends?period=weekly&days=90' \
  -H "Authorization: Bearer JWT_TOKEN"
```

---

### **9.3 Generate & Export Sales Report**

```bash
# Get JSON report
curl -X GET \
  'http://localhost:3000/admin/reports/sales?startDate=2025-12-01&endDate=2025-12-14' \
  -H "Authorization: Bearer JWT_TOKEN"

# Export as CSV
curl -X GET \
  'http://localhost:3000/admin/reports/sales/export?startDate=2025-12-01&endDate=2025-12-14' \
  -H "Authorization: Bearer JWT_TOKEN" \
  -o sales-report.csv
```

---

### **9.4 Get Top Products with Performance**

```bash
curl -X GET \
  'http://localhost:3000/admin/dashboard/products/top?limit=20' \
  -H "Authorization: Bearer JWT_TOKEN"
```

---

### **9.5 Get Customer Segmentation Report**

```bash
curl -X GET \
  'http://localhost:3000/admin/reports/customers?startDate=2025-01-01&endDate=2025-12-14' \
  -H "Authorization: Bearer JWT_TOKEN"
```

---

## 10. FILES STRUCTURE

```
src/modules/admin/
├── controllers/
│   ├── dashboard.controller.ts     (Dashboard endpoints)
│   └── reports.controller.ts       (Report endpoints)
├── services/
│   ├── dashboard.service.ts        (Dashboard logic)
│   ├── reports.service.ts          (Report generation)
│   └── export.service.ts           (CSV export)
├── dto/
│   └── dashboard.dto.ts            (DTOs & interfaces)
└── admin.module.ts                 (Module definition)
```

---

## 11. AUTHENTICATION & AUTHORIZATION

### **Requirements:**
- JWT token required
- Admin or Owner role required
- All endpoints protected with `@UseGuards(JwtAuthGuard, RolesGuard)`
- Role-based access control with `@Roles(Role.ADMIN, Role.OWNER)`

### **Example Protected Endpoint:**
```typescript
@Get('summary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.OWNER)
async getDashboardSummary(@Query() dateRange: DateRangeDto) { ... }
```

---

## 12. PERFORMANCE CONSIDERATIONS

### **Optimization Tips:**

1. **Date Range Filtering**
   - Use specific date ranges to reduce data volume
   - Avoid querying entire database when possible

2. **Pagination**
   - Use limit parameter untuk large datasets
   - Implement pagination in future versions

3. **Caching**
   - Cache dashboard summary (refresh every 5 minutes)
   - Cache product performance data
   - Implement Redis untuk frequently accessed metrics

4. **Indexing**
   - Ensure indexes on `createdAt`, `status`, `userId`, `orderId`
   - Performance critical for analytics queries

---

## 13. ERROR HANDLING

### **Common Errors:**

```json
{
  "statusCode": 400,
  "message": "startDate dan endDate diperlukan",
  "error": "Bad Request"
}
```

### **Authorization Error:**

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Admin role required"
}
```

---

## 14. NEXT STEPS

### **Phase 2 Enhancements:**
- [ ] Real-time dashboard with WebSocket
- [ ] Advanced filtering & search
- [ ] Custom date range presets (Last 7 days, Last 30 days, etc)
- [ ] PDF report generation
- [ ] Email report scheduling
- [ ] Data visualization with charts
- [ ] Export to Excel format
- [ ] Multi-language support
- [ ] Custom dashboard widgets
- [ ] Predictive analytics (ML integration)

---

## 15. SUMMARY

**Admin Dashboard Module** menyediakan comprehensive analytics dan reporting untuk MyMedina e-commerce platform dengan:

- ✅ 8 dashboard endpoints untuk real-time metrics
- ✅ 10 report endpoints dengan 5 different report types
- ✅ CSV export untuk semua reports
- ✅ Complete customer analytics dan segmentation
- ✅ Product performance tracking
- ✅ Revenue trends analysis
- ✅ Role-based access control
- ✅ Optimized database queries

**Status:** ✅ PRODUCTION READY

---

**Documentation Version:** 1.0
**Last Updated:** December 2025
**Status:** ✅ COMPLETE
