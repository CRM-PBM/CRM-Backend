const jenisProdukService = require('../services/jenisProdukService');
const logger = require('../utils/logger');

class JenisProdukController {
    // --- JENIS PRODUK ---
    async getAllJenis(req, res, next) {
        try {
            const result = await jenisProdukService.getAllJenis();
            res.json({ success: true, message: 'Data jenis produk berhasil diambil', data: result.data });
        } catch (error) {
            logger.error('Error getAllJenis:', error);
            next(error);
        }
    }

    async createJenis(req, res, next) {
        try {
            const newJenis = await jenisProdukService.createJenis(req.body);
            res.status(201).json({ success: true, message: 'Jenis produk berhasil ditambahkan', data: newJenis.data });
        } catch (error) {
            logger.error('Error createJenis:', error);
            if (error.message.includes('Kode jenis produk sudah ada')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }


    async updateJenis(req, res, next) {
    try {
        const { id } = req.params;
        const result = await jenisProdukService.updateJenis(id, req.body);
        res.json({ success: true, message: 'Jenis produk berhasil diperbarui', data: result.data });
        } catch (error) {
            logger.error('Error updateJenis:', error);
            if (error.message.includes('Kode jenis produk sudah ada')) {
            return res.status(400).json({ success: false, message: error.message });
            }
            if (error.message.includes('tidak ditemukan')) {
            return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    // --- DELETE JENIS PRODUK ---
    async deleteJenis(req, res, next) {
    try {
            const { id } = req.params;
            await jenisProdukService.deleteJenis(id);
            res.json({ success: true, message: 'Jenis produk berhasil dihapus' });
        } catch (error) {
            logger.error('Error deleteJenis:', error);
            if (error.message.includes('tidak ditemukan')) {
            return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

module.exports = new JenisProdukController();