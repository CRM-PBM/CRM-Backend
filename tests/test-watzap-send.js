require('dotenv').config();
const WatzapService = require('./src/services/watzapService');

const watzapService = new WatzapService();

async function testSendMessage() {
  console.log('\n🧪 Testing Watzap.id Send Message\n');
  
  // Ganti dengan nomor HP Anda untuk test
  const testNumber = '628996901370'; // Format: 628xxx (tanpa +)
  const testMessage = '🧪 Test pesan dari CRM Backend\n\nJika Anda menerima pesan ini, berarti WhatsApp instance sudah berjalan dengan baik! ✅';

  console.log('📱 Target Number:', testNumber);
  console.log('💬 Message:', testMessage);
  console.log('\n⏳ Sending...\n');

  try {
    const result = await watzapService.sendTextMessage(testNumber, testMessage);
    
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Pesan berhasil dikirim!');
      console.log('✅ WhatsApp instance berjalan dengan baik');
    } else {
      console.log('\n❌ FAILED! Pesan gagal dikirim');
      
      if (result.status === '1005') {
        console.log('\n⚠️  WhatsApp Instance Not Started!');
        console.log('\n📋 Action Required:');
        console.log('   1. Login to https://console.watzap.id/');
        console.log('   2. Find your instance/device');
        console.log('   3. Click "START" button');
        console.log('   4. Wait for status to become "CONNECTED"');
        console.log('   5. Run this test again');
        console.log('\nℹ️  Baca TROUBLESHOOTING-WATZAP.md untuk detail lengkap');
      } else {
        console.log('Error:', result.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Jalankan test
testSendMessage();
