const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false
  }
);

async function updateProdukUmkmId() {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi database berhasil");

    // 1. Cek kolom umkm_id di tabel PRODUK
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'PRODUK'
    `);
    
    const hasUmkmId = columns.some(col => col.COLUMN_NAME === 'umkm_id');
    console.log(`\n📋 Kolom umkm_id ${hasUmkmId ? 'sudah ada' : 'belum ada'} di tabel PRODUK`);

    if (!hasUmkmId) {
      console.log("⚠️  Kolom umkm_id belum ada. Tambahkan dulu dengan menjalankan sync.js");
      process.exit(0);
    }

    // 2. Cek data produk yang ada
    const [produk] = await sequelize.query(`SELECT * FROM PRODUK`);
    console.log(`\n📦 Total produk: ${produk.length}`);

    if (produk.length === 0) {
      console.log("✅ Tidak ada data produk untuk diupdate");
      process.exit(0);
    }

    // 3. Tampilkan produk yang ada
    console.log("\n🔍 Data produk saat ini:");
    produk.forEach(p => {
      console.log(`   - ID: ${p.produk_id}, Nama: ${p.nama_produk}, UMKM ID: ${p.umkm_id || 'NULL'}`);
    });

    // 4. Update produk yang umkm_id-nya NULL
    const produkNullUmkm = produk.filter(p => !p.umkm_id);
    
    if (produkNullUmkm.length > 0) {
      console.log(`\n⚠️  Ada ${produkNullUmkm.length} produk dengan umkm_id NULL`);
      console.log("📝 Update semua produk dengan umkm_id = 1 (default)");
      
      await sequelize.query(`UPDATE PRODUK SET umkm_id = 1 WHERE umkm_id IS NULL`);
      console.log("✅ Update berhasil");

      // Verifikasi
      const [updated] = await sequelize.query(`SELECT * FROM PRODUK WHERE umkm_id IS NULL`);
      console.log(`\n✓ Produk dengan umkm_id NULL sekarang: ${updated.length}`);
    } else {
      console.log("\n✅ Semua produk sudah memiliki umkm_id");
    }

    // 5. Tampilkan hasil akhir
    const [finalProduk] = await sequelize.query(`SELECT * FROM PRODUK`);
    console.log("\n📊 Hasil akhir:");
    finalProduk.forEach(p => {
      console.log(`   - ID: ${p.produk_id}, Nama: ${p.nama_produk}, UMKM ID: ${p.umkm_id}`);
    });

    console.log("\n✅ Selesai");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updateProdukUmkmId();
