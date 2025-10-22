const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testCreateTransaksi() {
  try {
    console.log('=== TEST CREATE TRANSAKSI WITH UMKM_ID ===\n');

    // 1. Login dulu untuk dapat token
    console.log('1. Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'dandywahyudin19@gmail.com',
      password: 'Dandy1910.'
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

    const pelangganId = pelangganRes.data.data[0].pelanggan_id;
    console.log(`✅ Pelanggan ID: ${pelangganId}`);

    // 3. Get produk dari UMKM yang login
    console.log('\n3. Get produk...');
    const produkRes = await axios.get(`${BASE_URL}/produk`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (produkRes.data.data.length === 0) {
      console.log('❌ Tidak ada produk, create produk dulu');
      return;
    }

    const produk = produkRes.data.data[0];
    console.log(`✅ Produk: ${produk.nama_produk} (ID: ${produk.produk_id})`);

    // 4. Create transaksi baru (TIDAK perlu kirim umkm_id)
    console.log('\n4. Create transaksi baru...');
    const createRes = await axios.post(
      `${BASE_URL}/transaksi`,
      {
        pelanggan_id: pelangganId,
        metode_pembayaran: 'TUNAI',
        keterangan: 'Test transaksi auto umkm_id',
        items: [ // Harus 'items' bukan 'detail'
          {
            produk_id: produk.produk_id,
            jumlah: 2,
            harga_satuan: produk.harga
          }
        ]
        // TIDAK ada umkm_id - auto-assign dari token!
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    console.log('✅ Transaksi berhasil dibuat!');
    console.log('   Nomor:', createRes.data.data.nomor_transaksi);
    console.log('   Total:', createRes.data.data.total);
    console.log('   UMKM ID:', createRes.data.data.umkm_id);

    // 5. Get semua transaksi (harus hanya transaksi UMKM yang login)
    console.log('\n5. Get semua transaksi...');
    const listRes = await axios.get(`${BASE_URL}/transaksi`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log(`✅ Total transaksi: ${listRes.data.data.length}`);
    console.log('   Transaksi:');
    listRes.data.data.slice(0, 5).forEach(t => {
      console.log(`   - ${t.nomor_transaksi} (UMKM: ${t.umkm_id}, Total: Rp ${t.total})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCreateTransaksi();
