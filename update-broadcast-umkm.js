const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  // Update broadcast dengan umkm_id default (UMKM ID 8 - Testing)
  const [result] = await conn.execute(
    'UPDATE broadcast SET umkm_id = 8 WHERE umkm_id IS NULL'
  );
  
  console.log(`✅ Updated ${result.affectedRows} broadcast ke UMKM ID 8 (Testing)`);

  // Cek hasil
  const [bc] = await conn.execute('SELECT broadcast_id, judul_pesan, umkm_id FROM broadcast');
  console.log('\nBroadcast setelah update:');
  bc.forEach(b => {
    console.log(`- ID: ${b.broadcast_id}, Judul: ${b.judul_pesan || 'N/A'}, UMKM: ${b.umkm_id}`);
  });

  await conn.end();
})();
