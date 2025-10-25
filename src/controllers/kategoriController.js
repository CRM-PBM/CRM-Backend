const kategoriService = require('../services/kategoriService');
const logger = require('../utils/logger');

class KategoriController {
    
    // --- KATEGORI PRODUK ---
    async getAllKategori(req, res, next) {
        try {
            const umkmId = req.umkmId; 
            const result = await kategoriService.getAllKategori(umkmId);
            res.json({ success: true, message: 'Data kategori berhasil diambil', data: result.data });
        } catch (error) {
            logger.error('Error getAllKategori:', error);
            next(error);
        }
    }

    async createKategori(req, res, next) {
        try {
            const umkmId = req.umkmId;
            console.log('🟢 Data diterima dari frontend:', req.body);
            const data = {
                ...req.body,
                umkm_id: umkmId
            };


            const newKategori = await kategoriService.createKategori(data);
            res.status(201).json({ 
                success: true, 
                message: 'Kategori berhasil ditambahkan', 
                data: newKategori 
            });
            
        } catch (error) {
            logger.error('Error createKategori:', error);
            if (error.message.includes('sudah ada')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async updateKategori(req, res, next) {
    try {
        const { id } = req.params;
        const result = await kategoriService.updateKategori(id, req.body);
        res.json({ success: true, message: 'Kategori berhasil diperbarui', data: result.data });
        } catch (error) {
            logger.error('Error updateKategori:', error);
            if (error.message.includes('tidak ditemukan')) {
            return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async deleteKategori(req, res, next) {
        try {
            const { id } = req.params;
            await kategoriService.deleteKategori(id);
            res.json({ success: true, message: 'Kategori dan jenis produk terkait berhasil dihapus' });
        } catch (error) {
            logger.error('Error deleteKategori:', error);
            if (error.message.includes('tidak ditemukan')) {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

module.exports = new KategoriController();