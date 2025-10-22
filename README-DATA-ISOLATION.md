# 🔒 Data Isolation per UMKM

Panduan lengkap implementasi multi-tenancy dengan data isolation berdasarkan `umkm_id` dari JWT token.

---

## 📋 Overview

Setiap UMKM yang login **hanya bisa melihat dan mengelola data mereka sendiri**. Data UMKM lain tidak akan terlihat atau bisa diakses.

### Konsep Multi-Tenancy:

```
UMKM A (umkm_id = 1) Login
  ↓
Dapat JWT Token dengan payload: { umkmId: 1 }
  ↓
Akses API /pelanggan
  ↓
Sistem auto-filter: WHERE umkm_id = 1
  ↓
Hanya lihat pelanggan UMKM A saja ✅
```

---

## 🎯 Implementasi

### 1️⃣ **JWT Token Structure**

Saat login, JWT token berisi:

```javascript
{
  userId: 1,
  umkmId: 5,  // ← ID UMKM yang login
  role: "umkm"
}
```

### 2️⃣ **Auth Middleware Extract umkmId**

File: `src/middleware/authHandler.js`

```javascript
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ msg: 'Akses ditolak' });
  }

  try {
    const decoded = jwt.verify(tokenString, config.jwt.secret);
    
    req.userId = decoded.userId;   // Set user ID
    req.umkmId = decoded.umkmId;   // Set UMKM ID ← PENTING!
    req.role = decoded.role;
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token tidak valid' });
  }
};
```

### 3️⃣ **Controller Auto-Assign umkm_id**

#### **GET** - Filter data by umkm_id

```javascript
// Controller
async getAllPelanggan(req, res) {
  const filters = {
    umkm_id: req.umkmId,  // ← Auto dari JWT token
    page: req.query.page,
    limit: req.query.limit
  };

  const result = await pelangganService.getAllPelanggan(filters);
  res.json(result);
}
```

#### **POST** - Auto-assign umkm_id saat create

```javascript
// Controller
async createPelanggan(req, res) {
  const data = {
    ...req.body,
    umkm_id: req.umkmId  // ← Auto-assign dari JWT token
  };

  const pelanggan = await pelangganService.createPelanggan(data);
  res.status(201).json(pelanggan);
}
```

#### **PUT/DELETE** - Validasi ownership

```javascript
// Controller
async updatePelanggan(req, res) {
  const { id } = req.params;
  const umkm_id = req.umkmId;  // ← Dari JWT token

  // Service akan validasi apakah pelanggan ini milik UMKM yang login
  const pelanggan = await pelangganService.updatePelanggan(id, req.body, umkm_id);
  res.json(pelanggan);
}
```

### 4️⃣ **Service Filter by umkm_id**

```javascript
// Service
async getAllPelanggan(filters = {}) {
  const { umkm_id, page = 1, limit = 10 } = filters;

  const where = {};
  
  // PENTING: Filter berdasarkan umkm_id
  if (umkm_id) where.umkm_id = umkm_id;

  const { count, rows } = await Pelanggan.findAndCountAll({
    where,  // ← WHERE umkm_id = X
    limit: parseInt(limit),
    offset: (page - 1) * limit
  });

  return { data: rows, pagination: {...} };
}
```

```javascript
// Service - Get by ID dengan validasi ownership
async getPelangganById(id, umkm_id) {
  const where = { pelanggan_id: id };
  
  // PENTING: Validasi ownership
  if (umkm_id) where.umkm_id = umkm_id;

  const pelanggan = await Pelanggan.findOne({ where });

  if (!pelanggan) {
    throw new Error('Pelanggan tidak ditemukan'); // Atau tidak punya akses
  }

  return pelanggan;
}
```

---

## 🛡️ Security Benefits

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Data Visibility** | UMKM A bisa lihat data UMKM B | Hanya lihat data sendiri ✅ |
| **Create** | Bisa assign umkm_id apapun | Auto-assign dari token ✅ |
| **Update/Delete** | Bisa ubah data UMKM lain | Hanya bisa ubah data sendiri ✅ |
| **API Manipulation** | ?umkm_id=5 bisa akses data lain | Ignored, tetap filter by token ✅ |

---

## 📊 Affected Endpoints

### ✅ Pelanggan API

| Method | Endpoint | Isolation |
|--------|----------|-----------|
| GET | `/api/pelanggan` | ✅ Filter by umkm_id |
| GET | `/api/pelanggan/:id` | ✅ Validasi ownership |
| POST | `/api/pelanggan` | ✅ Auto-assign umkm_id |
| PUT | `/api/pelanggan/:id` | ✅ Validasi ownership |
| DELETE | `/api/pelanggan/:id` | ✅ Validasi ownership |

### ✅ Transaksi API

| Method | Endpoint | Isolation |
|--------|----------|-----------|
| GET | `/api/transaksi` | ✅ Filter by umkm_id |
| POST | `/api/transaksi` | ✅ Auto-assign umkm_id |
| GET | `/api/transaksi/statistik` | ✅ Filter by umkm_id |

### ✅ Produk API

| Method | Endpoint | Isolation |
|--------|----------|-----------|
| GET | `/api/produk` | ✅ Filter by umkm_id |
| POST | `/api/produk` | ✅ Auto-assign umkm_id |

### ✅ Broadcast API

