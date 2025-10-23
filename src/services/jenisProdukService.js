const { Op } = require('sequelize');
const JenisProduk = require('../models/JenisProduk');
const KategoriProduk = require('../models/KategoriProduk');

class JenisProdukService {
    // --- JENIS PRODUK ---
    async getAllJenis() {
        const data = await JenisProduk.findAll({
            include: [
                { model: KategoriProduk, attributes: ['nama_kategori'] }
            ],
            order: [['nama_jenis', 'ASC']]
        });
        return { success: true, data };
    }

    async createJenis(data) {
        // Pastikan nama_jenis unik dalam satu kategori
        const existing = await JenisProduk.findOne({
            where: {
                [Op.and]: [
                    { nama_jenis: data.nama_jenis },
                    { kategori_id: data.kategori_id }
                ]
            }
        });
        if (existing) throw new Error('Jenis produk sudah ada dalam kategori ini');

        const newJenis = await JenisProduk.create(data);
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
