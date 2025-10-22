# 🔄 Refresh Token Implementation Guide

Panduan lengkap implementasi dan penggunaan Refresh Token untuk CRM Backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Cara Kerja](#cara-kerja)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Frontend Implementation](#frontend-implementation)
- [Testing](#testing)
- [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

### Apa itu Refresh Token?

**Refresh Token** adalah mekanisme keamanan yang memungkinkan user tetap login tanpa harus memasukkan credentials berulang kali.

### Kenapa Pakai Refresh Token?

| Aspek | Tanpa Refresh Token | Dengan Refresh Token |
|-------|---------------------|----------------------|
| **Keamanan** | Token panjang (24 jam+) = Risiko tinggi | Access token pendek (15 menit) = Risiko rendah |
| **User Experience** | Logout otomatis setelah 24 jam | Tetap login hingga 7 hari |
| **Token Theft** | Attacker dapat pakai token lama | Token cepat expired, attacker hanya punya waktu 15 menit |
| **Revokasi** | Sulit revoke token | Bisa revoke refresh token kapan saja |

### Konsep Dual Token:

```
Access Token (Short-lived)
├─ Durasi: 15 menit
├─ Untuk: Akses API
└─ Disimpan: Memory/State

Refresh Token (Long-lived)  
├─ Durasi: 7 hari
├─ Untuk: Generate new access token
├─ Disimpan: Database + httpOnly Cookie
└─ Dapat di-revoke
```

---

## ⚙️ Cara Kerja

### Flow Diagram:

```
┌──────────┐
│  Login   │
└─────┬────┘
      │
      ▼
┌──────────────────────────┐
│ Generate 2 Tokens:       │
│ 1. Access Token (15 min) │
│ 2. Refresh Token (7 days)│
└─────┬────────────────────┘
      │
      ▼
┌──────────────────────────┐
│ Save Refresh Token to DB │
└─────┬────────────────────┘
      │
      ▼
┌──────────────────────────┐
│ Return Both Tokens       │
└─────┬────────────────────┘
      │
      ▼
┌──────────────────────────┐
│ Client Saves:            │
│ - Access Token (memory)  │
│ - Refresh Token (cookie) │
└─────┬────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│          Normal API Request         │
│  Header: Bearer <access_token>      │
└─────────────────┬───────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Token Valid?    │
        └─────┬───────────┘
              │
     ┌────────┴────────┐
     │                 │
   YES               NO (Expired)
     │                 │
     ▼                 ▼
┌─────────┐    ┌──────────────────┐
│ Success │    │ Return 401       │
└─────────┘    │ CODE:            │
               │ TOKEN_EXPIRED    │
               └─────┬────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ Frontend Detect      │
          │ TOKEN_EXPIRED        │
          └─────┬────────────────┘
                │
                ▼
     ┌───────────────────────────┐
     │ POST /auth/refresh        │
     │ Body: { refreshToken }    │
     └─────┬─────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Verify Refresh Token │
    └─────┬────────────────┘
          │
          ▼
   ┌──────────────────────┐
   │ Generate New         │
   │ Access Token         │
   └─────┬────────────────┘
         │
         ▼
  ┌───────────────────┐
  │ Return New Token  │
  └─────┬─────────────┘
        │
        ▼
  ┌────────────────────┐
  │ Retry API Request  │
  │ with New Token     │
  └────────────────────┘
```

---

## 🚀 Setup

### 1. Environment Variables

Tambahkan di `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=15m

# Refresh Token Configuration
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-minimum-32-characters
REFRESH_TOKEN_EXPIRES_IN=7d
```

**Generate Secret Keys:**

```bash
# Option 1: OpenSSL (Linux/Mac)
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. Database Sync

Jalankan sync untuk membuat tabel `refresh_tokens`:

```bash
node src/sync.js
```

Tabel yang dibuat:

```sql
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES USER(user_id)
);
```

### 3. Start Server

```bash
npm start
```

---

## 📡 API Endpoints

### 1. POST `/api/auth/register`

Registrasi user baru.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nama_pemilik": "John Doe",
  "nama_umkm": "Toko Berkah",
  "telepon": "081234567890",
  "alamat": "Jl. Merdeka No. 123"
}
```

**Response:**
```json
{
  "msg": "Registrasi berhasil, Silahkan Login",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "umkm_id": 1,
    "nama_umkm": "Toko Berkah"
  }
}
```

---

### 2. POST `/api/auth/login`

Login dan mendapat access & refresh token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "msg": "Login berhasil.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "umkm",
    "umkm_id": 1,
    "nama_umkm": "Toko Berkah"
  }
}
```

**⚠️ PENTING:**
- `accessToken`: Simpan di memory/state (expired 15 menit)
- `refreshToken`: Simpan di httpOnly cookie atau localStorage (expired 7 hari)

---

### 3. POST `/api/auth/refresh`

Refresh access token menggunakan refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "msg": "Access token berhasil di-refresh.",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "umkm",
    "umkm_id": 1,
    "nama_umkm": "Toko Berkah"
  }
}
```

**Error Responses:**

| Error | Message | Action |
|-------|---------|--------|
| No Token | "Refresh token tidak ditemukan." | Login ulang |
| Invalid | "Refresh token tidak valid atau expired." | Login ulang |
| Revoked | "Refresh token tidak ditemukan atau sudah dicabut." | Login ulang |
| Expired | "Refresh token sudah expired." | Login ulang |

