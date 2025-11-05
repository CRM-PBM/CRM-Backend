const pelangganService = require('../services/pelangganService');
const logger = require('../utils/logger');

class PelangganController {

  async getAllPelanggan(req, res, next) {
    const umkmId = req.umkmId;
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        umkm_id: req.query.umkm_id,
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
    const umkmId = req.umkmId;
    try {
      const { id } = req.params;
      const pelanggan = await pelangganService.getPelangganById(id, umkmId);

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
    const umkmId = req.umkmId;
    try {
      const { id } = req.params;
      const pelanggan = await pelangganService.updatePelanggan(id, req.body, umkmId);

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
    const umkmId = req.umkmId;
    try {
      const { id } = req.params;
      const result = await pelangganService.deletePelanggan(id, umkmId);

      res.json({
        success: true,
        ...result
      });
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

  /**
   * Import pelanggan dari CSV atau Excel
   */
  async importPelanggan(req, res, next) {
    const umkmId = req.umkmId;

    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File tidak ditemukan. Silakan upload file CSV atau Excel'
        });
      }

      // Call service untuk import
      const result = await pelangganService.importPelangganFromFile(
        req.file,
        umkmId
      );

      res.json({
        success: true,
        message: `Import berhasil! ${result.successful} pelanggan berhasil ditambahkan`,
        data: {
          total_rows: result.total_rows,
          successful: result.successful,
          failed: result.failed,
          errors: result.errors.length > 0 ? result.errors : undefined,
          results: result.results
        }
      });
    } catch (error) {
      logger.error('Error importPelanggan:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get template CSV untuk import
   */
  async getImportTemplate(req, res, next) {
    try {
      const template = `nama,telepon,email,alamat,gender,level
Budi Santoso,628123456789,budi@example.com,Jl. Raya No. 1,Pria,Regular
Siti Nurhaliza,628987654321,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="template_pelanggan.csv"');
      res.send(template);
    } catch (error) {
      logger.error('Error getImportTemplate:', error);
      next(error);
    }
  }
}

module.exports = new PelangganController();
