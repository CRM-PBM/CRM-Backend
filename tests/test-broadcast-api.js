/**
 * Manual Test Script untuk API Broadcast
 * Jalankan dengan: node tests/test-broadcast-api.js
 * 
 * Prerequisites:
 * - Server harus running (npm start)
 * - File .env sudah disetup dengan Watzap.id credentials
 * - Harus ada data pelanggan dengan nomor telepon
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBroadcastAPI() {
  console.log('🧪 Testing Broadcast REST API...\n');

  let createdBroadcastId = null;

  try {
    // Test 0: Cek device status
    console.log('0️⃣  Testing Device Status...');
    try {
      const deviceResponse = await axios.get(`${BASE_URL}/broadcast/device/status`);
      console.log('✅ Device Status Check Success');
      console.log(`   Connected: ${deviceResponse.data.data.connected}`);
      
      if (!deviceResponse.data.data.connected) {
        console.log('⚠️  WARNING: Device not connected to WhatsApp!');
        console.log('   Broadcast akan gagal. Setup device terlebih dahulu.\n');
      } else {
        console.log('   Device ready!\n');
      }
    } catch (error) {
      console.log('⚠️  Device status check failed. Mungkin Watzap.id tidak dikonfigurasi.\n');
    }

    // Test 1: Cek pelanggan tersedia
    console.log('1️⃣  Checking prerequisites...');
    const pelangganCheck = await axios.get(`${BASE_URL}/pelanggan?limit=5`);
    
    if (pelangganCheck.data.data.length === 0) {
      console.log('❌ Tidak ada data pelanggan. Buat pelanggan terlebih dahulu.');
      return;
    }

    const pelangganWithPhone = pelangganCheck.data.data.filter(p => p.telepon);
    
    if (pelangganWithPhone.length === 0) {
      console.log('❌ Tidak ada pelanggan dengan nomor telepon.');
      return;
    }

    console.log('✅ Prerequisites OK');
    console.log(`   Pelanggan dengan telepon: ${pelangganWithPhone.length}\n`);

    const pelangganIds = pelangganWithPhone.slice(0, 3).map(p => p.pelanggan_id);

    // Test 2: Create Broadcast (Draft)
    console.log('2️⃣  Testing CREATE Broadcast...');
    const createResponse = await axios.post(`${BASE_URL}/broadcast`, {
      judul_pesan: 'Test Broadcast Otomatis',
      isi_pesan: 'Halo {nama}, ini adalah test message dari CRM Backend. Nomor Anda: {telepon}',
      pelanggan_ids: pelangganIds
    });
    
    console.log('✅ CREATE Success');
    console.log(`   Broadcast ID: ${createResponse.data.data.broadcast_id}`);
    console.log(`   Judul: ${createResponse.data.data.judul_pesan}`);
    console.log(`   Status: ${createResponse.data.data.status}`);
    console.log(`   Penerima: ${createResponse.data.data.stats.total_penerima}\n`);
    
    createdBroadcastId = createResponse.data.data.broadcast_id;

    // Test 3: Get All Broadcast
    console.log('3️⃣  Testing GET All Broadcast...');
    const getAllResponse = await axios.get(`${BASE_URL}/broadcast?page=1&limit=5`);
    console.log('✅ GET All Success');
    console.log(`   Total broadcast: ${getAllResponse.data.pagination.total}`);
    console.log(`   Data count: ${getAllResponse.data.data.length}\n`);

    // Test 4: Get Broadcast by ID
    console.log('4️⃣  Testing GET Broadcast by ID...');
    const getByIdResponse = await axios.get(`${BASE_URL}/broadcast/${createdBroadcastId}`);
    console.log('✅ GET by ID Success');
    console.log(`   Judul: ${getByIdResponse.data.data.judul_pesan}`);
    console.log(`   Status: ${getByIdResponse.data.data.status}`);
    console.log(`   Penerima: ${getByIdResponse.data.data.stats.total_penerima}`);
    console.log(`   Details count: ${getByIdResponse.data.data.BroadcastDetails.length}\n`);

    // Test 5: Get Statistik
    console.log('5️⃣  Testing GET Statistik...');
    const statistikResponse = await axios.get(`${BASE_URL}/broadcast/statistik`);
    console.log('✅ GET Statistik Success');
    console.log(`   Total Broadcast: ${statistikResponse.data.data.total_broadcast}`);
    console.log(`   Total Penerima: ${statistikResponse.data.data.total_penerima}`);
    console.log(`   Terkirim: ${statistikResponse.data.data.terkirim}`);
    console.log(`   Success Rate: ${statistikResponse.data.data.success_rate}%\n`);
    
    // UNCOMMENT untuk test pengiriman real
    try {
      const sendResponse = await axios.post(`${BASE_URL}/broadcast/${createdBroadcastId}/send`);
      console.log('✅ SEND Success');
      console.log(`   Status: ${sendResponse.data.data.status}`);
      console.log(`   Total: ${sendResponse.data.data.results.total}`);
      console.log(`   Success: ${sendResponse.data.data.results.success}`);
      console.log(`   Failed: ${sendResponse.data.data.results.failed}\n`);
    } catch (error) {
      console.log('⚠️  SEND Failed (mungkin device not connected)');
      console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
    }

    // Test 7: Filter Broadcast by Status
    console.log('7️⃣  Testing FILTER Broadcast by Status...');
    const filterResponse = await axios.get(`${BASE_URL}/broadcast?status=draft`);
    console.log('✅ FILTER Success');
    console.log(`   Draft broadcasts found: ${filterResponse.data.data.length}\n`);

  }
  catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else {
      console.error('   Error:', error.message);
    }

    // Cleanup jika ada broadcast yang dibuat
    if (createdBroadcastId) {
      try {
        await axios.delete(`${BASE_URL}/broadcast/${createdBroadcastId}`);
        console.log('\n🧹 Cleanup: Broadcast test telah dihapus');
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
    testBroadcastAPI();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the server first with: npm start');
    process.exit(1);
  });
