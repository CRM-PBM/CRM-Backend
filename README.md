# CRM Backend - REST API Documentation

Backend API untuk sistem CRM (Customer Relationship Management) UMKM menggunakan Express.js dan Sequelize ORM.

## 📋 Fitur Utama

### ✅ API Pelanggan
- CRUD pelanggan lengkap
- Pagination & filtering
- Search berdasarkan nama/email/telepon
- Validasi email unik

### ✅ API Transaksi
- Create transaksi dengan multiple items
- Auto-generate nomor transaksi (TRX-YYYYMMDD-XXXX)
- Manajemen stok otomatis
- Database transaction untuk consistency
- Statistik & reporting

### ✅ API Produk
- CRUD produk
- Manajemen stok
- Status aktif/non-aktif

### ✅ API Broadcast WhatsApp
- WhatsApp broadcast via Watzap.id
- Personalisasi pesan dengan placeholder
- Tracking status per penerima
- Statistik pengiriman
- Environment variables untuk keamanan

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL
- npm

### Installation

```bash
# Install dependencies
npm install

# Setup .env file
cp .env.example .env
# Edit .env dengan kredensial Anda (database, Watzap.id, dll)
# Lihat panduan lengkap: SETUP-BROADCAST.md

# Sync database tables
node src/sync.js

# Start server
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📚 API Endpoints

Base URL: `http://localhost:3000/api`

### Pelanggan
- `GET /api/pelanggan` - Get all
- `GET /api/pelanggan/:id` - Get by ID
- `POST /api/pelanggan` - Create
- `PUT /api/pelanggan/:id` - Update
- `DELETE /api/pelanggan/:id` - Delete

📖 [Dokumentasi lengkap](./README-API-PELANGGAN.md)

### Transaksi
- `GET /api/transaksi` - Get all
- `GET /api/transaksi/:id` - Get by ID
- `POST /api/transaksi` - Create
- `PUT /api/transaksi/:id` - Update
- `DELETE /api/transaksi/:id` - Delete
- `GET /api/transaksi/statistik` - Statistik

📖 [Dokumentasi lengkap](./README-API-TRANSAKSI.md)

### Produk
- `GET /api/produk` - Get all
- `GET /api/produk/:id` - Get by ID
- `POST /api/produk` - Create
- `PUT /api/produk/:id` - Update
- `DELETE /api/produk/:id` - Delete

### Broadcast WhatsApp
- `GET /api/broadcast` - Get all
- `GET /api/broadcast/:id` - Get by ID
- `POST /api/broadcast` - Create broadcast (draft)
- `POST /api/broadcast/:id/send` - Kirim broadcast
- `DELETE /api/broadcast/:id` - Delete
- `GET /api/broadcast/statistik` - Statistik
- `GET /api/broadcast/device/status` - Cek status WA

📖 [Dokumentasi lengkap](./README-API-BROADCAST.md)

## 🧪 Testing

```bash
# Test API Pelanggan
node tests/test-pelanggan-api.js

# Test API Transaksi
node tests/test-transaksi-api.js

# Test API Broadcast
node tests/test-broadcast-api.js
```

Import `docs/postman-collection.json` ke Postman.

## 📁 Tech Stack

- Node.js + Express.js v5
- Sequelize ORM v6
- MySQL
- Axios (HTTP client & testing)
- Dotenv (environment variables)
- Watzap.id API (WhatsApp integration)

## 💡 Fitur Khusus

- **Auto-generate nomor transaksi**: Format TRX-YYYYMMDD-XXXX
- **Manajemen stok otomatis**: Berkurang saat beli, kembali saat delete
- **Database transaction**: Untuk data consistency
- **Pagination & filtering**: Semua endpoint list
- **WhatsApp broadcast**: Integrasi dengan Watzap.id
- **Personalisasi pesan**: Placeholder {nama}, {telepon}, {email}
- **Environment variables**: Keamanan kredensial dengan dotenv

## 📖 Dokumentasi Lengkap

### API Documentation
- [API Pelanggan](./README-API-PELANGGAN.md)
- [API Transaksi](./README-API-TRANSAKSI.md)
- [API Broadcast WhatsApp](./README-API-BROADCAST.md)

### Setup Guides
- [🚀 Setup Broadcast WhatsApp](./SETUP-BROADCAST.md) - **Panduan lengkap setup Watzap.id**
- [Backend Structure](./README-backend-structure.md)

### Testing Tools
- [Postman Collection - General](./docs/postman-collection.json)
- [Postman Collection - Broadcast](./docs/postman-collection-broadcast.json)

---

**Happy Coding! 🎉**
