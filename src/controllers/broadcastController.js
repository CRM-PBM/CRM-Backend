const broadcastService = require('../services/broadcastService');
const logger = require('../utils/logger');

class BroadcastController {
  // GET /api/broadcast - Get all broadcast
  async getAllBroadcast(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        search: req.query.search
      };

      const result = await broadcastService.getAllBroadcast(filters);

      res.json({
        success: true,
        message: 'Data broadcast berhasil diambil',
        ...result
      });
    } catch (error) {
      logger.error('Error getAllBroadcast:', error);
      next(error);
    }
  }

  // GET /api/broadcast/:id - Get broadcast by ID
  async getBroadcastById(req, res, next) {
    try {
      const { id } = req.params;
      const broadcast = await broadcastService.getBroadcastById(id);

      res.json({
        success: true,
        message: 'Data broadcast berhasil diambil',
        data: broadcast
      });
    } catch (error) {
      logger.error('Error getBroadcastById:', error);
      if (error.message === 'Broadcast tidak ditemukan') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // POST /api/broadcast - Create new broadcast (draft)
  async createBroadcast(req, res, next) {
    try {
      const broadcast = await broadcastService.createBroadcast(req.body);

      res.status(201).json({
        success: true,
        message: 'Broadcast berhasil dibuat (draft)',
        data: broadcast
      });
    } catch (error) {
      logger.error('Error createBroadcast:', error);
      if (
        error.message.includes('wajib diisi') ||
        error.message.includes('tidak ditemukan') ||
        error.message.includes('Pilih minimal')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // POST /api/broadcast/:id/send - Kirim broadcast
  async sendBroadcast(req, res, next) {
    try {
      const { id } = req.params;
      
      // Kirim broadcast (async)
      const result = await broadcastService.sendBroadcast(id, (progress) => {
        // Optional: Bisa implementasi WebSocket untuk real-time progress
        logger.info(`Progress ${id}: ${progress.current}/${progress.total}`);
      });

      res.json({
        success: true,
        message: 'Broadcast berhasil dikirim',
        data: result
      });
    } catch (error) {
      logger.error('Error sendBroadcast:', error);
      if (
        error.message === 'Broadcast tidak ditemukan' ||
        error.message.includes('tidak ada penerima')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // DELETE /api/broadcast/:id - Delete broadcast
  async deleteBroadcast(req, res, next) {
    try {
      const { id } = req.params;
      const result = await broadcastService.deleteBroadcast(id);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error deleteBroadcast:', error);
      if (
        error.message === 'Broadcast tidak ditemukan' ||
        error.message.includes('sedang diproses')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  }

  // GET /api/broadcast/statistik - Get statistik
  async getStatistik(req, res, next) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const statistik = await broadcastService.getStatistik(filters);

      res.json({
        success: true,
        message: 'Statistik broadcast berhasil diambil',
        data: statistik
      });
    } catch (error) {
      logger.error('Error getStatistik:', error);
      next(error);
    }
  }

  // GET /api/broadcast/device/status - Cek status device WhatsApp
  async checkDeviceStatus(req, res, next) {
    try {
      const status = await broadcastService.checkDeviceStatus();

      res.json({
        success: true,
        message: 'Status device berhasil diambil',
        data: status
      });
    } catch (error) {
      logger.error('Error checkDeviceStatus:', error);
      next(error);
    }
  }
}

module.exports = new BroadcastController();
