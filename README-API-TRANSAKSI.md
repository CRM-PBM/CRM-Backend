# REST API Transaksi - CRM Backend

REST API lengkap untuk manajemen transaksi penjualan dengan fitur CRUD dan manajemen stok otomatis.

## 📋 Fitur

- ✅ Create transaksi dengan multiple items
- ✅ Auto-generate nomor transaksi (TRX-YYYYMMDD-XXXX)
- ✅ Manajemen stok otomatis (kurangi saat beli, kembalikan saat delete)
- ✅ Validasi stok produk
- ✅ Get all transaksi dengan pagination
- ✅ Filter berdasarkan pelanggan, metode pembayaran, tanggal
- ✅ Get transaksi by ID dengan detail items
- ✅ Update transaksi (metode pembayaran, keterangan)
- ✅ Delete transaksi dengan rollback stok
- ✅ Statistik transaksi (total, pendapatan, top products)
- ✅ Include data pelanggan dan produk (relasi)
- ✅ Database transaction untuk data consistency

## 🚀 Quick Start

### 1. Jalankan Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

### 2. Test API
```bash
node tests/test-transaksi-api.js
```

## 📚 API Endpoints

Base URL: `http://localhost:3000/api/transaksi`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/transaksi` | Get semua transaksi |
| GET | `/api/transaksi/:id` | Get transaksi by ID |
| POST | `/api/transaksi` | Create transaksi baru |
| PUT | `/api/transaksi/:id` | Update transaksi |
| DELETE | `/api/transaksi/:id` | Delete transaksi |
| GET | `/api/transaksi/statistik` | Get statistik transaksi |

## 📖 Detail Endpoint

### 1. Get All Transaksi
```http
GET /api/transaksi
```

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 10)
- `pelanggan_id` (optional): Filter by pelanggan ID
- `metode_pembayaran` (optional): Filter by metode pembayaran
- `start_date` (optional): Filter tanggal mulai (YYYY-MM-DD)
- `end_date` (optional): Filter tanggal akhir (YYYY-MM-DD)
- `search` (optional): Pencarian nomor transaksi/keterangan

**Contoh Request:**
```bash
# Get semua transaksi
curl http://localhost:3000/api/transaksi

# Dengan pagination
curl "http://localhost:3000/api/transaksi?page=1&limit=5"

# Dengan filter tanggal
curl "http://localhost:3000/api/transaksi?start_date=2025-01-01&end_date=2025-12-31"

