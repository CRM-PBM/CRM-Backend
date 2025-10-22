const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  // Update umkm_id di transaksi berdasarkan umkm_id dari pelanggan
  const [result] = await conn.execute(`
    UPDATE TRANSAKSI t
    JOIN PELANGGAN p ON t.pelanggan_id = p.pelanggan_id
    SET t.umkm_id = p.umkm_id
    WHERE t.umkm_id IS NULL
  `);
  
  console.log(`✅ Updated ${result.affectedRows} transaksi dengan umkm_id dari pelanggan`);

  // Cek hasil
  const [trans] = await conn.execute(`
    SELECT t.transaksi_id, t.nomor_transaksi, t.pelanggan_id, t.umkm_id
    FROM TRANSAKSI t
    ORDER BY t.transaksi_id
  `);
  
  console.log('\nTransaksi setelah update:');
  trans.forEach(t => {
    console.log(`- ${t.nomor_transaksi} (ID: ${t.transaksi_id}, UMKM: ${t.umkm_id})`);
  });

  await conn.end();
})();