| Method | Endpoint | Isolation |
|--------|----------|-----------|
| GET | `/api/broadcast` | ✅ Filter by umkm_id |
| POST | `/api/broadcast` | ✅ Auto-assign umkm_id |
| GET | `/api/broadcast/statistik` | ✅ Filter by umkm_id |

---

## 🧪 Testing Data Isolation

### Test Case 1: UMKM A Cannot See UMKM B's Data

```bash
# Login sebagai UMKM A
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "umkmA@example.com",
    "password": "password123"
  }'

# Response: token dengan umkmId = 1

# Get pelanggan dengan token UMKM A
curl http://localhost:3000/api/pelanggan \
  -H "Authorization: Bearer <token_umkm_a>"

# Result: Hanya pelanggan dengan umkm_id = 1 ✅
```

### Test Case 2: Cannot Manipulate umkm_id via Query

```bash
# Login sebagai UMKM A (umkm_id = 1)

# Coba akses data UMKM B dengan query parameter
curl "http://localhost:3000/api/pelanggan?umkm_id=2" \
  -H "Authorization: Bearer <token_umkm_a>"

# Result: Tetap hanya lihat data umkm_id = 1 ✅
# Query parameter ?umkm_id=2 di-ignore karena controller pakai req.umkmId
```

### Test Case 3: Cannot Create Data for Another UMKM

```bash
# Login sebagai UMKM A (umkm_id = 1)

# Coba buat pelanggan dengan umkm_id = 2
curl -X POST http://localhost:3000/api/pelanggan \
  -H "Authorization: Bearer <token_umkm_a>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Pelanggan Test",
    "umkm_id": 2
  }'

# Result: umkm_id di-override jadi 1 dari token ✅
# Data tetap milik UMKM A
```

### Test Case 4: Cannot Update Another UMKM's Data

```bash
# UMKM A coba update pelanggan milik UMKM B (id=999)

curl -X PUT http://localhost:3000/api/pelanggan/999 \
  -H "Authorization: Bearer <token_umkm_a>" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Updated Name"
  }'

# Result: 404 Pelanggan tidak ditemukan ✅
# Karena WHERE pelanggan_id = 999 AND umkm_id = 1 (not found)
```

---

## 🔐 Best Practices

### ✅ DO's:

1. **✅ Always use req.umkmId from token**
   - Jangan pakai req.query.umkm_id atau req.body.umkm_id
   - Token adalah single source of truth

2. **✅ Filter di level Service**
   - Validasi umkm_id di service layer
   - Double protection (controller + service)

3. **✅ Validasi Ownership untuk Update/Delete**
   - WHERE id = X AND umkm_id = Y
   - Prevent unauthorized access

4. **✅ Auto-assign umkm_id saat Create**
   - Override apapun value dari request body
   - Pastikan data selalu milik UMKM yang login

### ❌ DON'T's:

1. **❌ Jangan percaya client input**
   - req.body.umkm_id bisa dimanipulasi
   - Selalu pakai req.umkmId dari token

2. **❌ Jangan pakai query parameter untuk filter UMKM**
   - ?umkm_id=X bisa dimanipulasi
   - Gunakan token umkmId

3. **❌ Jangan skip validasi ownership**
   - Update/Delete harus validasi umkm_id
   - Cegah cross-UMKM data manipulation

---

## 📝 Code Example - Complete Flow

### Login & Get Token

```javascript
// POST /api/auth/login
const loginResponse = await axios.post('/api/auth/login', {
  email: 'umkm@example.com',
  password: 'password123'
});

const token = loginResponse.data.accessToken;
// Token contains: { userId: 1, umkmId: 5, role: 'umkm' }
```

### Get Filtered Data

```javascript
// GET /api/pelanggan
const pelangganResponse = await axios.get('/api/pelanggan', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Response hanya pelanggan dengan umkm_id = 5
console.log(pelangganResponse.data.data);
// [
//   { id: 1, nama: 'Pelanggan A', umkm_id: 5 },
//   { id: 2, nama: 'Pelanggan B', umkm_id: 5 }
// ]
```

### Create dengan Auto-Assign

```javascript
// POST /api/pelanggan
const createResponse = await axios.post('/api/pelanggan', {
  nama: 'Pelanggan Baru',
  telepon: '08123456789',
  // Tidak perlu kirim umkm_id, auto-assign dari token!
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// umkm_id otomatis = 5 (dari token)
console.log(createResponse.data.data.umkm_id); // 5
```

---

## 🎉 Summary

### Yang Berubah:

- ✅ **Pelanggan Controller** - Auto-filter & auto-assign umkm_id
- ✅ **Pelanggan Service** - Validasi ownership di semua operasi
- ✅ **Transaksi Controller** - Auto-filter & auto-assign umkm_id  
- ✅ **Transaksi Service** - Filter statistik by umkm_id
- ✅ **Produk Controller** - Auto-filter & auto-assign umkm_id
- ✅ **Produk Service** - Filter by umkm_id
- ✅ **Broadcast Controller** - Auto-filter & auto-assign umkm_id
- ✅ **Broadcast Service** - Filter statistik by umkm_id

### Benefits:

- 🔒 **Security**: Data terisolasi per UMKM
- 👤 **Privacy**: UMKM tidak bisa lihat data UMKM lain
- 🛡️ **Protection**: Tidak bisa manipulasi data UMKM lain
- ✅ **UX**: User tidak perlu isi umkm_id manual
- 🎯 **Clean**: Auto-assign from token, no manual input

---

**Sistem sekarang sudah aman dengan data isolation per UMKM!** 🎉
