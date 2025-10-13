const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class WatzapService {
  constructor() {
    this.apiUrl = config.watzap.apiUrl;
    this.apiKey = config.watzap.apiKey;
    this.numberKey = config.watzap.numberKey;
    
    // Setup axios instance dengan default config
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      maxBodyLength: Infinity
    });
  }

  /**
   * Cek status device/koneksi WhatsApp
   */
  async checkDeviceStatus() {
    try {
      // Watzap.id tidak memiliki endpoint cek status
      // Return success jika API key dan number key ada
      if (!this.apiKey || !this.numberKey) {
        return {
          success: false,
          connected: false,
          error: 'API Key atau Number Key tidak dikonfigurasi'
        };
      }

      return {
        success: true,
        connected: true,
        message: 'Watzap.id ready (API Key & Number Key configured)'
      };
    } catch (error) {
      logger.error('Watzap checkDeviceStatus error:', error.message);
      return {
        success: false,
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Kirim pesan WhatsApp ke satu nomor
   * @param {string} phoneNumber - Nomor telepon (format: 628xxx)
   * @param {string} message - Isi pesan
   */
  async sendMessage(phoneNumber, message) {
    try {
      // Validasi API Key dan Number Key
      if (!this.apiKey || !this.numberKey) {
        throw new Error('API Key atau Number Key tidak dikonfigurasi');
      }

      // Format nomor telepon (hapus karakter non-digit)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Validasi nomor telepon
      if (!this.isValidPhoneNumber(formattedPhone)) {
        throw new Error(`Nomor telepon tidak valid: ${phoneNumber}`);
      }

      // Kirim request sesuai dokumentasi Watzap.id
      const payload = {
        api_key: this.apiKey,
        number_key: this.numberKey,
        phone_no: formattedPhone,
        message: message
      };

      logger.info('Sending message to:', formattedPhone);
      
      const response = await this.client.post('/send_message', payload);

      logger.info('Watzap response:', response.data);

      return {
        success: true,
        data: response.data,
        message: 'Pesan berhasil dikirim'
      };
    } catch (error) {
      logger.error('Watzap sendMessage error:', error.message);
      if (error.response) {
        logger.error('Response data:', error.response.data);
        logger.error('Response status:', error.response.status);
      }
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Kirim pesan broadcast ke multiple nomor
   * @param {Array} phoneNumbers - Array nomor telepon
   * @param {string} message - Isi pesan
   * @param {Function} progressCallback - Callback untuk update progress
   */
  async sendBroadcast(phoneNumbers, message, progressCallback = null) {
    const results = {
      total: phoneNumbers.length,
      success: 0,
      failed: 0,
      details: []
    };

    const delayMs = config.broadcast.delayMs;

    for (let i = 0; i < phoneNumbers.length; i++) {
      const phone = phoneNumbers[i];
      
      try {
        const result = await this.sendMessage(phone, message);
        
        if (result.success) {
          results.success++;
          results.details.push({
            phone,
            status: 'success',
            message: 'Terkirim'
          });
        } else {
          results.failed++;
          results.details.push({
            phone,
            status: 'failed',
            message: result.error
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          phone,
          status: 'failed',
          message: error.message
        });
      }

      // Progress callback
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: phoneNumbers.length,
          phone,
          success: results.success,
          failed: results.failed
        });
      }

      // Delay antar pesan untuk menghindari rate limit
      if (i < phoneNumbers.length - 1) {
        await this.delay(delayMs);
      }
    }

    return results;
  }

  /**
   * Format nomor telepon ke format internasional (628xxx)
   * @param {string} phone - Nomor telepon
   */
  formatPhoneNumber(phone) {
    // Hapus karakter non-digit
    let formatted = phone.replace(/\D/g, '');
    
    // Jika diawali 0, ganti dengan 62
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1);
    }
    
    // Jika tidak diawali 62, tambahkan 62
    if (!formatted.startsWith('62')) {
      formatted = '62' + formatted;
    }
    
    return formatted;
  }

  /**
   * Validasi nomor telepon Indonesia
   * @param {string} phone - Nomor telepon
   */
  isValidPhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    // Nomor Indonesia: 62 + 8-11 digit
    return /^628\d{8,11}$/.test(formatted);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get QR Code untuk pairing device (jika belum terkoneksi)
   */
  async getQRCode() {
    try {
      const response = await this.client.get('/device/qr');
      return {
        success: true,
        qrCode: response.data.qr_code,
        data: response.data
      };
    } catch (error) {
      logger.error('Watzap getQRCode error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WatzapService();
