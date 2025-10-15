# API Transaksi - Quick Reference

## Base URL
```
http://localhost:3000/api/transaksi
```

## Endpoints

### 1. Get All Transaksi
```http
GET /api/transaksi?page=1&limit=10
```

Query params: `page`, `limit`, `pelanggan_id`, `metode_pembayaran`, `start_date`, `end_date`, `search`

### 2. Get by ID
```http
GET /api/transaksi/:id
```

### 3. Create Transaksi
```http
POST /api/transaksi
Content-Type: application/json

{
  "pelanggan_id": 1,
  "metode_pembayaran": "Cash",
  "keterangan": "Optional",
  "items": [
    {
      "produk_id": 1,
      "jumlah": 2,
      "harga_satuan": 100000  // optional
    }
  ]
}
```

**Fitur:**
- Auto-generate nomor transaksi (TRX-YYYYMMDD-XXXX)
- Auto-reduce stok produk
- Validasi stok mencukupi
- Database transaction untuk consistency

### 4. Update Transaksi
```http
PUT /api/transaksi/:id
Content-Type: application/json

{
  "metode_pembayaran": "Transfer",
  "keterangan": "Updated"
}
```

Note: Tidak bisa update items, hanya metode bayar & keterangan.

### 5. Delete Transaksi
```http
DELETE /api/transaksi/:id
```

**Fitur:**
- Auto-return stok produk
- Hapus detail transaksi
- Hapus invoice (jika ada)

### 6. Get Statistik
```http
GET /api/transaksi/statistik?start_date=2025-01-01&end_date=2025-12-31
```

Returns: total transaksi, total pendapatan, top products

## Response Format

### Success
```json
{
  "success": true,
  "message": "...",
  "data": {...},
  "pagination": {...}  // untuk list
}
```

### Error
```json
{
  "success": false,
  "message": "Error message"
}
```

## Error Codes
- `400` - Bad Request (validasi gagal)
- `404` - Not Found
- `500` - Internal Server Error

## Testing
```bash
# Start server
npm start

# Run tests
node tests/test-transaksi-api.js
```

## Postman Collection
Import `docs/postman-collection.json` ke Postman.
