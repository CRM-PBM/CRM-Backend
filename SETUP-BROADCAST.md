# Panduan Setup Broadcast WhatsApp API

## 📋 Prerequisites

1. **Akun Watzap.id**
   - Daftar di https://watzap.id
   - Login ke dashboard
   - Catat **API Key** dan **Number Key** Anda

2. **WhatsApp Device**
   - Scan QR code untuk menghubungkan WhatsApp Anda
   - Pastikan device sudah terhubung di dashboard

## 🔧 Langkah Setup

### 1. Konfigurasi Environment Variables

Buat file `.env` di root project (jika belum ada):

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crmumkm
DB_USER=root
DB_PASSWORD=

# Watzap.id Configuration
WATZAP_API_URL=https://api.watzap.id/v1
WATZAP_API_KEY=your_api_key_here
WATZAP_NUMBER_KEY=your_number_key_here

# Broadcast Configuration
BROADCAST_RATE_LIMIT=10
BROADCAST_DELAY_MS=1000
```

**Penting:** 
- Ganti `your_api_key_here` dengan **API Key** dari dashboard Watzap.id
- Ganti `your_number_key_here` dengan **Number Key** dari dashboard Watzap.id

### 2. Install Dependencies

Pastikan dotenv sudah terinstall:

```bash
npm install dotenv
```

### 3. Restart Server

Restart server agar environment variables terbaca:

```bash
npm start
```

## 🧪 Testing Broadcast API

### Metode 1: Menggunakan Test Script

Jalankan automated test:

```bash
node tests/test-broadcast-api.js
```

Script ini akan:
- ✅ Cek status device WhatsApp
- ✅ Validasi prerequisites (pelanggan dengan nomor telepon)
- ✅ Test CRUD broadcast
- ✅ Validasi error handling
- ⚠️ Send broadcast (dikomentari untuk keamanan)

### Metode 2: Menggunakan Postman

1. **Import Collection**
   - Buka Postman
   - Import file: `docs/postman-collection-broadcast.json`
   - Set variable `base_url` = `http://localhost:3000`

2. **Test Step by Step**

   **a. Cek Status Device**
   ```
   GET /api/broadcast/device/status
   ```
   Response harus: `"status": "connected"`

   **b. Buat Broadcast Draft**
   ```
   POST /api/broadcast
   Body:
   {
     "judul_pesan": "Promo Akhir Tahun",
     "isi_pesan": "Halo {nama}, dapatkan diskon 50%!",
     "pelanggan_ids": [1, 2, 3]
   }
   ```

   **c. Kirim Broadcast** (Hati-hati, ini akan mengirim pesan sungguhan!)
   ```
   POST /api/broadcast/1/send
   ```

   **d. Lihat Statistik**
   ```
   GET /api/broadcast/statistik
   ```

### Metode 3: Menggunakan cURL (PowerShell)

```powershell
# Check Device Status
Invoke-RestMethod -Uri "http://localhost:3000/api/broadcast/device/status" -Method GET

# Create Broadcast
$body = @{
    judul_pesan = "Test Broadcast"
    isi_pesan = "Halo {nama}, ini adalah test"
    pelanggan_ids = @(1, 2)
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/broadcast" -Method POST -Body $body -ContentType "application/json"

# Get All Broadcasts
Invoke-RestMethod -Uri "http://localhost:3000/api/broadcast" -Method GET

# Send Broadcast (ID 1)
Invoke-RestMethod -Uri "http://localhost:3000/api/broadcast/1/send" -Method POST
```

## 📱 Format Nomor Telepon

### Otomatis Dikonversi

Sistem akan otomatis mengkonversi nomor telepon:

- ✅ `081234567890` → `6281234567890`
- ✅ `+6281234567890` → `6281234567890`
- ✅ `6281234567890` → `6281234567890` (sudah benar)
- ✅ `08123456789` → `628123456789`

### Format Yang Valid

- Minimal 10 digit
- Maksimal 15 digit
- Diawali 08 atau 628
- Hanya angka (+ optional di awal)

### Contoh Input Pelanggan

Saat membuat pelanggan, bisa pakai format apa saja:

```json
{
  "nama": "John Doe",
  "telepon": "081234567890",  // Akan dikonversi ke 6281234567890
  "email": "john@example.com"
}
```

## 🎯 Personalisasi Pesan

