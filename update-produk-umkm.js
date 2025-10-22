const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  // Update semua produk yang umkm_id nya NULL ke UMKM ID 1
  const [result] = await conn.execute(
    'UPDATE PRODUK SET umkm_id = 1 WHERE umkm_id IS NULL'
  );
  
  console.log(`✅ Updated ${result.affectedRows} produk ke UMKM ID 1 (Warteg Barokah)`);

  // Cek hasil
  const [produk] = await conn.execute('SELECT produk_id, nama_produk, umkm_id FROM PRODUK');
  console.log('\nProduk setelah update:');
  produk.forEach(p => console.log(`- ID: ${p.produk_id}, Nama: ${p.nama_produk}, UMKM_ID: ${p.umkm_id}`));

  await conn.end();
})();
