const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCreateProduk() {
  try {
    console.log('=== TEST CREATE PRODUK ===\n');

    // 1. Login dulu untuk dapat token
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testuser@gmail.com',
      password: 'password123'
    });

    const { accessToken, user } = loginRes.data;
    console.log(`✅ Login berhasil`);
    console.log(`   Email: ${user.email}`);
    console.log(`   UMKM ID: ${user.umkm_id}`);
    console.log(`   Token: ${accessToken.substring(0, 50)}...`);

    // 2. Create produk baru (TIDAK perlu kirim umkm_id)
    console.log('\n2. Create produk baru...');
    const createRes = await axios.post(
      `${BASE_URL}/produk`,
      {
        nama_produk: 'Teh Manis',
        harga: 3000,
        stok: 100
        // TIDAK ada umkm_id - auto-assign dari token!
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Produk berhasil dibuat!');
    console.log('   Data:', JSON.stringify(createRes.data.data, null, 2));

    // 3. Get semua produk (harus hanya produk UMKM yang login)
    console.log('\n3. Get semua produk...');
    const listRes = await axios.get(`${BASE_URL}/produk`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log(`✅ Total produk: ${listRes.data.data.length}`);
    console.log('   Produk:');
    listRes.data.data.forEach(p => {
      console.log(`   - ${p.nama_produk} (ID: ${p.produk_id}, UMKM: ${p.umkm_id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCreateProduk();
