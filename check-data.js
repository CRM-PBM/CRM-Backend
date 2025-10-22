const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  const [umkm] = await conn.execute('SELECT umkm_id, nama_umkm FROM UMKM LIMIT 5');
  console.log('UMKM tersedia:');
  umkm.forEach(u => console.log(`- ID: ${u.umkm_id}, Nama: ${u.nama_umkm}`));

  const [produk] = await conn.execute('SELECT produk_id, nama_produk, umkm_id FROM PRODUK');
  console.log('\nProduk saat ini:');
  produk.forEach(p => console.log(`- ID: ${p.produk_id}, Nama: ${p.nama_produk}, UMKM_ID: ${p.umkm_id || 'NULL'}`));

  await conn.end();
})();
