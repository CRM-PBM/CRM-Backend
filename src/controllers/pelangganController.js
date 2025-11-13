const pelangganService = require('../services/pelangganService');
const logger = require('../utils/logger');

class PelangganController {

    async getAllPelanggan(req, res, next) {
        const umkmId = req.umkmId;
        try {
            const filters = {
                page: req.query.page,
                limit: req.query.limit,
                level: req.query.level,
                gender: req.query.gender,
                search: req.query.search
            };

            const result = await pelangganService.getAllPelanggan(filters, umkmId);

            res.json({
                success: true,
                message: 'Data pelanggan berhasil diambil',
                ...result
            });

        } catch (error) {
            logger.error('Error getAllPelanggan:', error);
            next(error);
        }
    }

    async getPelangganById(req, res, next) {
        try {
            const { id } = req.params;
            const pelanggan = await pelangganService.getPelangganById(id);
            res.json({
                success: true,
                message: 'Data pelanggan berhasil diambil',
                data: pelanggan
            });
        } catch (error) {
            logger.error('Error getPelangganById:', error);
            if (error.message === 'Pelanggan tidak ditemukan') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async createPelanggan(req, res, next) {
        const umkmId = req.umkmId;

        const dataToSend = {
            ...req.body,
            umkm_id: umkmId
        };

        try {
            const pelanggan = await pelangganService.createPelanggan(dataToSend);
            res.status(201).json({
                success: true,
                message: 'Pelanggan berhasil ditambahkan',
                data: pelanggan
            });
        } catch (error) {
            logger.error('Error createPelanggan:', error);
            if (error.message.includes('wajib diisi') || error.message.includes('sudah terdaftar')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async updatePelanggan(req, res, next) {
        try {
            const { id } = req.params;
            const pelanggan = await pelangganService.updatePelanggan(id, req.body);
            res.json({
                success: true,
                message: 'Pelanggan berhasil diupdate',
                data: pelanggan
            });
        } catch (error) {
            logger.error('Error updatePelanggan:', error);
            if (error.message === 'Pelanggan tidak ditemukan') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message.includes('sudah terdaftar')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async deletePelanggan(req, res, next) {
        try {
            const { id } = req.params;
            const result = await pelangganService.deletePelanggan(id);
            res.json({ success: true, ...result });
        } catch (error) {
            logger.error('Error deletePelanggan:', error);
            if (error.message === 'Pelanggan tidak ditemukan') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async getPelangganByUmkm(req, res, next) {
        try {
            const { umkm_id } = req.params;
            const filters = { page: req.query.page, limit: req.query.limit };
            const result = await pelangganService.getPelangganByUmkm(umkm_id, filters);
            res.json({ success: true, message: 'Data pelanggan berhasil diambil', ...result });
        } catch (error) {
            logger.error('Error getPelangganByUmkm:', error);
            next(error);
        }
    }

    async getStatistik(req, res, next) {
        const umkmId = req.umkmId;
        try {
            const data = await pelangganService.getStatistik(umkmId);
            res.json({
                success: true,
                message: 'Statistik pelanggan berhasil diambil',
                data,
            });
        } catch (error) {
            logger.error('Error getStatistik:', error);
            next(error);
        }
    }

    async getPelangganGrowthData(req, res, next) {
        const umkmId = req.umkmId;
        try {
            const period = req.query.period || 'day'; 
            
            const data = await pelangganService.getPelangganGrowthData(umkmId, period);
            res.json({
                success: true,
                message: 'Data pertumbuhan pelanggan berhasil diambil',
                data,
            });
        } catch (error) {
            logger.error('Error getPelangganGrowthData:', error);
            next(error);
        }
    }
}

module.exports = new PelangganController();