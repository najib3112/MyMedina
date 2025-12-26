# Role-Based Access Control (RBAC) Documentation

## Overview

MyMedina API menggunakan sistem Role-Based Access Control untuk mengelola akses ke fitur-fitur tertentu berdasarkan peran pengguna. Ada 3 role utama dalam sistem:

## Roles

### 1. CUSTOMER

- **Deskripsi**: Pengguna reguler yang dapat menjelajahi dan membeli produk
- **Akses**:
  - Melihat katalog produk
  - Membuat pesanan
  - Melacak pesanan mereka
  - Mengelola profil pribadi

### 2. ADMIN

- **Deskripsi**: Staff yang dapat mengelola produk, pesanan, dan pelanggan
- **Akses**:
  - `/admin/dashboard` - Dashboard admin dengan ringkasan bisnis
  - Mengelola produk dan kategori
  - Mengelola pesanan
  - Mengelola pengguna
  - **TIDAK** dapat mengakses laporan keuangan (dipindahkan ke Owner)

### 3. OWNER

- **Deskripsi**: Pemilik bisnis dengan akses penuh termasuk laporan keuangan
- **Akses**:
  - Semua akses Admin
  - `/owner/reports/sales` - Laporan penjualan
  - `/owner/reports/customers` - Laporan pelanggan
  - `/owner/reports/orders` - Laporan pesanan
  - `/owner/reports/inventory` - Laporan inventaris
  - `/owner/reports/category` - Laporan performa kategori
  - Export laporan dalam format CSV

## Module Structure

### Admin Module (`src/modules/admin/`)

**Tanggung Jawab**: Dashboard dan analytics dasar untuk admin

**Controllers**:

- `dashboard.controller.ts` - Dashboard summary dan metrics

**Services**:

- `dashboard.service.ts` - Business logic untuk dashboard

### Owner Module (`src/modules/owner/`)

**Tanggung Jawab**: Financial reports dan analytics mendalam untuk owner

**Controllers**:

- `reports.controller.ts` - Endpoints untuk laporan keuangan (hanya OWNER)

**Services**:

- `reports.service.ts` - Generating berbagai jenis laporan (penjualan, pelanggan, pesanan, dll)
- `export.service.ts` - Export laporan ke CSV

**DTOs**:

- `reports.dto.ts` - Data Transfer Objects untuk report endpoints

## Report Endpoints

Semua endpoint laporan hanya dapat diakses oleh user dengan role `OWNER`:

### Sales Report

```
GET /owner/reports/sales?startDate=2024-01-01&endDate=2024-12-31
GET /owner/reports/sales/export?startDate=2024-01-01&endDate=2024-12-31
```

### Customer Report

```
GET /owner/reports/customers?startDate=2024-01-01&endDate=2024-12-31
GET /owner/reports/customers/export?startDate=2024-01-01&endDate=2024-12-31
```

### Order Report

```
GET /owner/reports/orders?startDate=2024-01-01&endDate=2024-12-31
GET /owner/reports/orders/export?startDate=2024-01-01&endDate=2024-12-31
```

### Inventory Report

```
GET /owner/reports/inventory
GET /owner/reports/inventory/export
```

### Category Report

```
GET /owner/reports/category?startDate=2024-01-01&endDate=2024-12-31
GET /owner/reports/category/export?startDate=2024-01-01&endDate=2024-12-31
```

## Security & Authorization

### Guards & Decorators

Semua endpoint yang memerlukan autentikasi dan otorisasi menggunakan:

1. **JwtAuthGuard** - Memverifikasi JWT token
2. **RolesGuard** - Memverifikasi user memiliki role yang sesuai
3. **@Roles()** - Decorator untuk menspesifikasi role apa yang diizinkan

### Contoh:

```typescript
@Controller('owner/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
export class ReportsController {
  // Hanya user dengan role OWNER yang bisa akses
}
```

## Perubahan Terbaru

### Migrasi Reports dari Admin ke Owner (v1.0)

**Alasan**:

- Laporan keuangan adalah informasi sensitif yang seharusnya hanya diakses oleh Owner
- Admin sebaiknya hanya fokus pada operasional harian (dashboard, manajemen produk/pesanan)
- Separation of concerns yang lebih baik

**File yang Dipindahkan**:

- `ReportsService` - dari `admin/services/` ke `owner/services/`
- `ReportsController` - dari `admin/controllers/` ke `owner/controllers/`
- `ExportService` - dari `admin/services/` ke `owner/services/`

**File yang Diupdate**:

- `src/modules/admin/admin.module.ts` - Menghapus import untuk Reports dan Export
- `src/app.module.ts` - Menambahkan import untuk Owner Module
- Endpoint routes berubah dari `/admin/reports/*` menjadi `/owner/reports/*`

## Best Practices

1. **Selalu gunakan @Roles() decorator** - Pastikan setiap endpoint menspesifikasi role apa yang diizinkan
2. **Validate input** - Gunakan DTOs dan class-validator untuk validasi
3. **Secure sensitive endpoints** - Laporan keuangan dan data analytics harus di-protect dengan baik
4. **Audit logs** - Pertimbangkan untuk mencatat siapa yang mengakses laporan keuangan

## Testing

Saat testing endpoint reports:

1. Buat user dengan role `OWNER`
2. Login dan dapatkan JWT token
3. Gunakan token untuk akses `/owner/reports/*` endpoints
4. Pastikan user dengan role `ADMIN` mendapatkan 403 Forbidden saat mencoba akses endpoints ini
