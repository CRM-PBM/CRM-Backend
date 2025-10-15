/**
 * Manual Test Script untuk API Pelanggan
 * Jalankan dengan: node tests/test-pelanggan-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPelangganAPI() {
  console.log('🧪 Testing Pelanggan REST API...\n');

  try {
    // Test 1: Create Pelanggan
    console.log('1️⃣  Testing CREATE Pelanggan...');
    const createResponse = await axios.post(`${BASE_URL}/pelanggan`, {
      nama: 'Test User',
      telepon: '08123456789',
      email: `test${Date.now()}@example.com`,
      gender: 'Pria',
      level: 'Silver',
      umkm_id: 1
    });
    console.log('✅ CREATE Success:', createResponse.data);
    const pelangganId = createResponse.data.data.pelanggan_id;
    console.log(`   Created pelanggan_id: ${pelangganId}\n`);

    // Test 2: Get All Pelanggan
    console.log('2️⃣  Testing GET All Pelanggan...');
    const getAllResponse = await axios.get(`${BASE_URL}/pelanggan?page=1&limit=5`);
    console.log('✅ GET All Success:', {
      total: getAllResponse.data.pagination.total,
      page: getAllResponse.data.pagination.page,
      count: getAllResponse.data.data.length
    });
    console.log('\n');

    // Test 3: Get Pelanggan by ID
    console.log('3️⃣  Testing GET Pelanggan by ID...');
    const getByIdResponse = await axios.get(`${BASE_URL}/pelanggan/${pelangganId}`);
    console.log('✅ GET by ID Success:', getByIdResponse.data.data.nama);
    console.log('\n');

    // Test 4: Update Pelanggan
    console.log('4️⃣  Testing UPDATE Pelanggan...');
    const updateResponse = await axios.put(`${BASE_URL}/pelanggan/${pelangganId}`, {
      nama: 'Test User Updated',
      level: 'Gold'
    });
    console.log('✅ UPDATE Success:', updateResponse.data.data.nama, '- Level:', updateResponse.data.data.level);
    console.log('\n');

    // Test 5: Search Pelanggan
    console.log('5️⃣  Testing SEARCH Pelanggan...');
    const searchResponse = await axios.get(`${BASE_URL}/pelanggan?search=Test`);
    console.log('✅ SEARCH Success, found:', searchResponse.data.data.length, 'records');
    console.log('\n');

    // Test 6: Delete Pelanggan
    console.log('6️⃣  Testing DELETE Pelanggan...');
    const deleteResponse = await axios.delete(`${BASE_URL}/pelanggan/${pelangganId}`);
    console.log('✅ DELETE Success:', deleteResponse.data.message);
    console.log('\n');

    // Test 7: Verify Deletion (should get 404)
    console.log('7️⃣  Testing GET Deleted Pelanggan (should fail)...');
    try {
      await axios.get(`${BASE_URL}/pelanggan/${pelangganId}`);
      console.log('❌ ERROR: Pelanggan should not exist');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ DELETE Verified: Pelanggan not found (404)');
      }
    }

    console.log('\n🎉 All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if server is running
axios.get(`${BASE_URL}/health`)
  .then(() => {
    console.log('✅ Server is running\n');
    testPelangganAPI();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the server first with: npm start');
    process.exit(1);
  });
