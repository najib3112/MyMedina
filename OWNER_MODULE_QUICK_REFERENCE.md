# Quick Reference: Reports Access by Role

## Endpoint Access Matrix

```
╔════════════════════════════════════════════════════════════════════════╗
║                    REPORTS ENDPOINT ACCESS CONTROL                    ║
╠════════════════════════════════════════════════════════════════════════╣
║ Endpoint                        │ CUSTOMER │ ADMIN │ OWNER │ Auth     ║
╠═════════════════════════════════╪══════════╪═══════╪═══════╪══════════╣
║ GET /owner/reports/sales        │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║ GET /owner/reports/sales/export │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║                                 │          │       │       │          ║
║ GET /owner/reports/customers    │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║ GET /owner/reports/customers/.. │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║                                 │          │       │       │          ║
║ GET /owner/reports/orders       │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║ GET /owner/reports/orders/export│    ❌    │   ❌  │   ✅  │ JWT+Role ║
║                                 │          │       │       │          ║
║ GET /owner/reports/inventory    │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║ GET /owner/reports/inventory/.. │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║                                 │          │       │       │          ║
║ GET /owner/reports/category     │    ❌    │   ❌  │   ✅  │ JWT+Role ║
║ GET /owner/reports/category/... │    ❌    │   ❌  │   ✅  │ JWT+Role ║
╚════════════════════════════════════════════════════════════════════════╝
```

## Code Examples

### For OWNER User

```typescript
// Reports are accessible
const response = await fetch('/owner/reports/sales', {
  headers: {
    Authorization: `Bearer ${ownerToken}`,
  },
});
// ✅ 200 OK - Get report data
```

### For ADMIN User

```typescript
// Reports are NOT accessible
const response = await fetch('/owner/reports/sales', {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
// ❌ 403 Forbidden - Access denied
```

## Module Overview

### Admin Module

**Location**: `src/modules/admin/`

- ✅ Dashboard (summary metrics)
- ✅ Product management
- ✅ Order management
- ❌ Financial reports (moved to Owner)

### Owner Module (NEW)

**Location**: `src/modules/owner/`

- ✅ Sales reports
- ✅ Customer analytics
- ✅ Order analytics
- ✅ Inventory reports
- ✅ Category performance
- ✅ CSV exports

## Implementation Details

### Owner Module Structure

```
src/modules/owner/
├── owner.module.ts                 # Module definition
├── controllers/
│   └── reports.controller.ts       # @Controller('owner/reports')
├── services/
│   ├── reports.service.ts          # Report generation logic
│   └── export.service.ts           # CSV export
└── dto/
    └── reports.dto.ts              # DateRangeDto
```

### Key Features

- ✅ JWT Authentication (JwtAuthGuard)
- ✅ Role-based Authorization (RolesGuard + @Roles)
- ✅ Date range filtering
- ✅ CSV export functionality
- ✅ Comprehensive error handling
- ✅ Type-safe DTOs

## What Changed

| Item             | Before               | After              |
| ---------------- | -------------------- | ------------------ |
| Reports Location | `/admin/reports/*`   | `/owner/reports/*` |
| Reports Role     | Admin + Owner        | Owner only         |
| Module Location  | admin/services       | owner/services     |
| Access Control   | @Roles(ADMIN, OWNER) | @Roles(OWNER)      |

## Error Responses

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

Terjadi ketika:

- User role bukan OWNER
- User tidak authenticated

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "startDate dan endDate diperlukan",
  "error": "Bad Request"
}
```

Terjadi ketika:

- Missing startDate or endDate parameters (untuk date-range endpoints)

## Testing Endpoints

### Using cURL

```bash
# 1. Get OWNER token (after login)
OWNER_TOKEN="your_jwt_token_here"

# 2. Get sales report
curl -X GET "http://localhost:3000/owner/reports/sales?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $OWNER_TOKEN"

# 3. Export to CSV
curl -X GET "http://localhost:3000/owner/reports/sales/export?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -o sales-report.csv

# 4. Test with ADMIN token (should fail)
ADMIN_TOKEN="admin_jwt_token_here"
curl -X GET "http://localhost:3000/owner/reports/sales?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 403 Forbidden
```

### Using Postman

1. Create collection "Owner Reports"
2. Add request with:
   - **URL**: `http://localhost:3000/owner/reports/sales`
   - **Method**: GET
   - **Headers**:
     - `Authorization: Bearer {{owner_token}}`
   - **Query Params**:
     - `startDate: 2024-01-01`
     - `endDate: 2024-12-31`
3. Send request → Should get 200 with report data

## Documentation Links

- 📖 **Full RBAC Documentation**: See `RBAC_DOCUMENTATION.md`
- 📊 **Implementation Details**: See `OWNER_MODULE_IMPLEMENTATION.md`
- 📝 **Refactoring Summary**: See `REFACTORING_SUMMARY.md`
