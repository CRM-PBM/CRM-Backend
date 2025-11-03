require('dotenv').config();
const axios = require('axios');

async function checkWatzapStatus() {
  const WATZAP_URL = process.env.WATZAP_URL;
  const NUMBER_KEY = process.env.WATZAP_NUMBER_KEY;

  console.log('\n🔍 Checking Watzap.id Instance Status...\n');
  console.log('URL:', WATZAP_URL);
  console.log('Number Key:', NUMBER_KEY ? `${NUMBER_KEY.substring(0, 10)}...` : 'NOT SET');

  if (!WATZAP_URL || !NUMBER_KEY) {
    console.error('❌ WATZAP_URL atau WATZAP_NUMBER_KEY tidak diset di .env');
    process.exit(1);
  }

  try {
    // Endpoint untuk cek status instance
    const statusUrl = `${WATZAP_URL}/status/${NUMBER_KEY}`;
    
    console.log('\n📡 Requesting:', statusUrl);
    
    const response = await axios.get(statusUrl, {
      timeout: 10000
    });

    console.log('\n✅ Response Status:', response.status);
    console.log('📊 Instance Status:', JSON.stringify(response.data, null, 2));

    // Cek apakah instance running
    if (response.data.status === 'running' || response.data.status === 'connected') {
      console.log('\n✅ WhatsApp Instance is RUNNING');
      console.log('✅ Ready to send messages');
    } else if (response.data.status === '1005' || response.data.message === 'WhatsApp Instance Not Started') {
      console.log('\n❌ WhatsApp Instance is STOPPED');
      console.log('⚠️  Action Required:');
      console.log('   1. Login to https://console.watzap.id/');
      console.log('   2. Select your instance/device');
      console.log('   3. Click "START" or "Run Instance"');
      console.log('   4. Scan QR code if prompted');
      console.log('   5. Wait for status to become "CONNECTED"');
    } else {
      console.log('\n⚠️  Unknown status:', response.data.status);
      console.log('Check Watzap.id dashboard for details');
    }

  } catch (error) {
    console.error('\n❌ Error checking Watzap status:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from Watzap.id');
      console.error('Check if WATZAP_URL is correct:', WATZAP_URL);
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkWatzapStatus();
