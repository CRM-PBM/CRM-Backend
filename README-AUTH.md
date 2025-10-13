# 🔐 Autentikasi & Authorization

Panduan lengkap sistem autentikasi menggunakan JWT (JSON Web Token) untuk CRM Backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Cara Kerja](#cara-kerja)
- [Endpoints](#endpoints)
- [Protected Routes](#protected-routes)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Sistem autentikasi menggunakan:
- **JWT (JSON Web Token)** untuk session management
- **bcrypt** untuk hashing password
- **Middleware auth** untuk proteksi routes

### Flow Autentikasi:

```
1. User Register → Buat akun UMKM + User
2. User Login → Dapat JWT Token
3. Simpan Token → Di localStorage/cookies
4. Akses API → Kirim token di header
5. Server Validasi → Cek token valid
6. Akses Granted → Bisa akses data
```

---

## ⚙️ Cara Kerja

### 1. Register (Daftar Akun Baru)

**POST** `/api/auth/register`

```json
{
  "nama_umkm": "Toko Berkah",
  "email": "admin@gmail.com",
  "alamat": "Jl. Merdeka No. 123",
  "telepon": "081234567890",
  "username": "admin",
  "password": "password123",
  "nama_lengkap": "John Doe"
}
```

**Response:**
```json
{
  "message": "Registrasi berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "nama_lengkap": "John Doe",
    "umkm_id": 1
  },
  "umkm": {
    "id": 1,
    "nama_umkm": "Toko Berkah"
  }
}
```

### 2. Login (Masuk ke Sistem)

**POST** `/api/auth/login`

```json
{
  "email": "admin@gmail.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "nama_lengkap": "John Doe",
    "umkm_id": 1
  }
}
```

### 3. Menggunakan Token

Setiap request ke protected endpoint harus menyertakan token di header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Contoh dengan curl:**
```bash
curl -X GET http://localhost:3000/api/pelanggan \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Contoh dengan Axios:**
```javascript
const axios = require('axios');

const token = 'YOUR_TOKEN_HERE';

axios.get('http://localhost:3000/api/pelanggan', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.log(error.response.data);
});
```

**Contoh dengan Postman:**
1. Pilih tab **Authorization**
2. Type: **Bearer Token**
3. Token: Paste token Anda
4. Atau manual di **Headers**:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

---

## 🔒 Protected Routes

Semua endpoint berikut **HARUS menggunakan token** untuk akses:

### ✅ API Pelanggan
- `GET /api/pelanggan` - List pelanggan
- `GET /api/pelanggan/:id` - Detail pelanggan
- `POST /api/pelanggan` - Tambah pelanggan
- `PUT /api/pelanggan/:id` - Update pelanggan
- `DELETE /api/pelanggan/:id` - Hapus pelanggan

### ✅ API Transaksi
- `GET /api/transaksi` - List transaksi
- `GET /api/transaksi/:id` - Detail transaksi
- `POST /api/transaksi` - Buat transaksi
- `DELETE /api/transaksi/:id` - Hapus transaksi
- `GET /api/transaksi/statistik` - Statistik

### ✅ API Produk
- `GET /api/produk` - List produk
- `GET /api/produk/:id` - Detail produk
- `POST /api/produk` - Tambah produk
- `PUT /api/produk/:id` - Update produk
- `DELETE /api/produk/:id` - Hapus produk

### ✅ API Broadcast
- `GET /api/broadcast` - List broadcast
- `GET /api/broadcast/:id` - Detail broadcast
- `POST /api/broadcast` - Buat broadcast
- `POST /api/broadcast/:id/send` - Kirim broadcast
- `DELETE /api/broadcast/:id` - Hapus broadcast
- `GET /api/broadcast/statistik` - Statistik
- `GET /api/broadcast/device/status` - Status device

### 🌍 Public Routes (Tidak Perlu Token)
- `POST /api/auth/register` - Registrasi
- `POST /api/auth/login` - Login
- `GET /api/health` - Health check

---

## 🧪 Testing

### Test 1: Tanpa Token (Harus Gagal)

```bash
curl -X GET http://localhost:3000/api/pelanggan
```

**Expected Response:**
```json
{
  "msg": "Akses ditolak. Tidak ada token."
}
```

### Test 2: Dengan Token Invalid (Harus Gagal)

```bash
curl -X GET http://localhost:3000/api/pelanggan \
  -H "Authorization: Bearer invalid_token_123"
```

**Expected Response:**
```json
{
  "msg": "Token tidak valid/expired."
}
```

### Test 3: Dengan Token Valid (Harus Berhasil)

```bash
# 1. Login dulu
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'

# 2. Copy token dari response
# 3. Gunakan token untuk akses API
curl -X GET http://localhost:3000/api/pelanggan \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### Test Script Otomatis

Buat file `test-auth.js`:

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';

async function test() {
  try {
    console.log('📝 Test 1: Akses tanpa token (harus gagal)...');
    try {
      await axios.get(`${BASE_URL}/pelanggan`);
      console.log('❌ GAGAL: Seharusnya ditolak!');
    } catch (error) {
      console.log('✅ BERHASIL: Akses ditolak -', error.response.data.msg);
    }

    console.log('\n🔐 Test 2: Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'password123'
    });
    token = loginResponse.data.token;
    console.log('✅ Login berhasil!');
    console.log('Token:', token.substring(0, 20) + '...');

    console.log('\n📋 Test 3: Akses dengan token (harus berhasil)...');
    const pelangganResponse = await axios.get(`${BASE_URL}/pelanggan`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Berhasil akses API Pelanggan!');
    console.log('Total data:', pelangganResponse.data.pagination.total);

    console.log('\n🎉 Semua test PASSED!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
```

Run test:
```bash
node test-auth.js
```

---

## 🔧 Environment Variables

Pastikan `.env` sudah diset:

```env
# JWT Secret (GANTI dengan random string yang kuat!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration (opsional, default: 24h)
JWT_EXPIRES_IN=24h
```

**⚠️ PENTING:**
- `JWT_SECRET` harus **random** dan **panjang** (min. 32 karakter)
- Jangan share secret di public repository
- Ganti di production dengan nilai yang berbeda

**Generate random JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📱 Implementasi di Frontend

### React Example

```javascript
import axios from 'axios';

// Setup axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Interceptor untuk auto-attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login function
async function login(username, password) {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    
    // Simpan token
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Fetch data dengan auto token
async function getPelanggan() {
  try {
    const response = await api.get('/pelanggan');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalid/expired, redirect ke login
      logout();
      window.location.href = '/login';
    }
    throw error;
  }
}
```

### Vue.js Example

```javascript
// plugins/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Usage in component
import api from '@/plugins/axios';

export default {
  data() {
    return {
      pelanggan: []
    }
  },
  async mounted() {
    try {
      const response = await api.get('/pelanggan');
      this.pelanggan = response.data.data;
    } catch (error) {
      console.error(error);
    }
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "Akses ditolak. Tidak ada token."

**Solusi:**
- Pastikan Anda sudah login
- Pastikan header `Authorization` terisi
- Format harus: `Bearer YOUR_TOKEN`
- Cek typo di header name (harus `Authorization`)

### Problem: "Token tidak valid/expired."

**Solusi:**
- Token sudah expired (default 24 jam)
- Login ulang untuk dapat token baru
- Cek `JWT_SECRET` di `.env` sama dengan saat generate token

### Problem: Token hilang setelah refresh

**Solusi:**
- Simpan token di `localStorage` atau `cookies`
- Jangan simpan di variable biasa (akan hilang saat refresh)

### Problem: CORS Error di browser

**Solusi:**
Pastikan CORS sudah diaktifkan di `src/app.js`:

```javascript
const cors = require('cors');
app.use(cors());
```

### Problem: "Cannot read property 'umkmId' of undefined"

**Solusi:**
- Token valid tapi struktur payload berbeda
- Cek apakah token di-generate dengan benar
- Login ulang untuk dapat token yang benar

---

## 🔐 Security Best Practices

### ✅ DO's:
- ✅ Gunakan HTTPS di production
- ✅ Set `JWT_SECRET` yang kuat dan random
- ✅ Set expiration time yang wajar (1-24 jam)
- ✅ Validate token di setiap protected route
- ✅ Hash password dengan bcrypt
- ✅ Simpan token di `httpOnly` cookies (lebih aman dari localStorage)
- ✅ Implement refresh token untuk UX lebih baik

### ❌ DON'T's:
- ❌ Jangan simpan password plain text
- ❌ Jangan share `JWT_SECRET` di public
- ❌ Jangan set expiration terlalu lama (>7 hari)
- ❌ Jangan kirim token via URL query parameter
- ❌ Jangan commit `.env` ke Git

---

## 📚 Referensi

- [JWT.io](https://jwt.io/) - JWT documentation
- [Express.js](https://expressjs.com/) - Web framework
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JWT library

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    {username, password}
       ▼
┌─────────────────────────┐
│   authController.js     │
│  - Validate credentials │
│  - Generate JWT Token   │
└──────────┬──────────────┘
           │
           │ 2. Return token
           ▼
    ┌──────────────┐
    │   Client     │
    │ Save token   │
    └──────┬───────┘
           │
           │ 3. GET /api/pelanggan
           │    Header: Authorization: Bearer TOKEN
           ▼
    ┌─────────────────────┐
    │  authHandler.js     │
    │  - Verify token     │
    │  - Extract userId   │
    │  - Extract umkmId   │
    └─────────┬───────────┘
              │
              │ 4. Token valid
              ▼
       ┌──────────────────┐
       │   Controller     │
       │  (pelanggan,     │
       │   transaksi,     │
       │   produk, etc)   │
       └─────────┬────────┘
                 │
                 │ 5. Access req.userId
                 │        req.umkmId
                 ▼
          ┌─────────────┐
          │   Service   │
          │  Query DB   │
          └──────┬──────┘
                 │
                 │ 6. Return data
                 ▼
            ┌─────────┐
            │  Client │
            └─────────┘
```

---

## ✅ Checklist Setup

- [ ] Install dependencies (`npm install jsonwebtoken bcrypt`)
- [ ] Set `JWT_SECRET` di `.env`
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test akses tanpa token (harus ditolak)
- [ ] Test akses dengan token valid (harus berhasil)
- [ ] Test token expired
- [ ] Implementasi di frontend
- [ ] Setup refresh token (opsional)
- [ ] Deploy dengan HTTPS

---

**🎉 Sistem autentikasi sudah siap digunakan!**

Semua endpoint protected dan hanya bisa diakses setelah login. Data masing-masing UMKM terisolasi berdasarkan `umkmId`.
