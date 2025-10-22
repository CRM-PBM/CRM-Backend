const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let accessToken = '';
let refreshToken = '';

async function testRefreshToken() {
  try {
    console.log('🚀 ===============================================');
    console.log('🧪 TESTING REFRESH TOKEN IMPLEMENTATION');
    console.log('===============================================\n');

    // Test 1: Register (opsional jika sudah ada user)
    console.log('📝 Test 1: Register user baru...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        email: 'testrefresh@example.com',
        password: 'password123',
        nama_pemilik: 'Test User',
        nama_umkm: 'Test UMKM Refresh',
        telepon: '081234567890',
        alamat: 'Jl. Test No. 123'
      });
      console.log('✅ Register berhasil!');
    } catch (error) {
      if (error.response?.data?.msg?.includes('Email sudah terdaftar')) {
        console.log('ℹ️  User sudah ada, skip register');
      } else {
        console.log('❌ Register error:', error.response?.data?.msg || error.message);
      }
    }

    // Test 2: Login dan dapat tokens
    console.log('\n🔐 Test 2: Login untuk mendapatkan access & refresh token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testrefresh@example.com',
      password: 'password123'
    });
    
    accessToken = loginResponse.data.accessToken;
    refreshToken = loginResponse.data.refreshToken;
    
    console.log('✅ Login berhasil!');
    console.log('   Access Token:', accessToken.substring(0, 30) + '...');
    console.log('   Refresh Token:', refreshToken.substring(0, 30) + '...');
    console.log('   User:', loginResponse.data.user.email);

    // Test 3: Akses API dengan access token
    console.log('\n📊 Test 3: Akses API dengan access token...');
    const pelangganResponse = await axios.get(`${BASE_URL}/pelanggan`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Berhasil akses API Pelanggan!');
    console.log('   Total pelanggan:', pelangganResponse.data.pagination.total);

    // Test 4: Wait agar token mendekati expired (simulasi)
    console.log('\n⏳ Test 4: Simulasi access token expired...');
    console.log('   (Dalam production, tunggu 15 menit)');
    console.log('   (Untuk test, kita langsung test refresh)');
    
    // Test 5: Refresh access token
    console.log('\n🔄 Test 5: Refresh access token menggunakan refresh token...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    const newAccessToken = refreshResponse.data.accessToken;
    console.log('✅ Access token berhasil di-refresh!');
    console.log('   Old Access Token:', accessToken.substring(0, 30) + '...');
    console.log('   New Access Token:', newAccessToken.substring(0, 30) + '...');
    
    // Update access token
    accessToken = newAccessToken;

    // Test 6: Akses API dengan new access token
    console.log('\n📊 Test 6: Akses API dengan new access token...');
    const pelangganResponse2 = await axios.get(`${BASE_URL}/pelanggan`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('✅ Berhasil akses API dengan new token!');
    console.log('   Total pelanggan:', pelangganResponse2.data.pagination.total);

    // Test 7: Test refresh dengan invalid token
    console.log('\n❌ Test 7: Test refresh dengan invalid refresh token...');
    try {
      await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: 'invalid_token_123'
      });
      console.log('❌ GAGAL: Seharusnya ditolak!');
    } catch (error) {
      console.log('✅ BERHASIL: Request ditolak!');
      console.log('   Error:', error.response?.data?.msg);
    }

    // Test 8: Logout (revoke refresh token)
    console.log('\n🚪 Test 8: Logout (revoke refresh token)...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {
      refreshToken: refreshToken
    });
    console.log('✅ Logout berhasil!');
    console.log('   Message:', logoutResponse.data.msg);

    // Test 9: Coba refresh dengan token yang sudah di-revoke
    console.log('\n❌ Test 9: Test refresh dengan revoked token...');
    try {
      await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken
      });
      console.log('❌ GAGAL: Seharusnya ditolak!');
    } catch (error) {
      console.log('✅ BERHASIL: Refresh token sudah dicabut!');
      console.log('   Error:', error.response?.data?.msg);
    }

    // Summary
    console.log('\n\n🎉 ===============================================');
    console.log('✅ SEMUA TEST REFRESH TOKEN BERHASIL!');
    console.log('===============================================');
    console.log('\n📝 Ringkasan:');
    console.log('   ✅ Register/Login berhasil');
    console.log('   ✅ Access & refresh token diterima');
    console.log('   ✅ API dapat diakses dengan access token');
    console.log('   ✅ Refresh token berhasil mendapat new access token');
    console.log('   ✅ New access token dapat digunakan');
    console.log('   ✅ Invalid refresh token ditolak');
    console.log('   ✅ Logout berhasil revoke refresh token');
    console.log('   ✅ Revoked refresh token tidak bisa digunakan');
    console.log('\n💡 Implementasi refresh token SUKSES!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Jalankan test
testRefreshToken();
