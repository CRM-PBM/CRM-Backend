# Implementasi Relasi Produk dengan UMKM

## 📋 Ringkasan Perubahan

Implementasi relasi `umkm_id` pada model Produk untuk memastikan setiap produk terisolasi per UMKM (multi-tenancy).

## 🔧 Perubahan yang Dilakukan

### 1. Model Produk (`src/models/Produk.js`)

**Ditambahkan:**
- Kolom `umkm_id` dengan constraint:
  - `type: DataTypes.INTEGER`
  - `allowNull: false` (wajib diisi)
  - Foreign key ke tabel `UMKM`
  
**Relasi:**
```javascript
// Relasi dengan UMKM
Produk.belongsTo(Umkm, { foreignKey: "umkm_id", as: 'umkm' });
Umkm.hasMany(Produk, { foreignKey: "umkm_id", as: 'produk' });
```

### 2. Controller (`src/controllers/produkController.js`)

**Perubahan pada method:**

#### `createProduk`
- Menambahkan `umkm_id` dari JWT token ke data produk
- Auto-assignment `umkm_id` dari `req.umkmId`
```javascript
const dataToSend = {
  ...req.body,
  umkm_id: umkmId
}
const produk = await produkService.createProduk(dataToSend);
```

#### `getProdukById`
- Menambahkan parameter `umkmId` untuk validasi kepemilikan
```javascript
const produk = await produkService.getProdukById(id, umkmId);
```

#### `updateProduk`
- Menambahkan parameter `umkmId` untuk validasi kepemilikan
- Memastikan UMKM hanya bisa update produk miliknya
```javascript
const produk = await produkService.updateProduk(id, req.body, umkmId);
```

#### `deleteProduk`
- Menambahkan parameter `umkmId` untuk validasi kepemilikan
- Memastikan UMKM hanya bisa delete produk miliknya
```javascript
const result = await produkService.deleteProduk(id, umkmId);
```

### 3. Service (`src/services/produkService.js`)

**Perubahan pada method:**

#### `getAllProduk`
- Sudah ada filter `umkm_id` di query WHERE
```javascript
where: {
  umkm_id: umkmId,
  // filter lainnya
}
```

#### `getProdukById`
- Menambahkan filter `umkm_id`
```javascript
const produk = await Produk.findOne({
  where: { 
    produk_id: id,
    umkm_id: umkmId 
  }
});
```

#### `createProduk`
- Validasi `umkm_id` wajib diisi
- Menyimpan `umkm_id` ke database
```javascript
if (!umkm_id) {
  throw new Error('UMKM ID wajib diisi');
}
```

#### `updateProduk`
- Menambahkan filter `umkm_id` untuk validasi kepemilikan
```javascript
const produk = await Produk.findOne({
  where: { 
    produk_id: id,
    umkm_id: umkmId 
  }
});
```

#### `deleteProduk`
- Menambahkan filter `umkm_id` untuk validasi kepemilikan
```javascript
const produk = await Produk.findOne({
  where: { 
    produk_id: id,
    umkm_id: umkmId 
  }
});
```

## 🔒 Data Isolation

Dengan implementasi ini, setiap UMKM:
- ✅ Hanya bisa melihat produk miliknya sendiri
- ✅ Hanya bisa menambahkan produk dengan `umkm_id` miliknya
- ✅ Hanya bisa mengupdate produk miliknya sendiri
- ✅ Hanya bisa menghapus produk miliknya sendiri
- ✅ Tidak bisa mengakses produk UMKM lain

## 🗄️ Database Migration

1. Jalankan sync untuk menambahkan kolom `umkm_id`:
```bash
node src/sync.js
```

2. Update data produk existing (jika ada):
```bash
node update-produk-umkm-id.js
```

## 📝 Struktur Tabel PRODUK

```sql
CREATE TABLE PRODUK (
  produk_id INT AUTO_INCREMENT PRIMARY KEY,
  nama_produk VARCHAR(50) NOT NULL,
  kode_produk VARCHAR(20) UNIQUE,
  jenis_produk_id INT NOT NULL,
  harga DECIMAL(12,2) NOT NULL,
  stok INT DEFAULT 0,
  umkm_id INT NOT NULL,  -- ⭐ BARU
  aktif BOOLEAN DEFAULT true,
  FOREIGN KEY (jenis_produk_id) REFERENCES JENIS_PRODUK(jenis_produk_id),
  FOREIGN KEY (umkm_id) REFERENCES UMKM(umkm_id)  -- ⭐ BARU
);
```

## 🧪 Testing

Silakan test dengan:
1. Login sebagai user UMKM A
2. Tambahkan produk → otomatis ter-assign ke UMKM A
3. Coba akses/edit produk UMKM A → ✅ Berhasil
4. Login sebagai user UMKM B
5. Coba akses/edit produk UMKM A → ❌ Tidak ditemukan

## ✅ Checklist Implementasi

- [x] Tambah kolom `umkm_id` di model Produk
- [x] Tambah relasi `belongsTo` Umkm
- [x] Update `createProduk` - auto-assign `umkm_id`
- [x] Update `getAllProduk` - filter by `umkm_id`
- [x] Update `getProdukById` - validasi kepemilikan
- [x] Update `updateProduk` - validasi kepemilikan
- [x] Update `deleteProduk` - validasi kepemilikan
- [x] Database sync berhasil
- [x] Server berjalan tanpa error

## 🎯 Status

✅ **SELESAI** - Produk sudah terintegrasi dengan multi-tenancy UMKM
