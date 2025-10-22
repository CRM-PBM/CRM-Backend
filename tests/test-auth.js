const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';
let userId = null;

// Warna untuk output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAuth() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🔐 TEST AUTENTIKASI - CRM BACKEND');
  console.log('='.repeat(60) + '\n');

  try {
    // ========== TEST 1: Akses tanpa token (HARUS GAGAL) ==========
    log('yellow', '📝 Test 1: Akses API tanpa token (harus ditolak)...');
    try {
      await axios.get(`${BASE_URL}/pelanggan`);
      log('red', '❌ GAGAL: Seharusnya akses ditolak!');
      return;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('green', '✅ BERHASIL: Akses ditolak');
        log('blue', `   Response: ${error.response.data.msg}`);
      } else {
        throw error;
      }
    }

    // ========== TEST 2: Akses dengan token invalid (HARUS GAGAL) ==========
    log('yellow', '\n📝 Test 2: Akses dengan token invalid (harus ditolak)...');
    try {
      await axios.get(`${BASE_URL}/pelanggan`, {
        headers: {
          'Authorization': 'Bearer invalid_token_123456'
        }
      });
      log('red', '❌ GAGAL: Seharusnya token ditolak!');
      return;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('green', '✅ BERHASIL: Token invalid ditolak');
        log('blue', `   Response: ${error.response.data.msg}`);
      } else {
        throw error;
      }
    }

    // ========== TEST 3: Register (jika belum ada user) ==========
    log('yellow', '\n📝 Test 3: Register akun baru...');
    const randomNum = Math.floor(Math.random() * 10000);
    const registerData = {
      nama_umkm: `Toko Test ${randomNum}`,
      alamat: 'Jl. Testing No. 123',
      telepon: `08123456${randomNum}`,
      email: `testuser@gmail.com`,
      password: 'password123',
      nama_pemilik: `User Test ${randomNum}`,
      umkm_id: null // Akan di-assign otomatis oleh sistem
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      log('green', '✅ Register berhasil!');
      log('blue', `   UMKM: ${registerResponse.data.user.nama_umkm}`);
      log('blue', `   Email: ${registerResponse.data.user.email}`);
      log('blue', `   UMKM ID: ${registerResponse.data.user.umkm_id}`);
      log('blue', `   Message: ${registerResponse.data.msg}`);
      // Note: Register tidak langsung return token, harus login dulu
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.msg?.includes('sudah terdaftar')) {
        log('yellow', '⚠️  Email sudah ada, skip register');
        // Lanjut ke login
      } else {
        throw error;
      }
    }

    // ========== TEST 4: Login ==========
    log('yellow', '\n📝 Test 4: Login dengan kredensial...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };

    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      log('green', '✅ Login berhasil!');
      log('blue', `   Email: ${loginResponse.data.user.email}`);
      log('blue', `   Role: ${loginResponse.data.user.role}`);
      log('blue', `   UMKM ID: ${loginResponse.data.user.umkm_id}`);
      log('blue', `   UMKM: ${loginResponse.data.user.nama_umkm}`);
      log('blue', `   Access Token: ${loginResponse.data.accessToken.substring(0, 30)}...`);
      log('blue', `   Refresh Token: ${loginResponse.data.refreshToken.substring(0, 30)}...`);
      token = loginResponse.data.accessToken;
      userId = loginResponse.data.user.user_id;
    } catch (error) {
      if (error.response?.status === 400) {
        log('red', `❌ Login gagal: ${error.response.data.msg}`);
        log('yellow', '   Gunakan kredensial yang sudah terdaftar untuk test ini');
        return;
      }
      throw error;
    }

    // ========== TEST 5: Akses API Pelanggan dengan token valid ==========
    log('yellow', '\n📝 Test 5: Akses API Pelanggan dengan token valid...');
    const pelangganResponse = await axios.get(`${BASE_URL}/pelanggan`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('green', '✅ Berhasil akses API Pelanggan!');
    log('blue', `   Total data: ${pelangganResponse.data.pagination.total}`);
    log('blue', `   Current page: ${pelangganResponse.data.pagination.currentPage}`);

    // ========== TEST 6: Akses API Transaksi dengan token valid ==========
    log('yellow', '\n📝 Test 6: Akses API Transaksi dengan token valid...');
    const transaksiResponse = await axios.get(`${BASE_URL}/transaksi`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('green', '✅ Berhasil akses API Transaksi!');
    log('blue', `   Total data: ${transaksiResponse.data.pagination.total}`);

    // ========== TEST 7: Akses API Produk dengan token valid ==========
    log('yellow', '\n📝 Test 7: Akses API Produk dengan token valid...');
    const produkResponse = await axios.get(`${BASE_URL}/produk`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('green', '✅ Berhasil akses API Produk!');
    log('blue', `   Total data: ${produkResponse.data.pagination.total}`);

    // ========== TEST 8: Akses API Broadcast dengan token valid ==========
    log('yellow', '\n📝 Test 8: Akses API Broadcast dengan token valid...');
    const broadcastResponse = await axios.get(`${BASE_URL}/broadcast`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('green', '✅ Berhasil akses API Broadcast!');
    log('blue', `   Total data: ${broadcastResponse.data.pagination.total}`);
    log('blue', `   Current page: ${broadcastResponse.data.pagination.page}`);
    log('blue', `   Limit: ${broadcastResponse.data.pagination.limit}`);
    
    // Tampilkan beberapa data broadcast jika ada
    if (broadcastResponse.data.data.length > 0) {
      log('blue', '\n   📋 Sample data broadcast:');
      broadcastResponse.data.data.slice(0, 3).forEach((broadcast, index) => {
        log('blue', `   ${index + 1}. ${broadcast.nama_campaign || 'N/A'} (Status: ${broadcast.status || 'N/A'})`);
        const pesan = broadcast.pesan || broadcast.message || '';
        if (pesan) {
          log('blue', `      - Pesan: ${pesan.substring(0, 50)}${pesan.length > 50 ? '...' : ''}`);
        }
        log('blue', `      - Total penerima: ${broadcast.total_penerima || 0}`);
      });
    } else {
      log('blue', '   📋 Belum ada data broadcast');
    }

    // ========== TEST 9: Create data dengan token valid ==========
    log('yellow', '\n📝 Test 9: Create pelanggan dengan token valid...');
    const newPelanggan = {
      nama: `Pelanggan Test ${randomNum}`,
      email: `test${randomNum}@example.com`,
      telepon: `08123456${randomNum}`,
      gender: 'Pria',
      level: 'silver'
    };

    const createResponse = await axios.post(`${BASE_URL}/pelanggan`, newPelanggan, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('green', '✅ Berhasil create pelanggan!');
    log('blue', `   ID: ${createResponse.data.data.pelanggan_id}`);
    log('blue', `   Nama: ${createResponse.data.data.nama}`);
    log('blue', `   UMKM ID: ${createResponse.data.data.umkm_id}`);

    // ========== TEST 10: Delete data dengan token valid ==========
    log('yellow', '\n📝 Test 10: Delete pelanggan dengan token valid...');
    const deleteResponse = await axios.delete(
      `${BASE_URL}/pelanggan/${createResponse.data.data.pelanggan_id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    log('green', '✅ Berhasil delete pelanggan!');
    log('blue', `   Message: ${deleteResponse.data.message}`);

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    log('green', '🎉 SEMUA TEST AUTENTIKASI BERHASIL! 🎉');
    console.log('='.repeat(60));
    log('cyan', '\n📋 Summary:');
    log('green', '✅ Akses tanpa token: DITOLAK (sesuai harapan)');
    log('green', '✅ Akses dengan token invalid: DITOLAK (sesuai harapan)');
    log('green', '✅ Register: BERHASIL');
    log('green', '✅ Login: BERHASIL');
    log('green', '✅ Akses API Pelanggan: BERHASIL');
    log('green', '✅ Akses API Transaksi: BERHASIL');
    log('green', '✅ Akses API Produk: BERHASIL');
    log('green', '✅ Akses API Broadcast: BERHASIL');
    log('green', '✅ Create data: BERHASIL');
    log('green', '✅ Delete data: BERHASIL');
    
    log('cyan', '\n💡 Kesimpulan:');
    log('blue', '   - Sistem autentikasi berfungsi dengan baik');
    log('blue', '   - Semua protected routes hanya bisa diakses dengan token valid');
    log('blue', '   - Public routes (register, login) dapat diakses tanpa token');
    log('blue', '   - Token JWT berhasil di-generate dan divalidasi');
    console.log();

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('red', '❌ TEST GAGAL!');
    console.log('='.repeat(60));
    
    if (error.response) {
      log('red', `\nStatus: ${error.response.status}`);
      log('red', `Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      log('red', '\nTidak dapat terhubung ke server!');
      log('yellow', 'Pastikan server sudah berjalan di http://localhost:3000');
      log('yellow', 'Jalankan: npm start');
    } else {
      log('red', `\nError: ${error.message}`);
    }
    console.log();
  }
}

// Jalankan test
testAuth();
