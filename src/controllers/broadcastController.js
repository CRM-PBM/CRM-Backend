const broadcastService = require('../services/broadcastService');
const logger = require('../utils/logger');
const { generateImageUrl } = require('../middleware/uploadBroadcastImage');

class BroadcastController {
  // GET /api/broadcast - Get all broadcast
  async getAllBroadcast(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        umkm_id: req.umkm_id, // Dari JWT token
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
      // Auto-assign umkm_id dari user yang login
      const data = {
        ...req.body,
        umkm_id: req.umkmId // Dari JWT token
      };
      
      const broadcast = await broadcastService.createBroadcast(data);

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
        error.message.includes('Pilih minimal') ||
        error.message.includes('URL gambar tidak valid')
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
        umkm_id: req.umkmId, // Dari JWT token
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
      // Pass umkmId ke service untuk get number key dari database
      const status = await broadcastService.checkDeviceStatus(req.umkmId);

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

  // POST /api/broadcast/upload-image - Upload gambar broadcast
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File gambar tidak ditemukan. Kirim dengan form-data key "image"'
        });
      }

      // Generate public URL dari uploaded file
      const imageUrl = generateImageUrl(req.file);

      logger.info('Image uploaded:', {
        filename: req.file.filename,
        size: req.file.size,
        url: imageUrl
      });

      res.status(201).json({
        success: true,
        message: 'Gambar berhasil diupload',
        data: {
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
          image_url: imageUrl
        }
      });
    } catch (error) {
      logger.error('Error uploadImage:', error);
      
      if (error.message && error.message.includes('format tidak didukung')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ukuran file terlalu besar. Max 5MB.'
        });
      }

      next(error);
    }
  }
}

module.exports = new BroadcastController();
