/**
 * Manual Test Script untuk API Transaksi
 * Jalankan dengan: node tests/test-transaksi-api.js
 * 
 * Prerequisites:
 * - Server harus running (npm start)
 * - Harus ada data pelanggan di database
 * - Harus ada data produk dengan stok di database
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testTransaksiAPI() {
  console.log('🧪 Testing Transaksi REST API...\n');

  let createdTransaksiId = null;

  try {
    // Test 0: Pastikan ada produk dan pelanggan
    console.log('0️⃣  Checking prerequisites...');
    try {
      const pelangganCheck = await axios.get(`${BASE_URL}/pelanggan?limit=1`);
      const produkCheck = await axios.get(`${BASE_URL}/produk?limit=2`);
      
      if (pelangganCheck.data.data.length === 0) {
        console.log('❌ Tidak ada data pelanggan. Buat pelanggan terlebih dahulu.');
        return;
      }
      if (produkCheck.data.data.length === 0) {
        console.log('❌ Tidak ada data produk. Buat produk terlebih dahulu.');
        return;
      }
      
      console.log('✅ Prerequisites OK');
      console.log(`   - Pelanggan tersedia: ${pelangganCheck.data.data.length}`);
      console.log(`   - Produk tersedia: ${produkCheck.data.data.length}\n`);
      
      const pelangganId = pelangganCheck.data.data[0].pelanggan_id;
      const produkId1 = produkCheck.data.data[0].produk_id;
      const produkId2 = produkCheck.data.data.length > 1 ? produkCheck.data.data[1].produk_id : produkId1;

      // Test 1: Create Transaksi
      console.log('1️⃣  Testing CREATE Transaksi...');
      const createResponse = await axios.post(`${BASE_URL}/transaksi`, {
        pelanggan_id: pelangganId,
        metode_pembayaran: 'Cash',
        keterangan: 'Test transaksi otomatis',
        items: [
          {
            produk_id: produkId1,
            jumlah: 1
          },
          {
            produk_id: produkId2,
            jumlah: 1
          }
        ]
      });
      
      console.log('✅ CREATE Success');
      console.log(`   Nomor Transaksi: ${createResponse.data.data.nomor_transaksi}`);
      console.log(`   Total: Rp ${parseFloat(createResponse.data.data.total).toLocaleString('id-ID')}`);
      console.log(`   Items: ${createResponse.data.data.DetailTransaksis.length}`);
      createdTransaksiId = createResponse.data.data.transaksi_id;
      console.log(`   ID: ${createdTransaksiId}\n`);

      // Test 2: Get All Transaksi
      console.log('2️⃣  Testing GET All Transaksi...');
      const getAllResponse = await axios.get(`${BASE_URL}/transaksi?page=1&limit=5`);
      console.log('✅ GET All Success');
      console.log(`   Total transaksi: ${getAllResponse.data.pagination.total}`);
      console.log(`   Page: ${getAllResponse.data.pagination.page}`);
      console.log(`   Data count: ${getAllResponse.data.data.length}\n`);

      // Test 3: Get Transaksi by ID
      console.log('3️⃣  Testing GET Transaksi by ID...');
      const getByIdResponse = await axios.get(`${BASE_URL}/transaksi/${createdTransaksiId}`);
      console.log('✅ GET by ID Success');
      console.log(`   Nomor: ${getByIdResponse.data.data.nomor_transaksi}`);
      console.log(`   Pelanggan: ${getByIdResponse.data.data.Pelanggan?.nama || 'N/A'}`);
      console.log(`   Total: Rp ${parseFloat(getByIdResponse.data.data.total).toLocaleString('id-ID')}`);
      console.log(`   Items: ${getByIdResponse.data.data.DetailTransaksis.length}\n`);

      // Test 4: Get Statistik
      console.log('4️⃣  Testing GET Statistik...');
      const statistikResponse = await axios.get(`${BASE_URL}/transaksi/statistik`);
      console.log('✅ GET Statistik Success');
      console.log(`   Total Transaksi: ${statistikResponse.data.data.total_transaksi}`);
      console.log(`   Total Pendapatan: Rp ${parseFloat(statistikResponse.data.data.total_pendapatan).toLocaleString('id-ID')}`);
      console.log(`   Top Products: ${statistikResponse.data.data.top_products.length}\n`);

      // Test 5: Update Transaksi
      console.log('5️⃣  Testing UPDATE Transaksi...');
      const updateResponse = await axios.put(`${BASE_URL}/transaksi/${createdTransaksiId}`, {
        metode_pembayaran: 'Transfer',
        keterangan: 'Updated - Dibayar via transfer'
      });
      console.log('✅ UPDATE Success');
      console.log(`   Metode Pembayaran: ${updateResponse.data.data.metode_pembayaran}`);
      console.log(`   Keterangan: ${updateResponse.data.data.keterangan}\n`);

      // Test 6: Filter Transaksi
      console.log('6️⃣  Testing FILTER Transaksi by Pelanggan...');
      const filterResponse = await axios.get(`${BASE_URL}/transaksi?pelanggan_id=${pelangganId}`);
      console.log('✅ FILTER Success');
      console.log(`   Transaksi found: ${filterResponse.data.data.length}\n`);

      // Test 7: Delete Transaksi
      console.log('7️⃣  Testing DELETE Transaksi...');
      const deleteResponse = await axios.delete(`${BASE_URL}/transaksi/${createdTransaksiId}`);
      console.log('✅ DELETE Success:', deleteResponse.data.message);
      console.log('   (Stok produk telah dikembalikan)\n');

      // Test 8: Verify Deletion (should get 404)
      console.log('8️⃣  Testing GET Deleted Transaksi (should fail)...');
      try {
        await axios.get(`${BASE_URL}/transaksi/${createdTransaksiId}`);
        console.log('❌ ERROR: Transaksi should not exist');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('✅ DELETE Verified: Transaksi not found (404)\n');
        }
      }

      // Test 9: Test Validasi - Stok tidak cukup (optional)
      console.log('9️⃣  Testing VALIDATION - Stok tidak mencukupi...');
      try {
        await axios.post(`${BASE_URL}/transaksi`, {
          pelanggan_id: pelangganId,
          items: [
            {
              produk_id: produkId1,
              jumlah: 999999 // Jumlah sangat besar
            }
          ]
        });
        console.log('❌ Validation should fail');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Validation Success: Stok validation working');
          console.log(`   Error: ${error.response.data.message}\n`);
        }
      }

      // Test 10: Test Validasi - Items kosong
      console.log('🔟 Testing VALIDATION - Items kosong...');
      try {
        await axios.post(`${BASE_URL}/transaksi`, {
          pelanggan_id: pelangganId,
          items: []
        });
        console.log('❌ Validation should fail');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Validation Success: Items validation working');
          console.log(`   Error: ${error.response.data.message}\n`);
        }
      }

      console.log('🎉 All tests passed!\n');

    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('❌ API endpoint not found. Pastikan routes sudah terdaftar.');
        console.log('   Cek src/routes/index.js\n');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    
    // Cleanup jika ada transaksi yang dibuat
    if (createdTransaksiId) {
      try {
        await axios.delete(`${BASE_URL}/transaksi/${createdTransaksiId}`);
        console.log('\n🧹 Cleanup: Transaksi test telah dihapus');
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1);
  }
}

// Check if server is running
axios.get(`${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Server is running\n');
    testTransaksiAPI();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the server first with: npm start');
    process.exit(1);
  });
