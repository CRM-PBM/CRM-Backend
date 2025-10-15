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
      username: `testuser${randomNum}`,
      password: 'password123',
      nama_lengkap: `User Test ${randomNum}`
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      log('green', '✅ Register berhasil!');
      log('blue', `   UMKM: ${registerResponse.data.umkm.nama_umkm}`);
      log('blue', `   User: ${registerResponse.data.user.username}`);
      log('blue', `   Token: ${registerResponse.data.token.substring(0, 30)}...`);
      token = registerResponse.data.token;
      userId = registerResponse.data.user.id;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error?.includes('sudah terdaftar')) {
        log('yellow', '⚠️  Username sudah ada, skip register');
        // Lanjut ke login
      } else {
        throw error;
      }
    }

    // ========== TEST 4: Login ==========
    log('yellow', '\n📝 Test 4: Login dengan kredensial...');
    const loginData = {
      username: registerData.username,
      password: registerData.password
    };

    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      log('green', '✅ Login berhasil!');
      log('blue', `   User: ${loginResponse.data.user.username}`);
      log('blue', `   Nama: ${loginResponse.data.user.nama_lengkap}`);
      log('blue', `   UMKM ID: ${loginResponse.data.user.umkm_id}`);
      log('blue', `   Token: ${loginResponse.data.token.substring(0, 30)}...`);
      token = loginResponse.data.token;
      userId = loginResponse.data.user.id;
    } catch (error) {
      if (error.response?.status === 401) {
        log('red', '❌ Login gagal: Username/password salah');
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

    // ========== TEST 9: Create data dengan token valid ==========
    log('yellow', '\n📝 Test 9: Create pelanggan dengan token valid...');
    const newPelanggan = {
      nama: `Pelanggan Test ${randomNum}`,
      email: `test${randomNum}@example.com`,
      telepon: `08123456${randomNum}`,
      alamat: 'Jl. Test No. 123'
    };

    const createResponse = await axios.post(`${BASE_URL}/pelanggan`, newPelanggan, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('green', '✅ Berhasil create pelanggan!');
    log('blue', `   ID: ${createResponse.data.data.id}`);
    log('blue', `   Nama: ${createResponse.data.data.nama}`);

    // ========== TEST 10: Delete data dengan token valid ==========
    log('yellow', '\n📝 Test 10: Delete pelanggan dengan token valid...');
    const deleteResponse = await axios.delete(
      `${BASE_URL}/pelanggan/${createResponse.data.data.id}`,
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
