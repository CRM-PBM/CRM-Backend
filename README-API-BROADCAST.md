# REST API Broadcast WhatsApp - CRM Backend

REST API lengkap untuk WhatsApp Broadcast menggunakan integrasi Watzap.id.

## 📋 Fitur

- ✅ Create broadcast (draft) dengan multiple penerima
- ✅ Kirim broadcast WhatsApp via Watzap.id
- ✅ Personalisasi pesan dengan placeholder
- ✅ Auto-retry dan rate limiting
- ✅ Tracking status pengiriman per penerima
- ✅ Statistik broadcast (success rate)
- ✅ Validasi nomor telepon Indonesia
- ✅ Cek status device WhatsApp
- ✅ Environment variables untuk keamanan

## 🔐 Setup Environment Variables

### 1. Copy file .env.example
```bash
cp .env.example .env
```

### 2. Edit file .env
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crmumkm
DB_USER=root
DB_PASSWORD=

# Watzap.id API Configuration
WATZAP_API_URL=https://api.watzap.id/v1
WATZAP_API_KEY=your_actual_api_key_here
WATZAP_NUMBER_KEY=your_actual_number_key_here

# Optional: Rate Limiting untuk Broadcast
BROADCAST_RATE_LIMIT=10
BROADCAST_DELAY_MS=1000
```

### 3. Dapatkan API Key dan Number Key dari Watzap.id
1. Daftar/Login di https://watzap.id
2. Buat device baru & scan QR code
3. Copy **API Key** dan **Number Key** dari dashboard
4. Paste ke file `.env`

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup .env
Edit `.env` dengan kredensial Watzap.id Anda

### 3. Start Server
```bash
npm start
```

### 4. Cek Status Device
```bash
curl http://localhost:3000/api/broadcast/device/status
```

## 📚 API Endpoints

Base URL: `http://localhost:3000/api/broadcast`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/broadcast` | Get all broadcast |
| GET | `/api/broadcast/:id` | Get broadcast by ID |
| POST | `/api/broadcast` | Create broadcast (draft) |
| POST | `/api/broadcast/:id/send` | Kirim broadcast |
| DELETE | `/api/broadcast/:id` | Delete broadcast |
| GET | `/api/broadcast/statistik` | Get statistik |
| GET | `/api/broadcast/device/status` | Cek status device WA |

## 📖 Detail Endpoint

