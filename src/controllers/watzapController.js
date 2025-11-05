const Umkm = require('../models/Umkm');
const watzapService = require('../services/watzapService');
const logger = require('../utils/logger');

class WatzapController {
  /**
   * Get Watzap number key untuk UMKM
   */
  async getNumberKey(req, res, next) {
    const umkmId = req.umkmId;

    try {
      const umkm = await Umkm.findByPk(umkmId, {
        attributes: ['umkm_id', 'wa_number_key']
      });

      if (!umkm) {
        return res.status(404).json({
          success: false,
          message: 'UMKM tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: {
          umkm_id: umkm.umkm_id,
          wa_number_key: umkm.wa_number_key || null,
          is_configured: !!umkm.wa_number_key
        }
      });
    } catch (error) {
      logger.error('Error getNumberKey:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Set/Update Watzap number key untuk UMKM
   */
  async setNumberKey(req, res, next) {
    const umkmId = req.umkmId;
    const { wa_number_key } = req.body;

    try {
      // Validasi input
      if (!wa_number_key || wa_number_key.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Number key tidak boleh kosong'
        });
      }

      // Cari UMKM
      const umkm = await Umkm.findByPk(umkmId);
      if (!umkm) {
        return res.status(404).json({
          success: false,
          message: 'UMKM tidak ditemukan'
        });
      }

      // Update number key
      await umkm.update({
        wa_number_key: wa_number_key.trim()
      });

      logger.info(`Watzap number key updated for UMKM ${umkmId}`);

      res.json({
        success: true,
        message: 'Watzap number key berhasil diperbarui',
        data: {
          umkm_id: umkm.umkm_id,
          wa_number_key: umkm.wa_number_key
        }
      });
    } catch (error) {
      logger.error('Error setNumberKey:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete/Clear Watzap number key untuk UMKM
   */
  async clearNumberKey(req, res, next) {
    const umkmId = req.umkmId;

    try {
      const umkm = await Umkm.findByPk(umkmId);
      if (!umkm) {
        return res.status(404).json({
          success: false,
          message: 'UMKM tidak ditemukan'
        });
      }

      await umkm.update({
        wa_number_key: null
      });

      logger.info(`Watzap number key cleared for UMKM ${umkmId}`);

      res.json({
        success: true,
        message: 'Watzap number key berhasil dihapus'
      });
    } catch (error) {
      logger.error('Error clearNumberKey:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check Watzap device status untuk UMKM
   */
  async checkDeviceStatus(req, res, next) {
    const umkmId = req.umkmId;

    try {
      const umkm = await Umkm.findByPk(umkmId, {
        attributes: ['umkm_id', 'wa_number_key']
      });

      if (!umkm) {
        return res.status(404).json({
          success: false,
          message: 'UMKM tidak ditemukan'
        });
      }

      // Check device status dengan number key dari database UMKM
      const status = await watzapService.checkDeviceStatus(umkm.wa_number_key);

      res.json({
        success: true,
        data: {
          umkm_id: umkm.umkm_id,
          is_configured: !!umkm.wa_number_key,
          device_status: status
        }
      });
    } catch (error) {
      logger.error('Error checkDeviceStatus:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new WatzapController();