### Placeholder Yang Tersedia

| Placeholder | Akan Diganti Dengan | Contoh |
|-------------|---------------------|--------|
| `{nama}` | Nama pelanggan | John Doe |
| `{telepon}` | Nomor telepon | 6281234567890 |
| `{email}` | Email pelanggan | john@example.com |

### Contoh Penggunaan

**Input:**
```json
{
  "judul_pesan": "Promo Spesial",
  "isi_pesan": "Halo {nama}, dapatkan diskon 50%! Konfirmasi ke {telepon} atau email ke {email}",
  "pelanggan_ids": [1, 2]
}
```

**Output untuk pelanggan 1 (nama: John Doe):**
```
Halo John Doe, dapatkan diskon 50%! 
Konfirmasi ke 6281234567890 atau email ke john@example.com
```

**Output untuk pelanggan 2 (nama: Jane Smith):**
```
Halo Jane Smith, dapatkan diskon 50%! 
Konfirmasi ke 6282345678901 atau email ke jane@example.com
```

## ⚙️ Konfigurasi Rate Limiting

### Kenapa Rate Limit Diperlukan?

WhatsApp API (termasuk Watzap.id) memiliki batasan:
- Terlalu banyak pesan dalam waktu singkat = nomor bisa diblokir
- Rate limit melindungi dari spam detection

### Setting Default

Di file `.env`:
```
BROADCAST_RATE_LIMIT=10      # Max 10 pesan per batch
BROADCAST_DELAY_MS=1000      # Jeda 1 detik antar pesan
```

### Rekomendasi Berdasarkan Volume

| Volume Penerima | RATE_LIMIT | DELAY_MS | Total Waktu |
|----------------|------------|----------|-------------|
| < 10 pelanggan | 10 | 1000 | ~10 detik |
| 10-50 pelanggan | 10 | 2000 | ~2 menit |
| 50-100 pelanggan | 5 | 3000 | ~5 menit |
| > 100 pelanggan | 5 | 5000 | ~10 menit |

### Cara Mengubah

1. Edit file `.env`
2. Ubah nilai `BROADCAST_RATE_LIMIT` dan `BROADCAST_DELAY_MS`
3. Restart server

```bash
# Untuk broadcast besar (lebih aman)
BROADCAST_RATE_LIMIT=5
BROADCAST_DELAY_MS=3000
```

## 🔍 Troubleshooting

### 1. Device Status "disconnected"

**Problem:**
```json
{
  "error": "WhatsApp device tidak terhubung"
}
```

**Solution:**
1. Login ke dashboard Watzap.id
2. Scan QR code untuk koneksi ulang
3. Tunggu status menjadi "connected"
4. Coba lagi

### 2. API Key Invalid

**Problem:**
```json
{
  "error": "Invalid API Key"
}
```

**Solution:**
1. Cek `.env`, pastikan `WATZAP_API_KEY` benar
2. Copy ulang dari dashboard Watzap.id
3. Hapus spasi di awal/akhir
4. Restart server

### 3. Pelanggan Tidak Punya Nomor Telepon

**Problem:**
```json
{
  "error": "Pelanggan dengan ID 5 tidak memiliki nomor telepon yang valid"
}
```

**Solution:**
Update data pelanggan:
```bash
PUT /api/pelanggan/5
{
  "telepon": "081234567890"
}
```

### 4. Rate Limit Exceeded

**Problem:**
Broadcast gagal atau tertunda

**Solution:**
1. Kurangi `BROADCAST_RATE_LIMIT` (misal dari 10 ke 5)
2. Tingkatkan `BROADCAST_DELAY_MS` (misal dari 1000 ke 3000)
3. Restart server
4. Coba kirim ulang

### 5. Nomor Telepon Invalid

**Problem:**
```json
{
  "error": "Nomor telepon 021123456 tidak valid"
}
```

**Solution:**
- Nomor telepon harus format HP (08xxx atau 628xxx)
- Bukan nomor telepon rumah (021xxx, 022xxx, dll)
- Update dengan nomor HP yang valid

## 📊 Monitoring

### Cek Statistik Broadcast

```bash
GET /api/broadcast/statistik
```

Response:
```json
{
  "success": true,
  "data": {
    "total_broadcast": 10,
    "total_penerima": 45,
    "terkirim": 42,
    "gagal": 3,
    "success_rate": 93.33
  }
}
```