# Filter by pelanggan
curl "http://localhost:3000/api/transaksi?pelanggan_id=1"
```

**Response:**
```json
{
  "success": true,
  "message": "Data transaksi berhasil diambil",
  "data": [
    {
      "transaksi_id": 1,
      "nomor_transaksi": "TRX-20251010-0001",
      "tanggal_transaksi": "2025-10-10T10:30:00.000Z",
      "total": "250000.00",
      "metode_pembayaran": "Cash",
      "keterangan": "Transaksi toko",
      "pelanggan_id": 1,
      "Pelanggan": {
        "pelanggan_id": 1,
        "nama": "John Doe",
        "telepon": "08123456789",
        "email": "john@example.com"
      },
      "DetailTransaksis": [
        {
          "detail_id": 1,
          "jumlah": 2,
          "harga_satuan": "100000.00",
          "subtotal": "200000.00",
          "Produk": {
            "produk_id": 1,
            "nama_produk": "Produk A",
            "harga": "100000.00"
          }
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 2. Get Transaksi by ID
```http
GET /api/transaksi/:id
```

**Contoh Request:**
```bash
curl http://localhost:3000/api/transaksi/1
```

**Response:**
```json
{
  "success": true,
  "message": "Data transaksi berhasil diambil",
  "data": {
    "transaksi_id": 1,
    "nomor_transaksi": "TRX-20251010-0001",
    "tanggal_transaksi": "2025-10-10T10:30:00.000Z",
    "total": "250000.00",
    "metode_pembayaran": "Cash",
    "keterangan": "Transaksi toko",
    "Pelanggan": {...},
    "DetailTransaksis": [...],
    "Invoice": null
  }
}
```

### 3. Create Transaksi
```http
POST /api/transaksi
```

**Request Body:**
```json
{
  "pelanggan_id": 1,           // Optional
  "metode_pembayaran": "Cash", // Optional
  "keterangan": "Transaksi toko", // Optional
  "items": [                   // Required - minimal 1 item
    {
      "produk_id": 1,
      "jumlah": 2,
      "harga_satuan": 100000   // Optional, default dari harga produk
    },
    {
      "produk_id": 2,
      "jumlah": 1
    }
  ]
}
```

**Contoh Request:**
```bash
curl -X POST http://localhost:3000/api/transaksi \
  -H "Content-Type: application/json" \
  -d '{
    "pelanggan_id": 1,
    "metode_pembayaran": "Cash",
    "keterangan": "Pembelian langsung",
    "items": [
      {
        "produk_id": 1,
        "jumlah": 2,
        "harga_satuan": 100000
      },
      {
        "produk_id": 2,
        "jumlah": 1
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Transaksi berhasil dibuat",
  "data": {
    "transaksi_id": 1,
    "nomor_transaksi": "TRX-20251010-0001",
    "total": "250000.00",
    ...
  }
}
```

**Validasi:**
- Items wajib diisi (minimal 1)
- Produk harus ada dan aktif
- Stok harus mencukupi
- Stok akan otomatis berkurang sesuai jumlah pembelian

### 4. Update Transaksi
```http
PUT /api/transaksi/:id
```

**Request Body:** (Semua field optional)
```json
{
  "metode_pembayaran": "Transfer",
  "keterangan": "Update keterangan",
  "pelanggan_id": 2
}
```

**Note:** Update tidak mengubah items transaksi. Untuk mengubah items, hapus dan buat transaksi baru.

**Contoh Request:**
```bash
curl -X PUT http://localhost:3000/api/transaksi/1 \
  -H "Content-Type: application/json" \
  -d '{
    "metode_pembayaran": "Transfer",
    "keterangan": "Dibayar via transfer"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Transaksi berhasil diupdate",
  "data": {...}
}
```

### 5. Delete Transaksi
```http
DELETE /api/transaksi/:id
```

**Contoh Request:**
```bash
curl -X DELETE http://localhost:3000/api/transaksi/1
```

**Response:**
```json
{
  "success": true,
  "message": "Transaksi berhasil dihapus"
}
```

**Note:** 
- Stok produk akan dikembalikan otomatis
- Detail transaksi dan invoice (jika ada) ikut terhapus

### 6. Get Statistik Transaksi
```http
GET /api/transaksi/statistik
```

**Query Parameters:**
- `start_date` (optional): Tanggal mulai filter (YYYY-MM-DD)
- `end_date` (optional): Tanggal akhir filter (YYYY-MM-DD)

**Contoh Request:**
```bash
# Statistik semua waktu
curl http://localhost:3000/api/transaksi/statistik

# Statistik per periode
curl "http://localhost:3000/api/transaksi/statistik?start_date=2025-01-01&end_date=2025-12-31"
```

**Response:**
```json
{
  "success": true,
  "message": "Statistik transaksi berhasil diambil",
  "data": {
    "total_transaksi": 150,
    "total_pendapatan": "50000000.00",
    "top_products": [
      {
        "produk_id": 1,
        "total_terjual": "500",
        "total_pendapatan": "25000000.00",
        "Produk": {
          "nama_produk": "Produk A"
        }
      }
    ]
  }
}
```

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Items transaksi wajib diisi"
}
```

```json
{
  "success": false,
  "message": "Stok produk Produk A tidak mencukupi. Stok tersedia: 5"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Transaksi tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## 🔧 Struktur File

```
src/
├── models/
│   ├── Transaksi.js          # Model transaksi
│   ├── DetailTransaksi.js    # Model detail items
│   └── Produk.js             # Model produk
├── controllers/
│   └── transaksiController.js  # Request handlers
├── services/
│   └── transaksiService.js     # Business logic
└── routes/
    └── transaksi.js           # Route definitions
```

## 🔗 Relasi Database

**Transaksi:**
- belongsTo Pelanggan (many-to-one)
- hasMany DetailTransaksi (one-to-many)
- hasOne Invoice (one-to-one)

**DetailTransaksi:**
- belongsTo Transaksi (many-to-one)
- belongsTo Produk (many-to-one)

## 💡 Business Logic

### Auto-Generate Nomor Transaksi
Format: `TRX-YYYYMMDD-XXXX`
- `TRX`: Prefix
- `YYYYMMDD`: Tanggal transaksi
- `XXXX`: Sequence number (0001, 0002, dst)

Contoh: `TRX-20251010-0001`

### Manajemen Stok Otomatis

**Saat Create Transaksi:**
1. Validasi stok mencukupi
2. Kurangi stok produk sesuai jumlah
3. Jika gagal, rollback semua perubahan

**Saat Delete Transaksi:**
1. Kembalikan stok produk
2. Hapus detail transaksi
3. Hapus invoice (jika ada)
4. Hapus transaksi

### Database Transaction
Semua operasi create dan delete menggunakan database transaction untuk memastikan data consistency.

## 🧪 Testing dengan Postman

1. Import collection dari `docs/postman-collection.json`
2. Pastikan ada data pelanggan dan produk di database
3. Test create transaksi dengan items

## 📝 Contoh Skenario

### Skenario 1: Buat Transaksi Lengkap
```bash
# 1. Buat transaksi dengan 2 items
curl -X POST http://localhost:3000/api/transaksi \
  -H "Content-Type: application/json" \
  -d '{
    "pelanggan_id": 1,
    "metode_pembayaran": "Cash",
    "keterangan": "Pembelian di toko",
    "items": [
      {"produk_id": 1, "jumlah": 2},
      {"produk_id": 2, "jumlah": 3}
    ]
  }'

# 2. Lihat detail transaksi
curl http://localhost:3000/api/transaksi/1

# 3. Update metode pembayaran
curl -X PUT http://localhost:3000/api/transaksi/1 \
  -H "Content-Type: application/json" \
  -d '{"metode_pembayaran": "Transfer"}'
```

### Skenario 2: Lihat Statistik
```bash
# Statistik bulan ini
curl "http://localhost:3000/api/transaksi/statistik?start_date=2025-10-01&end_date=2025-10-31"
```

## 🐛 Troubleshooting

**Error "Stok tidak mencukupi":**
- Cek stok produk dengan GET `/api/produk/:id`
- Pastikan produk aktif dan stok > 0

**Error "Items transaksi wajib diisi":**
- Pastikan array items tidak kosong
- Minimal 1 item dalam transaksi

**Nomor transaksi duplikat:**
- Sistem auto-generate nomor unik
- Jika terjadi, coba lagi atau cek database

## 💼 Best Practices

1. **Selalu gunakan transaction** untuk operasi multi-table
2. **Validasi stok** sebelum create transaksi
3. **Gunakan harga_satuan** untuk harga khusus/diskon
4. **Backup data** sebelum delete transaksi besar
5. **Monitor stok produk** secara berkala

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
