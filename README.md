# CRM Backend - REST API Documentation

Backend API untuk sistem CRM (Customer Relationship Management) UMKM menggunakan Express.js dan Sequelize ORM.

## 📋 Fitur Utama

### 🔐 Autentikasi & Authorization
- JWT (JSON Web Token) authentication
- Refresh token untuk UX & security
- Register & Login
- Protected routes (harus login)
- Password hashing dengan bcrypt
- **Multi-tenancy: Data isolation per UMKM** ← Baru!
- Token expiration management

### ✅ API Pelanggan
- CRUD pelanggan lengkap
- **Auto-filter berdasarkan UMKM yang login** ← Baru!
- Pagination & filtering
- Search berdasarkan nama/email/telepon
- Validasi email unik

### ✅ API Transaksi
- Create transaksi dengan multiple items
- **Auto-filter berdasarkan UMKM yang login** ← Baru!
- Auto-generate nomor transaksi (TRX-YYYYMMDD-XXXX)
- Manajemen stok otomatis
- Database transaction untuk consistency
- Statistik & reporting per UMKM

### ✅ API Produk
- CRUD produk
- **Auto-filter berdasarkan UMKM yang login** ← Baru!
- Manajemen stok
- Status aktif/non-aktif

### ✅ API Broadcast WhatsApp
- WhatsApp broadcast via Watzap.id
- **Auto-filter berdasarkan UMKM yang login** ← Baru!
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

### 🔐 Autentikasi (Public - No Token Required)
- `POST /api/auth/register` - Registrasi UMKM & User baru
- `POST /api/auth/login` - Login & dapatkan access + refresh token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout & revoke refresh token

📖 [Dokumentasi lengkap](./README-AUTH.md) | [Refresh Token Guide](./README-REFRESH-TOKEN.md)

### ✅ Protected Endpoints (Requires JWT Token)

> **⚠️ Semua endpoint di bawah ini memerlukan JWT token di header:**  
> `Authorization: Bearer YOUR_TOKEN_HERE`

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
# Test Autentikasi (Login, Register, Token)
node tests/test-auth.js

# Test Refresh Token
node tests/test-refresh-token.js

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
- JWT (JSON Web Token) - Authentication
- bcrypt - Password hashing
- Axios (HTTP client & testing)
- Dotenv (environment variables)
- Watzap.id API (WhatsApp integration)

## 💡 Fitur Khusus

- **JWT Authentication**: Sistem login dengan token untuk keamanan
- **Refresh Token**: Access token short-lived (15 min) + refresh token (7 days) untuk UX dan security
- **Multi-Tenancy & Data Isolation**: Setiap UMKM hanya bisa akses data mereka sendiri
- **Protected Routes**: Hanya user yang login bisa akses data
- **Password Hashing**: Bcrypt untuk enkripsi password
- **Auto-filter by UMKM**: Semua data otomatis di-filter berdasarkan UMKM yang login
- **Auto-generate nomor transaksi**: Format TRX-YYYYMMDD-XXXX
- **Manajemen stok otomatis**: Berkurang saat beli, kembali saat delete
- **Database transaction**: Untuk data consistency
- **Pagination & filtering**: Semua endpoint list
- **WhatsApp broadcast**: Integrasi dengan Watzap.id
- **Personalisasi pesan**: Placeholder {nama}, {telepon}, {email}
- **Environment variables**: Keamanan kredensial dengan dotenv

## 📖 Dokumentasi Lengkap

### API Documentation
- [🔐 Autentikasi & Authorization](./README-AUTH.md) - **Login, Register, JWT Token**
- [🔄 Refresh Token Implementation](./README-REFRESH-TOKEN.md) - **Panduan lengkap refresh token**
- [🔒 Data Isolation per UMKM](./README-DATA-ISOLATION.md) - **Multi-tenancy & security** ← Baru!
- [API Pelanggan](./README-API-PELANGGAN.md)
- [API Transaksi](./README-API-TRANSAKSI.md)
- [API Broadcast WhatsApp](./README-API-BROADCAST.md)

### Setup Guides
- [🚀 Setup Broadcast WhatsApp](./SETUP-BROADCAST.md) - **Panduan lengkap setup Watzap.id**
- [🔧 Troubleshooting Watzap.id](./TROUBLESHOOTING-WATZAP.md) - **Solusi error "Instance Not Started"**
- [Backend Structure](./README-backend-structure.md)

### 🌐 Deployment Guides
- [🚂 Deploy ke Railway.app](./DEPLOY-RAILWAY.md) - **RECOMMENDED: Setup 5 menit, MySQL included**
- [☁️ Platform Options](./DEPLOY-OPTIONS.md) - Perbandingan Railway, Render, Heroku, AWS, dll

> ⚠️ **PENTING:** Aplikasi ini **TIDAK KOMPATIBEL** dengan Cloudflare Workers karena menggunakan Express.js + MySQL. Gunakan Railway.app atau platform PaaS lainnya.

### Testing Tools
- [Postman Collection - General](./docs/postman-collection.json)
- [Postman Collection - Broadcast](./docs/postman-collection-broadcast.json)

---

**Happy Coding! 🎉**