### Cek Detail Broadcast

```bash
GET /api/broadcast/1
```

Akan menampilkan:
- Status broadcast (draft/sent/failed)
- List semua penerima
- Status masing-masing penerima (pending/sent/failed)
- Error message (jika ada)
- Timestamp pengiriman

## 🎯 Best Practices

### 1. Selalu Test Dulu

Sebelum broadcast massal:
1. Buat broadcast dengan 1-2 penerima
2. Test kirim ke nomor Anda sendiri
3. Cek formatnya sudah benar
4. Baru broadcast ke semua

### 2. Gunakan Draft

```bash
# Step 1: Buat draft
POST /api/broadcast
{
  "judul_pesan": "...",
  "isi_pesan": "...",
  "pelanggan_ids": [...]
}

# Step 2: Review (lihat preview di database)
GET /api/broadcast/1

# Step 3: Kirim setelah yakin
POST /api/broadcast/1/send
```

### 3. Personalisasi Pesan

Jangan kirim pesan yang terlalu generic:
- ❌ "Halo, dapatkan promo!"
- ✅ "Halo {nama}, dapatkan promo spesial untuk Anda!"

### 4. Waktu Pengiriman

Kirim broadcast di jam yang tepat:
- ✅ 09:00 - 17:00 (jam kerja)
- ⚠️ 17:00 - 21:00 (jam pulang kerja, cukup ramai)
- ❌ 21:00 - 09:00 (malam/dini hari, mengganggu)

### 5. Frekuensi

Jangan terlalu sering:
- ✅ Max 2-3 broadcast per minggu
- ❌ Broadcast setiap hari = spam

## 📈 Contoh Use Case

### Use Case 1: Promo Mingguan

```json
{
  "judul_pesan": "Promo Weekend Special",
  "isi_pesan": "Hai {nama}! 🎉\n\nWeekend ini ada promo spesial:\n- Diskon 30% semua produk\n- Gratis ongkir min. 100rb\n\nBerlaku sampai Minggu!\n\nInfo: {telepon}",
  "pelanggan_ids": [1, 2, 3, 4, 5]
}
```

### Use Case 2: Reminder Pembayaran

```json
{
  "judul_pesan": "Reminder Invoice",
  "isi_pesan": "Halo {nama},\n\nIni reminder pembayaran invoice #INV-001:\nTotal: Rp 500.000\nJatuh tempo: 25 Des 2024\n\nKonfirmasi: {telepon}\nEmail: {email}",
  "pelanggan_ids": [10]
}
```

### Use Case 3: Update Produk Baru

```json
{
  "judul_pesan": "Produk Baru Arrived!",
  "isi_pesan": "Hi {nama}! 🛍️\n\nKami baru saja launch produk terbaru:\n- Product A - Rp 150.000\n- Product B - Rp 200.000\n\nPesan sekarang: {telepon}",
  "pelanggan_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

## 🔐 Security Notes

1. **Jangan Commit File .env**
   - File `.env` sudah ada di `.gitignore`
   - Hanya commit `.env.example` (tanpa kredensial)

2. **API Key Management**
   - Jangan share API key di public
   - Regenerate API key jika tercuri
   - Gunakan environment variables

3. **Validasi Input**
   - Sistem sudah validasi nomor telepon
   - Sistem sudah validasi pelanggan_ids
   - Jangan skip validation

## 📞 Support

Jika ada masalah:
1. Cek dokumentasi lengkap: `README-API-BROADCAST.md`
2. Cek dashboard Watzap.id: https://watzap.id
3. Cek logs server untuk error details

## ✅ Checklist Setup

- [ ] Daftar/login ke Watzap.id
- [ ] Dapatkan API Key dan Device ID
- [ ] Scan QR code untuk connect device
- [ ] Buat file `.env` dengan kredensial
- [ ] Install dependencies (`npm install`)
- [ ] Restart server (`npm start`)
- [ ] Test device status (`GET /api/broadcast/device/status`)
- [ ] Tambah data pelanggan dengan nomor telepon
- [ ] Test broadcast ke nomor sendiri dulu
- [ ] Import Postman collection
- [ ] Setup rate limiting sesuai kebutuhan

---

**Selamat menggunakan Broadcast WhatsApp API! 🚀**
