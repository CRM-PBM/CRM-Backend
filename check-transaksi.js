const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  const [rows] = await conn.execute('SELECT COUNT(*) as total FROM TRANSAKSI');
  console.log('Total transaksi:', rows[0].total);
  
  if (rows[0].total > 0) {
    const [trans] = await conn.execute(`
      SELECT t.transaksi_id, t.nomor_transaksi, t.pelanggan_id, t.umkm_id, p.umkm_id as pelanggan_umkm_id
      FROM TRANSAKSI t
      LEFT JOIN PELANGGAN p ON t.pelanggan_id = p.pelanggan_id
      LIMIT 10
    `);
    console.log('\nTransaksi existing:');
    trans.forEach(t => {
      console.log(`- ${t.nomor_transaksi} (ID: ${t.transaksi_id}, Pelanggan: ${t.pelanggan_id}, UMKM: ${t.umkm_id || 'NULL'}, Pelanggan UMKM: ${t.pelanggan_umkm_id})`);
    });
  }

  await conn.end();
})();
