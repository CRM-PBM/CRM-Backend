const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crmumkm'
  });

  const [users] = await conn.execute('SELECT user_id, email, role, umkm_id FROM USER LIMIT 5');
  console.log('Users tersedia:');
  users.forEach(u => console.log(`- ${u.email} (${u.role}) - UMKM ID: ${u.umkm_id}`));

  await conn.end();
})();
