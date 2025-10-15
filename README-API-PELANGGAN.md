# REST API Pelanggan - CRM Backend

REST API lengkap untuk manajemen data pelanggan dengan fitur CRUD (Create, Read, Update, Delete).

## 📋 Fitur

- ✅ Get semua pelanggan dengan pagination
- ✅ Get pelanggan berdasarkan ID
- ✅ Create pelanggan baru
- ✅ Update data pelanggan
- ✅ Delete pelanggan
- ✅ Filter berdasarkan UMKM, level, gender
- ✅ Search berdasarkan nama, email, telepon
- ✅ Validasi email unik
- ✅ Include data UMKM (relasi)

## 🚀 Quick Start

### 1. Jalankan Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

### 2. Test API
```bash
node tests/test-pelanggan-api.js
```

## 📚 API Endpoints

Base URL: `http://localhost:3000/api/pelanggan`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/pelanggan` | Get semua pelanggan |
| GET | `/api/pelanggan/:id` | Get pelanggan by ID |
| POST | `/api/pelanggan` | Create pelanggan baru |
| PUT | `/api/pelanggan/:id` | Update pelanggan |
| DELETE | `/api/pelanggan/:id` | Delete pelanggan |

## 📖 Detail Endpoint

### 1. Get All Pelanggan
```http
GET /api/pelanggan
```

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah per halaman (default: 10)
- `umkm_id` (optional): Filter by UMKM ID
- `level` (optional): Filter by level pelanggan
- `gender` (optional): Filter by gender (Pria/Wanita)
- `search` (optional): Pencarian nama/email/telepon

**Contoh Request:**
```bash
# Get semua pelanggan
curl http://localhost:3000/api/pelanggan

# Dengan pagination
curl "http://localhost:3000/api/pelanggan?page=1&limit=5"

# Dengan filter
curl "http://localhost:3000/api/pelanggan?gender=Pria&level=VIP"

# Dengan search
curl "http://localhost:3000/api/pelanggan?search=john"
```

**Response:**
```json
{
  "success": true,
  "message": "Data pelanggan berhasil diambil",
  "data": [
    {
      "pelanggan_id": 1,
      "nama": "John Doe",
      "telepon": "08123456789",
      "email": "john@example.com",
      "gender": "Pria",
      "level": "VIP",
      "umkm_id": 1,
      "created_at": "2025-10-10T00:00:00.000Z",
      "updated_at": "2025-10-10T00:00:00.000Z",
      "Umkm": {
        "umkm_id": 1,
        "nama_umkm": "Toko ABC"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 2. Get Pelanggan by ID
```http
GET /api/pelanggan/:id
```

**Contoh Request:**
```bash
curl http://localhost:3000/api/pelanggan/1
```

**Response:**
```json
{
  "success": true,
  "message": "Data pelanggan berhasil diambil",
  "data": {
    "pelanggan_id": 1,
    "nama": "John Doe",
    "telepon": "08123456789",
    "email": "john@example.com",
    "gender": "Pria",
    "level": "VIP",
    "umkm_id": 1,
    "Umkm": {
      "umkm_id": 1,
      "nama_umkm": "Toko ABC"
    }
  }
}
```

### 3. Create Pelanggan
```http
POST /api/pelanggan
```

**Request Body:**
```json
{
  "nama": "Jane Doe",          // Required
  "telepon": "08198765432",    // Optional
  "email": "jane@example.com", // Optional (unique)
  "gender": "Wanita",          // Optional (Pria/Wanita)
  "level": "Silver",           // Optional
  "umkm_id": 1                 // Optional
}
```

**Contoh Request:**
```bash
curl -X POST http://localhost:3000/api/pelanggan \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Jane Doe",
    "telepon": "08198765432",
    "email": "jane@example.com",
    "gender": "Wanita",
    "level": "Silver",
    "umkm_id": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Pelanggan berhasil ditambahkan",
  "data": {
    "pelanggan_id": 2,
    "nama": "Jane Doe",
    "telepon": "08198765432",
    "email": "jane@example.com",
    "gender": "Wanita",
    "level": "Silver",
    "umkm_id": 1
  }
}
```

### 4. Update Pelanggan
```http
PUT /api/pelanggan/:id
```

**Request Body:** (Semua field optional, hanya kirim yang ingin diupdate)
```json
{
  "nama": "Jane Doe Updated",
  "telepon": "08198765432",
  "email": "jane.updated@example.com",
  "gender": "Wanita",
  "level": "Gold",
  "umkm_id": 1
}
```

**Contoh Request:**
```bash
curl -X PUT http://localhost:3000/api/pelanggan/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Jane Doe Updated",
    "level": "Gold"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Pelanggan berhasil diupdate",
  "data": {
    "pelanggan_id": 1,
    "nama": "Jane Doe Updated",
    "level": "Gold",
    ...
  }
}
```

### 5. Delete Pelanggan
```http
DELETE /api/pelanggan/:id
```

**Contoh Request:**
```bash
curl -X DELETE http://localhost:3000/api/pelanggan/1
```

**Response:**
```json
{
  "success": true,
  "message": "Pelanggan berhasil dihapus"
}
```

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Nama pelanggan wajib diisi"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Pelanggan tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## 🧪 Testing dengan Postman

1. Import collection dari `docs/postman-collection.json` (jika tersedia)
2. Atau buat request manual sesuai dokumentasi di atas

## 🔧 Struktur File

```
src/
├── models/
│   └── Pelanggan.js         # Sequelize model
├── controllers/
│   └── pelangganController.js  # Request handlers
├── services/
│   └── pelangganService.js     # Business logic
└── routes/
    └── pelanggan.js           # Route definitions
```

## 📝 Validasi

- **nama**: Wajib diisi
- **email**: Harus unik (tidak boleh duplikat)
- **gender**: Enum (Pria/Wanita)

## 🔗 Relasi Database

Pelanggan belongsTo Umkm (many-to-one)
- Setiap pelanggan terkait dengan satu UMKM
- Field: `umkm_id` (foreign key)

## 💡 Tips

1. Gunakan pagination untuk data banyak
2. Manfaatkan fitur search untuk pencarian cepat
3. Filter berdasarkan level untuk segmentasi pelanggan
4. Email bersifat unik, pastikan tidak duplikat

## 🐛 Troubleshooting

**Server tidak bisa start:**
- Pastikan MySQL sudah running
- Cek konfigurasi database di `src/config/database.js`
- Jalankan `node src/sync.js` untuk sync database

**Error 404:**
- Pastikan ID pelanggan ada di database
- Cek endpoint URL sudah benar

**Error 400 "Email sudah terdaftar":**
- Gunakan email yang berbeda
- Atau update pelanggan dengan email yang sama

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
