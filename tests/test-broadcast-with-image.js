/**
 * Test Script untuk Broadcast dengan Gambar
 * 
 * Cara menjalankan:
 * node tests/test-broadcast-with-image.js
 * 
 * Requirements:
 * - Server running di http://localhost:3000
 * - Valid JWT token di variable JWT_TOKEN
 */

const axios = require('axios');

// ===== CONFIG =====
const API_URL = 'http://localhost:3000/api/broadcast';

// Ganti dengan JWT token yang valid (dari login)
const JWT_TOKEN = process.env.JWT_TOKEN || 'your_jwt_token_here';

// Sample gambar URL (Gunakan URL yang accessible)
const SAMPLE_IMAGE_URLs = {
  promo: 'https://via.placeholder.com/1200x800/FF6B6B/FFFFFF?text=Promo+Spesial',
  banner: 'https://via.placeholder.com/1200x600/4ECDC4/FFFFFF?text=Flash+Sale',
  kupon: 'https://via.placeholder.com/600x600/95E1D3/FFFFFF?text=Kupon+Diskon'
};

// ===== HELPER FUNCTIONS =====

async function testCreateBroadcastWithoutImage() {
  console.log('\n📝 TEST 1: Create Broadcast TANPA Gambar');
  console.log('─'.repeat(50));

  try {
    const response = await axios.post(API_URL, {
      judul_pesan: 'Promo Teks Saja',
      isi_pesan: 'Halo {nama}, ini adalah test broadcast tanpa gambar. Dapatkan diskon 30% hari ini!',
      pelanggan_ids: [1, 2, 3]
    }, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! Broadcast ID:', response.data.data.broadcast_id);
    console.log('Status:', response.data.data.status);
    console.log('Image URL:', response.data.data.image_url || 'null');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testCreateBroadcastWithImage() {
  console.log('\n🎨 TEST 2: Create Broadcast DENGAN Gambar');
  console.log('─'.repeat(50));

  try {
    const response = await axios.post(API_URL, {
      judul_pesan: 'Promo Flash Sale - Dengan Gambar',
      isi_pesan: 'Halo {nama}, jangan lewatkan flash sale kami! Diskon hingga 70% untuk produk pilihan. Terbatas hanya 100 pembeli pertama! 🎉',
      image_url: SAMPLE_IMAGE_URLs.banner,
      pelanggan_ids: [1, 2, 3, 4, 5]
    }, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success! Broadcast ID:', response.data.data.broadcast_id);
    console.log('Status:', response.data.data.status);
    console.log('Image URL:', response.data.data.image_url);
    console.log('Total Penerima:', response.data.data.stats.total_penerima);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testInvalidImageUrl() {
  console.log('\n⚠️ TEST 3: Create Broadcast dengan INVALID Image URL');
  console.log('─'.repeat(50));

  try {
    const response = await axios.post(API_URL, {
      judul_pesan: 'Test Invalid Image',
      isi_pesan: 'Test message',
      image_url: 'invalid-url-without-extension', // Invalid URL
      pelanggan_ids: [1, 2, 3]
    }, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Created:', response.data.data.broadcast_id);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid URL');
      console.log('Error message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.response?.data?.message || error.message);
    }
  }
}

async function testGetBroadcast(broadcastId) {
  console.log(`\n📋 TEST 4: Get Broadcast Details (ID: ${broadcastId})`);
  console.log('─'.repeat(50));

  try {
    const response = await axios.get(`${API_URL}/${broadcastId}`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });

    const data = response.data.data;
    console.log('✅ Success!');
    console.log('Judul:', data.judul_pesan);
    console.log('Status:', data.status);
    console.log('Image URL:', data.image_url || 'null');
    console.log('Stats:', data.stats);
    return data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testSendBroadcast(broadcastId) {
  console.log(`\n🚀 TEST 5: Send Broadcast (ID: ${broadcastId})`);
  console.log('─'.repeat(50));

  try {
    const response = await axios.post(`${API_URL}/${broadcastId}/send`, {}, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });

    const data = response.data.data;
    console.log('✅ Success!');
    console.log('Status:', data.status);
    console.log('Results:');
    console.log(`  - Total: ${data.results.total}`);
    console.log(`  - Success: ${data.results.success}`);
    console.log(`  - Failed: ${data.results.failed}`);
    
    if (data.results.details.length > 0) {
      console.log('\nDetail:');
      data.results.details.forEach(detail => {
        console.log(`  - ${detail.nama} (${detail.telepon}): ${detail.status}`);
      });
    }
    return data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetStatistik() {
  console.log('\n📊 TEST 6: Get Statistik Broadcast');
  console.log('─'.repeat(50));

  try {
    const response = await axios.get(`${API_URL}/statistik`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });

    const data = response.data.data;
    console.log('✅ Success!');
    console.log('Total Broadcast:', data.total_broadcast);
    console.log('Total Penerima:', data.total_penerima);
    console.log('Terkirim:', data.terkirim);
    console.log('Gagal:', data.gagal);
    console.log('Success Rate:', data.success_rate + '%');
    return data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

// ===== MAIN TEST RUNNER =====

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║    TEST BROADCAST DENGAN GAMBAR - Watzap.id      ║');
  console.log('╚════════════════════════════════════════════════════╝');

  console.log('\n⚙️ Config:');
  console.log('API URL:', API_URL);
  console.log('JWT Token:', JWT_TOKEN ? '✅ Set' : '❌ Not set');

  if (!JWT_TOKEN || JWT_TOKEN === 'your_jwt_token_here') {
    console.error('\n❌ JWT_TOKEN tidak diset. Silakan:');
    console.error('1. Login dulu untuk mendapat JWT token');
    console.error('2. Set variable: JWT_TOKEN="your_token"');
    console.error('\nContoh:');
    console.error('JWT_TOKEN="eyJhbGc..." node tests/test-broadcast-with-image.js');
    process.exit(1);
  }

  // Run tests
  const broadcast1 = await testCreateBroadcastWithoutImage();
  const broadcast2 = await testCreateBroadcastWithImage();
  await testInvalidImageUrl();

  if (broadcast2) {
    await testGetBroadcast(broadcast2.broadcast_id);
    
    // Optional: Uncomment untuk test send
    // await testSendBroadcast(broadcast2.broadcast_id);
  }

  await testGetStatistik();

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║               TEST SELESAI                         ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n💡 Tips:');
  console.log('- Untuk test send broadcast, pastikan pelanggan ada di database');
  console.log('- Gunakan image URL yang accessible dari server');
  console.log('- Check logs di server untuk melihat detail error');
}

// Run
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
