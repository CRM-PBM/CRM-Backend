const { Op } = require('sequelize');
const JenisProduk = require('../models/JenisProduk');
const KategoriProduk = require('../models/KategoriProduk');

class JenisProdukService {
    // --- JENIS PRODUK ---
    async getAllJenis(umkm_id) {
        const data = await JenisProduk.findAll({
            include: [
                { 
                    model: KategoriProduk, 
                    attributes: ['nama_kategori'], 
                    where: { umkm_id } 
                }
            ],
            order: [['nama_jenis', 'ASC']],
            where: { umkm_id }
        });
        return { success: true, data };
    }

    async createJenis(data) {
        const { nama_jenis, kategori_id, umkm_id } = data;

        if (!nama_jenis || !kategori_id)
            throw new Error('Nama jenis dan kategori wajib diisi');

        const existing = await JenisProduk.findOne({
            where: {
                [Op.and]: [
                    { nama_jenis },
                    { kategori_id },
                    { umkm_id }
                ]
            }
        });
        if (existing) throw new Error('Jenis produk sudah ada dalam kategori ini');

        const newJenis = await JenisProduk.create({
            nama_jenis,
            kategori_id,
            umkm_id
        });

        return { success: true, data: newJenis };
    }


    async updateJenis(id, data) {
        const jenis = await JenisProduk.findByPk(id);
        if (!jenis) throw new Error('Jenis produk tidak ditemukan');

        // Cek nama_jenis unik jika diganti
        if (data.nama_jenis && data.nama_jenis !== jenis.nama_jenis) {
            const existing = await JenisProduk.findOne({
                where: {
                    [Op.and]: [
                        { nama_jenis: data.nama_jenis },
                        { kategori_id: jenis.kategori_id }
                    ]
                }
            });
            if (existing) throw new Error('Jenis produk dengan nama tersebut sudah ada');
        }

        await jenis.update(data);
        return { success: true, data: await jenis.reload() };
    }

    async deleteJenis(id) {
        const deleted = await JenisProduk.destroy({
            where: { jenis_produk_id: id }
        });

        if (!deleted) throw new Error('Jenis produk tidak ditemukan');
        return { success: true };
    }
}

module.exports = new JenisProdukService();