### 1. Get All Broadcast
```http
GET /api/broadcast?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 10)
- `status` (optional): Filter by status (draft/sending/completed/failed/partial)
- `search` (optional): Pencarian judul/isi pesan

**Response:**
```json
{
  "success": true,
  "message": "Data broadcast berhasil diambil",
  "data": [
    {
      "broadcast_id": 1,
      "judul_pesan": "Promo Akhir Tahun",
      "isi_pesan": "Halo {nama}, dapatkan diskon 50%!",
      "tanggal_kirim": "2025-10-10T10:00:00.000Z",
      "status": "completed",
      "stats": {
        "total_penerima": 100,
        "terkirim": 98,
        "pending": 0,
        "gagal": 2
      },
      "BroadcastDetails": [...]
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

### 2. Get Broadcast by ID
```http
GET /api/broadcast/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Data broadcast berhasil diambil",
  "data": {
    "broadcast_id": 1,
    "judul_pesan": "Promo Akhir Tahun",
    "isi_pesan": "Halo {nama}, dapatkan diskon 50%!",
    "status": "completed",
    "stats": {
      "total_penerima": 100,
      "terkirim": 98,
      "pending": 0,
      "gagal": 2
    },
    "BroadcastDetails": [
      {
        "broadcast_detail_id": 1,
        "status": "sent",
        "tanggal_kirim": "2025-10-10T10:05:00.000Z",
        "Pelanggan": {
          "pelanggan_id": 1,
          "nama": "John Doe",
          "telepon": "08123456789"
        }
      }
    ]
  }
}
```

### 3. Create Broadcast (Draft)
```http
POST /api/broadcast
Content-Type: application/json

{
  "judul_pesan": "Promo Akhir Tahun",
  "isi_pesan": "Halo {nama}, dapatkan diskon 50% untuk semua produk!",
  "pelanggan_ids": [1, 2, 3, 4, 5],
  "user_id": 1
}
```

**Request Body:**
- `judul_pesan` (required): Judul broadcast
- `isi_pesan` (required): Isi pesan (bisa pakai placeholder)
- `pelanggan_ids` (required): Array ID pelanggan penerima
- `user_id` (optional): ID user yang membuat

**Placeholder yang Tersedia:**
- `{nama}` - Nama pelanggan
- `{telepon}` - Nomor telepon
- `{email}` - Email pelanggan

**Response:**
```json
{
  "success": true,
  "message": "Broadcast berhasil dibuat (draft)",
  "data": {
    "broadcast_id": 1,
    "judul_pesan": "Promo Akhir Tahun",
    "status": "draft",
    ...
  }
}
```

**Validasi:**
- Judul dan isi pesan wajib diisi
- Minimal 1 pelanggan penerima
- Pelanggan harus memiliki nomor telepon
- Nomor telepon harus valid (Indonesia)

### 4. Kirim Broadcast
```http
POST /api/broadcast/:id/send
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast berhasil dikirim",
  "data": {
    "broadcast_id": 1,
    "status": "completed",
    "results": {
      "total": 100,
      "success": 98,
      "failed": 2,
      "details": [
        {
          "pelanggan_id": 1,
          "nama": "John Doe",
          "telepon": "08123456789",
          "status": "sent"
        },
        {
          "pelanggan_id": 2,
          "nama": "Jane Doe",
          "telepon": "08198765432",
          "status": "failed",
          "error": "Number not registered on WhatsApp"
        }
      ]
    }
  }
}
```

**Status Broadcast:**
- `draft` - Baru dibuat, belum dikirim
- `sending` - Sedang dalam proses pengiriman
- `completed` - Semua terkirim
- `failed` - Semua gagal
- `partial` - Sebagian terkirim, sebagian gagal

**Note:**
- Pengiriman dilakukan satu per satu dengan delay 1 detik
- Status detail akan diupdate real-time
- Hanya pelanggan dengan status "pending" yang akan dikirim

### 5. Delete Broadcast
```http
DELETE /api/broadcast/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast berhasil dihapus"
}
```

**Note:**
- Tidak bisa menghapus broadcast yang sedang sending
- Detail broadcast ikut terhapus

### 6. Get Statistik
```http
GET /api/broadcast/statistik?start_date=2025-01-01&end_date=2025-12-31
```

**Query Parameters:**
- `start_date` (optional): Tanggal mulai (YYYY-MM-DD)
- `end_date` (optional): Tanggal akhir (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Statistik broadcast berhasil diambil",
  "data": {
    "total_broadcast": 50,
    "total_penerima": 5000,
    "terkirim": 4850,
    "gagal": 150,
    "success_rate": "97.00"
  }
}
```

### 7. Cek Status Device WhatsApp
```http
GET /api/broadcast/device/status
```

**Response:**
```json
{
  "success": true,
  "message": "Status device berhasil diambil",
  "data": {
    "success": true,
    "connected": true,
    "data": {
      "device_id": "your_device_id",
      "phone": "628123456789",
      "status": "connected"
    }
  }
}
```

## 🔧 Integrasi Watzap.id

### Format Nomor Telepon
- Nomor Indonesia: `628xxx` (tanpa +, tanpa 0)
- Sistem akan auto-format dari `08xxx` ke `628xxx`
- Validasi: 62 + 8-11 digit

### Rate Limiting
- Default delay: 1000ms (1 detik) antar pesan
- Configurable via `.env`: `BROADCAST_DELAY_MS`
- Hindari spam dan rate limit dari WhatsApp

### Error Handling
- Invalid phone number: Dilewati, tidak error
- API error: Dicoba sekali, jika gagal status = failed
- Network error: Logged, status = failed

## 💡 Fitur Khusus

### 1. Personalisasi Pesan
```javascript
// Template pesan
"Halo {nama}, terima kasih telah berbelanja! 
Hubungi kami di {telepon} atau email {email}"

// Hasil untuk pelanggan "John Doe"
"Halo John Doe, terima kasih telah berbelanja! 
Hubungi kami di 08123456789 atau email john@example.com"
```

### 2. Tracking Detail
Setiap penerima memiliki status:
- `pending` - Belum dikirim
- `sent` - Berhasil terkirim
- `failed` - Gagal terkirim

### 3. Auto-Format Nomor
```javascript
// Input berbagai format
"08123456789"  → "628123456789"
"8123456789"   → "628123456789"
"628123456789" → "628123456789"
"+628123456789" → "628123456789"
```

## 🧪 Testing

### Manual Test

#### 1. Cek Status Device
```bash
curl http://localhost:3000/api/broadcast/device/status
```

#### 2. Create Broadcast
```bash
curl -X POST http://localhost:3000/api/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "judul_pesan": "Test Broadcast",
    "isi_pesan": "Halo {nama}, ini adalah test message!",
    "pelanggan_ids": [1, 2, 3]
  }'
```

#### 3. Kirim Broadcast
```bash
curl -X POST http://localhost:3000/api/broadcast/1/send
```

#### 4. Get Statistik
```bash
curl http://localhost:3000/api/broadcast/statistik
```

## 📁 Struktur File

```
src/
├── services/
│   ├── watzapService.js      # Integrasi Watzap.id API
│   └── broadcastService.js   # Business logic broadcast
├── controllers/
│   └── broadcastController.js # Request handlers
├── routes/
│   └── broadcast.js          # Route definitions
├── models/
│   ├── Broadcast.js          # Model broadcast
│   └── BroadcastDetail.js    # Model detail penerima
└── config/
    └── index.js              # Config dari .env
```

## 🔐 Keamanan

### Environment Variables
✅ Semua kredensial di `.env`
✅ File `.env` di `.gitignore`
✅ Gunakan `.env.example` sebagai template

### Best Practices
1. **Jangan commit `.env`** ke repository
2. **Gunakan `.env.example`** untuk dokumentasi
3. **Rotasi API Key** secara berkala
4. **Rate limiting** untuk mencegah spam
5. **Validasi input** sebelum kirim

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Isi pesan wajib diisi"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Broadcast tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## 🐛 Troubleshooting

### Device Not Connected
**Masalah:** Status device = false

**Solusi:**
1. Cek kredensial `.env` sudah benar
2. Scan QR code di dashboard Watzap.id
3. Pastikan WhatsApp web aktif

### Nomor Tidak Terdaftar
**Masalah:** Error "Number not registered on WhatsApp"

**Solusi:**
- Nomor belum punya WhatsApp
- Cek format nomor sudah benar (628xxx)
- Validasi nomor di database

### Rate Limit Error
**Masalah:** Banyak pesan gagal terkirim

**Solusi:**
1. Naikkan `BROADCAST_DELAY_MS` di `.env`
2. Kurangi jumlah penerima per batch
3. Tunggu beberapa saat sebelum kirim lagi

## 💼 Production Tips

1. **Gunakan Queue System** (Bull, BullMQ)
   - Proses broadcast di background
   - Retry mechanism
   - Better scalability

2. **WebSocket untuk Progress**
   - Real-time update status pengiriman
   - UI progress bar

3. **Logging & Monitoring**
   - Log semua pengiriman
   - Monitor success rate
   - Alert jika banyak gagal

4. **Backup Device**
   - Siapkan multiple device
   - Load balancing

## 📞 Support

Jika ada pertanyaan tentang:
- **Watzap.id API**: https://watzap.id/docs
- **CRM Backend**: Buat issue di repository

---

**Happy Broadcasting! 📱💬**
