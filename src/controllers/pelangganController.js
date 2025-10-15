const pelangganService = require('../services/pelangganService');
const logger = require('../utils/logger');

class PelangganController {
  // GET /api/pelanggan - Get all pelanggan
  async getAllPelanggan(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        umkm_id: req.query.umkm_id,
        level: req.query.level,
        gender: req.query.gender,
        search: req.query.search
      };

      const result = await pelangganService.getAllPelanggan(filters);

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

  // GET /api/pelanggan/:id - Get pelanggan by ID
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
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // POST /api/pelanggan - Create new pelanggan
  async createPelanggan(req, res, next) {
    try {
      const pelanggan = await pelangganService.createPelanggan(req.body);

      res.status(201).json({
        success: true,
        message: 'Pelanggan berhasil ditambahkan',
        data: pelanggan
      });
    } catch (error) {
      logger.error('Error createPelanggan:', error);
      if (error.message.includes('wajib diisi') || error.message.includes('sudah terdaftar')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // PUT /api/pelanggan/:id - Update pelanggan
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
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('sudah terdaftar')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // DELETE /api/pelanggan/:id - Delete pelanggan
  async deletePelanggan(req, res, next) {
    try {
      const { id } = req.params;
      const result = await pelangganService.deletePelanggan(id);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error deletePelanggan:', error);
      if (error.message === 'Pelanggan tidak ditemukan') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // GET /api/umkm/:umkm_id/pelanggan - Get pelanggan by UMKM
  async getPelangganByUmkm(req, res, next) {
    try {
      const { umkm_id } = req.params;
      const filters = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await pelangganService.getPelangganByUmkm(umkm_id, filters);

      res.json({
        success: true,
        message: 'Data pelanggan berhasil diambil',
        ...result
      });
    } catch (error) {
      logger.error('Error getPelangganByUmkm:', error);
      next(error);
    }
  }
}

module.exports = new PelangganController();