---

### 4. POST `/api/auth/logout`

Logout dan revoke refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "msg": "Logout berhasil. Refresh token telah dicabut."
}
```

---

## 💻 Frontend Implementation

### React Example

```javascript
// utils/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Request interceptor - Attach access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and hasn't retried yet
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Request new access token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        // Save new access token
        localStorage.setItem('accessToken', response.data.accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token invalid/expired - Logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// services/authService.js
import api from '../utils/api';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const login = async (email, password) => {
  // Don't use intercepted api for login
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password
  });

  // Save tokens
  localStorage.setItem('accessToken', response.data.accessToken);
  localStorage.setItem('refreshToken', response.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    await axios.post(`${API_URL}/auth/logout`, {
      refreshToken
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear tokens regardless of API call result
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
```

```javascript
// components/Login.jsx
import React, { useState } from 'react';
import { login } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.msg || 'Login gagal');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
```

```javascript
// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { logout } from '../services/authService';

function Dashboard() {
  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPelanggan();
  }, []);

  const fetchPelanggan = async () => {
    try {
      const response = await api.get('/pelanggan');
      setPelanggan(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <ul>
        {pelanggan.map(p => (
          <li key={p.id}>{p.nama}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
```

---

### Vue.js Example

```javascript
// plugins/axios.js
import axios from 'axios';
import router from '../router';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 🧪 Testing

### Manual Test dengan cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "accessToken": "xxx...",
#   "refreshToken": "yyy..."
# }

# 2. Akses API dengan access token
curl http://localhost:3000/api/pelanggan \
  -H "Authorization: Bearer <access_token>"

# 3. Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

### Automated Test Script

```bash
node tests/test-refresh-token.js
```

---

## 🔐 Security Best Practices

### ✅ DO's:

1. **✅ Store Tokens Properly**
   - Access Token: Memory/React State (never localStorage for production)
   - Refresh Token: httpOnly Cookie (best) or localStorage

2. **✅ Use HTTPS in Production**
   - Tokens harus di-encrypt saat transit
   - Set secure flag di cookies

3. **✅ Set Proper Expiration**
   - Access Token: 5-15 menit
   - Refresh Token: 1-7 hari

4. **✅ Implement Token Rotation**
   - Generate new refresh token setiap refresh
   - Revoke old refresh token

5. **✅ Revoke Tokens on Logout**
   - Set `is_revoked = true` di database
   - Clear client-side storage

6. **✅ Use Strong Secrets**
   - Minimum 32 characters
   - Random, tidak ada pattern

### ❌ DON'T's:

1. **❌ Jangan Simpan Access Token di localStorage** (Production)
   - Vulnerable to XSS attacks
   - Gunakan memory/state

2. **❌ Jangan Set Expiration Terlalu Lama**
   - Access Token: Max 15 menit
   - Refresh Token: Max 7 hari

3. **❌ Jangan Expose Refresh Token di URL**
   - Selalu di body atau cookie
   - Never in query params

4. **❌ Jangan Commit Secrets ke Git**
   - Use environment variables
   - Add `.env` to `.gitignore`

---

## 📊 Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                      TOKEN LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

Login
  │
  ├─ Access Token (15 min) ───────┐
  └─ Refresh Token (7 days) ──────┼───> Saved to DB
                                  │
                            ┌─────▼─────┐
                            │  Active   │
                            └─────┬─────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │                           │
              After 15 min                 After 7 days
                    │                           │
                    ▼                           ▼
            ┌───────────────┐           ┌──────────────┐
            │ Access Token  │           │ Refresh Token│
            │   EXPIRED     │           │   EXPIRED    │
            └───────┬───────┘           └──────────────┘
                    │                           │
                    ▼                           │
           ┌────────────────┐                   │
           │  Call Refresh  │                   │
           │   Endpoint     │                   │
           └────────┬───────┘                   │
                    │                           │
                    ▼                           │
         ┌─────────────────────┐                │
         │ Verify Refresh Token│                │
         └─────────┬───────────┘                │
                   │                            │
        ┌──────────┴──────────┐                 │
        │                     │                 │
     Valid                 Invalid              │
        │                     │                 │
        ▼                     ▼                 │
┌──────────────┐      ┌──────────────┐          │
│ New Access   │      │ Force Logout │◄─────────┘
│    Token     │      │ (Login Again)│
└──────────────┘      └──────────────┘
```

---

## 🎉 Summary

✅ **Implementasi Refresh Token Berhasil!**

### Yang Telah Dibuat:

1. ✅ Model `RefreshToken` untuk menyimpan refresh tokens
2. ✅ Service untuk generate, verify, dan revoke tokens
3. ✅ Controller untuk handle refresh & logout
4. ✅ Routes untuk refresh token endpoints
5. ✅ Middleware untuk detect expired access token
6. ✅ Environment config untuk JWT settings
7. ✅ Test script untuk validasi implementasi
8. ✅ Frontend examples (React & Vue.js)

### Keuntungan:

- 🔒 **Security**: Access token pendek, risiko rendah
- 😊 **UX**: User tetap login tanpa gangguan
- 🚀 **Performance**: Validasi token di memory (cepat)
- 🎯 **Control**: Bisa revoke refresh token kapan saja

---

**Happy Coding! 🎉**
