const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCreateBroadcast() {
  try {
    console.log('=== TEST CREATE BROADCAST WITH UMKM_ID ===\n');

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

    // 2. Get pelanggan dari UMKM yang login
    console.log('\n2. Get pelanggan...');
    const pelangganRes = await axios.get(`${BASE_URL}/pelanggan`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (pelangganRes.data.data.length === 0) {
      console.log('❌ Tidak ada pelanggan, create pelanggan dulu');
      return;
    }

    const pelangganIds = pelangganRes.data.data.slice(0, 2).map(p => p.pelanggan_id);
    console.log(`✅ Pelanggan IDs: ${pelangganIds.join(', ')}`);

    // 3. Create broadcast baru (TIDAK perlu kirim umkm_id)
    console.log('\n3. Create broadcast baru...');
    const createRes = await axios.post(
      `${BASE_URL}/broadcast`,
      {
        judul_pesan: 'Promo Test Auto UMKM',
        isi_pesan: 'Halo {nama}, dapatkan diskon 50% untuk produk pilihan!',
        pelanggan_ids: pelangganIds
        // TIDAK ada umkm_id - auto-assign dari token!
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Broadcast berhasil dibuat!');
    console.log('   ID:', createRes.data.data.broadcast_id);
    console.log('   Judul:', createRes.data.data.judul_pesan);
    console.log('   Status:', createRes.data.data.status);
    console.log('   UMKM ID:', createRes.data.data.umkm_id);

    // 4. Get semua broadcast (harus hanya broadcast UMKM yang login)
    console.log('\n4. Get semua broadcast...');
    const listRes = await axios.get(`${BASE_URL}/broadcast`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log(`✅ Total broadcast: ${listRes.data.pagination.total}`);
    console.log('   Sample broadcast:');
    listRes.data.data.slice(0, 3).forEach(b => {
      console.log(`   - ${b.judul_pesan || 'N/A'} (UMKM: ${b.umkm_id}, Status: ${b.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCreateBroadcast();
