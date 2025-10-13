const produkService = require('../services/produkService');
const logger = require('../utils/logger');

class ProdukController {
  async getAllProduk(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        aktif: req.query.aktif,
        search: req.query.search
      };

      const result = await produkService.getAllProduk(filters);
      res.json({
        success: true,
        message: 'Data produk berhasil diambil',
        ...result
      });
    } catch (error) {
      logger.error('Error getAllProduk:', error);
      next(error);
    }
  }

  async getProdukById(req, res, next) {
    try {
      const { id } = req.params;
      const produk = await produkService.getProdukById(id);
      res.json({
        success: true,
        message: 'Data produk berhasil diambil',
        data: produk
      });
    } catch (error) {
      logger.error('Error getProdukById:', error);
      if (error.message === 'Produk tidak ditemukan') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async createProduk(req, res, next) {
    try {
      const produk = await produkService.createProduk(req.body);
      res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan',
        data: produk
      });
    } catch (error) {
      logger.error('Error createProduk:', error);
      if (error.message.includes('wajib diisi') || error.message.includes('harus lebih dari')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async updateProduk(req, res, next) {
    try {
      const { id } = req.params;
      const produk = await produkService.updateProduk(id, req.body);
      res.json({
        success: true,
        message: 'Produk berhasil diupdate',
        data: produk
      });
    } catch (error) {
      logger.error('Error updateProduk:', error);
      if (error.message === 'Produk tidak ditemukan') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  async deleteProduk(req, res, next) {
    try {
      const { id } = req.params;
      const result = await produkService.deleteProduk(id);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error deleteProduk:', error);
      if (error.message === 'Produk tidak ditemukan') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = new ProdukController();
