const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Broadcast = require('../models/Broadcast');
const BroadcastDetail = require('../models/BroadcastDetail');
const Pelanggan = require('../models/Pelanggan');
const Umkm = require('../models/Umkm');
const watzapService = require('./watzapService');
const logger = require('../utils/logger');

class BroadcastService {
  // Get all broadcast
  async getAllBroadcast(filters = {}) {
    const { page = 1, limit = 10, umkm_id, status, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Filter berdasarkan UMKM (PENTING untuk data isolation)
    if (umkm_id) where.umkm_id = umkm_id;
    
    if (status) where.status = status;
    
    if (search) {
      where[Op.or] = [
        { judul_pesan: { [Op.like]: `%${search}%` } },
        { isi_pesan: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Broadcast.findAndCountAll({
      where,
      include: [
        {
          model: BroadcastDetail,
          include: [
            {
              model: Pelanggan,
              attributes: ['pelanggan_id', 'nama', 'telepon']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_kirim', 'DESC']]
    });

    // Hitung statistik untuk setiap broadcast
    const dataWithStats = rows.map(broadcast => {
      const broadcastJson = broadcast.toJSON();
      const details = broadcastJson.BroadcastDetails || [];
      
      broadcastJson.stats = {
        total_penerima: details.length,
        terkirim: details.filter(d => d.status === 'sent').length,
        pending: details.filter(d => d.status === 'pending').length,
        gagal: details.filter(d => d.status === 'failed').length
      };
      
      return broadcastJson;
    });

    return {
      data: dataWithStats,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Get broadcast by ID
  async getBroadcastById(id) {
    const broadcast = await Broadcast.findByPk(id, {
      include: [
        {
          model: BroadcastDetail,
          include: [
            {
              model: Pelanggan,
              attributes: ['pelanggan_id', 'nama', 'telepon', 'email']
            }
          ]
        }
      ]
    });

    if (!broadcast) {
      throw new Error('Broadcast tidak ditemukan');
    }

    const broadcastJson = broadcast.toJSON();
    const details = broadcastJson.BroadcastDetails || [];
    
    broadcastJson.stats = {
      total_penerima: details.length,
      terkirim: details.filter(d => d.status === 'sent').length,
      pending: details.filter(d => d.status === 'pending').length,
      gagal: details.filter(d => d.status === 'failed').length
    };

    return broadcastJson;
  }

  // Create broadcast (draft)
  async createBroadcast(data) {
    const { judul_pesan, isi_pesan, pelanggan_ids, user_id, umkm_id } = data;

    // Validasi
    if (!judul_pesan) {
      throw new Error('Judul pesan wajib diisi');
    }
    if (!isi_pesan) {
      throw new Error('Isi pesan wajib diisi');
    }
    if (!pelanggan_ids || pelanggan_ids.length === 0) {
      throw new Error('Pilih minimal 1 pelanggan penerima');
    }

    const t = await sequelize.transaction();

    try {
      // Create broadcast
      const broadcast = await Broadcast.create({
        judul_pesan,
        isi_pesan,
        tanggal_kirim: new Date(),
        status: 'draft',
        user_id: user_id || null,
        umkm_id // Auto-assign dari token
      }, { transaction: t });

      // Validasi pelanggan dan create broadcast detail
      for (const pelanggan_id of pelanggan_ids) {
        const pelanggan = await Pelanggan.findByPk(pelanggan_id, { transaction: t });
        
        if (!pelanggan) {
          throw new Error(`Pelanggan dengan ID ${pelanggan_id} tidak ditemukan`);
        }

        if (!pelanggan.telepon) {
          logger.info(`Pelanggan ${pelanggan.nama} tidak memiliki nomor telepon, dilewati`);
          continue;
        }

        // Validasi nomor telepon
        if (!watzapService.isValidPhoneNumber(pelanggan.telepon)) {
          logger.info(`Nomor telepon ${pelanggan.telepon} tidak valid, dilewati`);
          continue;
        }

        await BroadcastDetail.create({
          broadcast_id: broadcast.broadcast_id,
          pelanggan_id: pelanggan_id,
          tanggal_kirim: new Date(),
          status: 'pending'
        }, { transaction: t });
      }

      await t.commit();

      return this.getBroadcastById(broadcast.broadcast_id);

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Kirim broadcast (execute)
  async sendBroadcast(id, progressCallback = null) {
    const broadcast = await Broadcast.findByPk(id, {
      include: [
        {
          model: BroadcastDetail,
          where: { status: 'pending' },
          required: false,
          include: [
            {
              model: Pelanggan,
              attributes: ['pelanggan_id', 'nama', 'telepon']
            }
          ]
        }
      ]
    });

    if (!broadcast) {
      throw new Error('Broadcast tidak ditemukan');
    }

    // Ambil UMKM untuk mendapatkan number_key
    const umkm = await Umkm.findByPk(broadcast.umkm_id, {
      attributes: ['umkm_id', 'wa_number_key']
    });

    if (!umkm) {
      throw new Error('UMKM tidak ditemukan');
    }

    if (!umkm.wa_number_key) {
      throw new Error('Number key Watzap.id belum dikonfigurasi untuk UMKM ini. Silakan set number key terlebih dahulu.');
    }

    const details = broadcast.BroadcastDetails || [];
    
    if (details.length === 0) {
      throw new Error('Tidak ada penerima dengan status pending');
    }

    // Update status broadcast menjadi sending
    await broadcast.update({ status: 'sending' });

    // Kirim pesan ke setiap pelanggan
    const results = {
      total: details.length,
      success: 0,
      failed: 0,
      details: []
    };

    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      const pelanggan = detail.Pelanggan;

      try {
        // Personalisasi pesan (ganti placeholder)
        const personalizedMessage = this.personalizeMessage(
          broadcast.isi_pesan,
          pelanggan
        );

        // Kirim via Watzap dengan number_key dari database UMKM
        const result = await watzapService.sendMessage(
          pelanggan.telepon,
          personalizedMessage,
          umkm.wa_number_key
        );

        if (result.success) {
          // Update status detail menjadi sent
          await detail.update({
            status: 'sent',
            tanggal_kirim: new Date()
          });
          
          results.success++;
          results.details.push({
            pelanggan_id: pelanggan.pelanggan_id,
            nama: pelanggan.nama,
            telepon: pelanggan.telepon,
            status: 'sent'
          });
        } else {
          // Update status detail menjadi failed
          await detail.update({
            status: 'failed'
          });
          
          results.failed++;
          results.details.push({
            pelanggan_id: pelanggan.pelanggan_id,
            nama: pelanggan.nama,
            telepon: pelanggan.telepon,
            status: 'failed',
            error: result.error
          });
        }

      } catch (error) {
        logger.error(`Error sending to ${pelanggan.nama}:`, error);
        
        await detail.update({
          status: 'failed'
        });
        
        results.failed++;
        results.details.push({
          pelanggan_id: pelanggan.pelanggan_id,
          nama: pelanggan.nama,
          telepon: pelanggan.telepon,
          status: 'failed',
          error: error.message
        });
      }

      // Progress callback
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: details.length,
          pelanggan: pelanggan.nama,
          success: results.success,
          failed: results.failed
        });
      }

      // Delay untuk menghindari rate limit
      if (i < details.length - 1) {
        await watzapService.delay(1000);
      }
    }

    // Update status broadcast
    const finalStatus = results.failed === 0 ? 'completed' : 
                        results.success === 0 ? 'failed' : 'partial';
    
    await broadcast.update({ status: finalStatus });

    return {
      broadcast_id: id,
      status: finalStatus,
      results
    };
  }

  // Personalisasi pesan dengan data pelanggan
  personalizeMessage(message, pelanggan) {
    let personalized = message;
    
    // Replace placeholders
    personalized = personalized.replace(/\{nama\}/gi, pelanggan.nama || '');
    personalized = personalized.replace(/\{telepon\}/gi, pelanggan.telepon || '');
    personalized = personalized.replace(/\{email\}/gi, pelanggan.email || '');
    
    return personalized;
  }

  // Delete broadcast
  async deleteBroadcast(id) {
    const broadcast = await Broadcast.findByPk(id);

    if (!broadcast) {
      throw new Error('Broadcast tidak ditemukan');
    }

    // Cek status, tidak bisa hapus yang sedang sending
    if (broadcast.status === 'sending') {
      throw new Error('Tidak dapat menghapus broadcast yang sedang diproses');
    }

    const t = await sequelize.transaction();

    try {
      // Delete broadcast details
      await BroadcastDetail.destroy({
        where: { broadcast_id: id },
        transaction: t
      });

      // Delete broadcast
      await broadcast.destroy({ transaction: t });

      await t.commit();

      return { message: 'Broadcast berhasil dihapus' };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Get statistik broadcast
  async getStatistik(filters = {}) {
    const { umkm_id, start_date, end_date } = filters;
    const where = {};

    // Filter berdasarkan UMKM (PENTING untuk data isolation)
    if (umkm_id) where.umkm_id = umkm_id;

    if (start_date && end_date) {
      where.tanggal_kirim = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const totalBroadcast = await Broadcast.count({ where });
    
    const totalPenerima = await BroadcastDetail.count({
      include: [{
        model: Broadcast,
        where,
        attributes: []
      }]
    });

    const terkirim = await BroadcastDetail.count({
      where: { status: 'sent' },
      include: [{
        model: Broadcast,
        where,
        attributes: []
      }]
    });

    const gagal = await BroadcastDetail.count({
      where: { status: 'failed' },
      include: [{
        model: Broadcast,
        where,
        attributes: []
      }]
    });

    return {
      total_broadcast: totalBroadcast,
      total_penerima: totalPenerima,
      terkirim,
      gagal,
      success_rate: totalPenerima > 0 ? ((terkirim / totalPenerima) * 100).toFixed(2) : 0
    };
  }

  // Cek status device WhatsApp
  async checkDeviceStatus(umkmId) {
    try {
      // Fetch UMKM untuk get wa_number_key dari database
      if (umkmId) {
        const Umkm = require('../models/Umkm');
        const umkm = await Umkm.findByPk(umkmId, {
          attributes: ['umkm_id', 'wa_number_key']
        });

        if (umkm && umkm.wa_number_key) {
          // Use number key dari database
          return await watzapService.checkDeviceStatus(umkm.wa_number_key);
        }
      }

      // Fallback: gunakan number key dari config
      return await watzapService.checkDeviceStatus();
    } catch (error) {
      logger.error('Error checking device status:', error);
      return {
        success: false,
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = new BroadcastService();
