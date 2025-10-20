// CRM-backend/src/controllers/transaksiController.js (FULL CODE)
const transaksiService = require('../services/transaksiService');
const logger = require('../utils/logger');

class TransaksiController {
    // GET /api/transaksi - Get all transaksi
    async getAllTransaksi(req, res, next) {
        const umkmId = req.umkmId;
        try {
            const filters = {
                page: req.query.page,
                limit: req.query.limit,
                pelanggan_id: req.query.pelanggan_id,
                metode_pembayaran: req.query.metode_pembayaran,
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                search: req.query.search
            };

            const result = await transaksiService.getAllTransaksi(filters, umkmId);

            res.json({
                success: true,
                message: 'Data transaksi berhasil diambil',
                ...result
            });
        } catch (error) {
            logger.error('Error getAllTransaksi:', error);
            next(error);
        }
    }

    // GET /api/transaksi/:id - Get transaksi by ID
    async getTransaksiById(req, res, next) {
        try {
            const { id } = req.params;
            const transaksi = await transaksiService.getTransaksiById(id);

            res.json({
                success: true,
                message: 'Data transaksi berhasil diambil',
                data: transaksi
            });
        } catch (error) {
            logger.error('Error getTransaksiById:', error);
            if (error.message === 'Transaksi tidak ditemukan') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // POST /api/transaksi - Create new transaksi
    async createTransaksi(req, res, next) {
        const umkmId = req.umkmId; // Ambil ID dari token
        const dataToSend = {
            ...req.body,
            umkm_id: umkmId // Inject umkm_id
        };

        try {
            const transaksi = await transaksiService.createTransaksi(dataToSend);

            res.status(201).json({
                success: true,
                message: 'Transaksi berhasil dibuat',
                data: transaksi
            });
        } catch (error) {
            logger.error('Error createTransaksi:', error);
            if (
                error.message.includes('wajib diisi') ||
                error.message.includes('tidak ditemukan') ||
                error.message.includes('tidak aktif') ||
                error.message.includes('tidak mencukupi')
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // PUT /api/transaksi/:id - Update transaksi
    async updateTransaksi(req, res, next) {
        try {
            const { id } = req.params;
            const transaksi = await transaksiService.updateTransaksi(id, req.body);

            res.json({
                success: true,
                message: 'Transaksi berhasil diupdate',
                data: transaksi
            });
        } catch (error) {
            logger.error('Error updateTransaksi:', error);
            if (error.message === 'Transaksi tidak ditemukan') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // DELETE /api/transaksi/:id - Delete transaksi
    async deleteTransaksi(req, res, next) {
        try {
            const { id } = req.params;
            const result = await transaksiService.deleteTransaksi(id);

            res.json({
                success: true,
                ...result
            });
        } catch (error) {
            logger.error('Error deleteTransaksi:', error);
            if (error.message === 'Transaksi tidak ditemukan') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // GET /api/pelanggan/:pelanggan_id/transaksi - Get transaksi by pelanggan
    async getTransaksiByPelanggan(req, res, next) {
        try {
            const { pelanggan_id } = req.params;
            const filters = {
                page: req.query.page,
                limit: req.query.limit
            };

            const result = await transaksiService.getTransaksiByPelanggan(pelanggan_id, filters);

            res.json({
                success: true,
                message: 'Data transaksi pelanggan berhasil diambil',
                ...result
            });
        } catch (error) {
            logger.error('Error getTransaksiByPelanggan:', error);
            next(error);
        }
    }

    // GET /api/transaksi/statistik - Get statistik transaksi
    async getStatistik(req, res, next) {
        const umkmId = req.umkmId; 
        try {
            const statistik = await transaksiService.getStatistik(umkmId); 
            res.json({
                success: true,
                message: 'Statistik transaksi berhasil diambil',
                data: statistik
            });
        } catch (error) {
            logger.error('Error getStatistik:', error);
            next(error);
        }
    }
}


module.exports = new TransaksiController();