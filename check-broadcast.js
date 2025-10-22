const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  const [rows] = await conn.execute('SELECT COUNT(*) as total FROM broadcast');
  console.log('Total broadcast:', rows[0].total);
  
  if (rows[0].total > 0) {
    const [bc] = await conn.execute(`
      SELECT b.broadcast_id, b.judul_pesan, b.user_id, b.umkm_id, u.umkm_id as user_umkm_id
      FROM broadcast b
      LEFT JOIN USER u ON b.user_id = u.user_id
      LIMIT 10
    `);
    console.log('\nBroadcast existing:');
    bc.forEach(b => {
      console.log(`- ID: ${b.broadcast_id}, User: ${b.user_id}, UMKM: ${b.umkm_id || 'NULL'}, User's UMKM: ${b.user_umkm_id}`);
    });
  }

  await conn.end();
})();
