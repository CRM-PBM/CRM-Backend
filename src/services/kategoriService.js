const { Op } = require('sequelize');
const KategoriProduk = require('../models/KategoriProduk');
const JenisProduk = require('../models/JenisProduk');

class KategoriService {

    // --- KATEGORI PRODUK ---
    async getAllKategori(umkm_id) {
        const data = await KategoriProduk.findAll({
            where: { umkm_id },
            order: [['nama_kategori', 'ASC']]
        });
        return { success: true, data };
    }

    async createKategori(data) {
        try {
            console.log('Kategori\n 🟢 Data masuk ke service:', data);
            const { nama_kategori, deskripsi, umkm_id } = data;

            if (!nama_kategori) throw new Error('Nama kategori wajib diisi');

            const existing = await KategoriProduk.findOne({ 
                where: { nama_kategori, umkm_id }
            });
            if (existing) throw new Error('Nama kategori sudah ada');

            const kategori = await KategoriProduk.create({
                nama_kategori,
                deskripsi,
                umkm_id
            });

            return kategori;
        } catch (error) {
                console.error('🔴 Error di kategoriService.createKategori:', error);
                throw error;
        }
    }


    async updateKategori(id, data) {
        const kategori = await KategoriProduk.findByPk(id);
        if (!kategori) throw new Error('Kategori tidak ditemukan');

        // Cek nama unik jika diganti
        if (data.nama_kategori && data.nama_kategori !== kategori.nama_kategori) {
            const existing = await KategoriProduk.findOne({
                where: { nama_kategori: data.nama_kategori }
            });
            if (existing) throw new Error('Nama kategori sudah ada');
        }

        await kategori.update(data);
        return { success: true, data: await kategori.reload() };
    }

    async deleteKategori(id) {
        // Hapus jenis produk terkait (kalau belum pakai CASCADE)
        await JenisProduk.destroy({ where: { kategori_id: id } });

        const deleted = await KategoriProduk.destroy({
            where: { kategori_id: id }
        });

        if (!deleted) throw new Error('Kategori tidak ditemukan');
        return { success: true };
    }
}

module.exports = new KategoriService();
