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
   * @param {string} numberKey - Number key dari database UMKM (optional, default dari config)
   */
  async checkDeviceStatus(numberKey = null) {
    try {
      // Gunakan number key dari parameter, fallback ke config
      const actualNumberKey = numberKey || this.numberKey;

      // Watzap.id tidak memiliki endpoint cek status
      // Return success jika API key dan number key ada
      if (!this.apiKey || !actualNumberKey) {
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
   * @param {string} numberKey - Number key dari database UMKM (optional, default dari config)
   */
  async sendMessage(phoneNumber, message, numberKey = null) {
    try {
      // Gunakan number key dari parameter, fallback ke config
      const actualNumberKey = numberKey || this.numberKey;

      // Validasi API Key dan Number Key
      if (!this.apiKey || !actualNumberKey) {
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
        number_key: actualNumberKey,
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
   * Kirim pesan WhatsApp dengan gambar ke satu nomor
   * Format sesuai dokumentasi Watzap.id yang valid
   * 
   * @param {string} phoneNumber - Nomor telepon (format: 628xxx)
   * @param {string} imageUrl - URL gambar PUBLIC (HTTP/HTTPS) - Watzap.id akan download dari URL ini
   * @param {string} caption - Caption/pesan pada gambar (optional)
   * @param {string} numberKey - Number key dari database UMKM (optional, default dari config)
   * @param {number} separateCaption - Pisah caption dari gambar (0=no, 1=yes, default=1)
   */
  async sendImage(phoneNumber, imageUrl, caption = '', numberKey = null, separateCaption = 1) {
    try {
      // Gunakan number key dari parameter, fallback ke config
      const actualNumberKey = numberKey || this.numberKey;

      // Validasi API Key dan Number Key
      if (!this.apiKey || !actualNumberKey) {
        throw new Error('API Key atau Number Key tidak dikonfigurasi');
      }

      // Format nomor telepon (hapus karakter non-digit)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Validasi nomor telepon
      if (!this.isValidPhoneNumber(formattedPhone)) {
        throw new Error(`Nomor telepon tidak valid: ${phoneNumber}`);
      }

      // Validasi URL gambar - PENTING: URL harus PUBLIC dan accessible oleh Watzap.id server
      if (!imageUrl || !this.isValidImageUrl(imageUrl)) {
        throw new Error('URL gambar tidak valid. Gunakan HTTP/HTTPS URL PUBLIC yang dapat diakses dari internet.');
      }

      // ✅ FORMAT YANG BENAR dari dokumentasi Watzap.id:
      // Semua field dari dokumentasi resmi:
      // - api_key: authentication
      // - number_key: sender identity
      // - phone_no: recipient number
      // - url: PUBLIC image URL (Watzap server will download)
      // - message: caption text
      // - separate_caption: STRING "0" atau "1" (BUKAN number!) - 0=gabung, 1=pisah
      // 
      // PENTING: separate_caption HARUS string, bukan number!
      // Verified: separate_caption: "0" works! ✅
      const payload = {
        api_key: this.apiKey,
        number_key: actualNumberKey,
        phone_no: formattedPhone,
        url: imageUrl,                         // ✅ Image URL PUBLIC
        message: caption || '',                // ✅ Caption text
        separate_caption: String(separateCaption) // ✅ CONVERT to STRING!
      };

      logger.info('📤 Sending image to:', formattedPhone);
      logger.info('🖼️  Image URL:', imageUrl);
      logger.info('💬 Caption:', caption);
      logger.info('🔀 Separate Caption:', separateCaption);
      logger.info('📋 Payload:', JSON.stringify(payload, null, 2));
      
      // ✅ GUNAKAN /send_image_url endpoint khusus untuk mengirim gambar
      // Endpoint ini HARUS digunakan ketika ada URL gambar
      const response = await this.client.post('/send_image_url', payload);

      logger.info('✅ Watzap image response:', response.data);
      logger.info('📊 Watzap response status:', response.status);

      if (response.data.status === '200' || response.data.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Gambar berhasil dikirim'
        };
      } else {
        return {
          success: false,
          data: response.data,
          error: response.data.message || 'Gagal mengirim gambar'
        };
      }
    } catch (error) {
      logger.error('❌ Watzap sendImage error:', error.message);
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
   * Kirim pesan broadcast dengan gambar ke multiple nomor
   * @param {Array} phoneNumbers - Array nomor telepon
   * @param {string} imageUrl - URL gambar
   * @param {string} caption - Caption/pesan pada gambar
   * @param {Function} progressCallback - Callback untuk update progress
   */
  async sendImageBroadcast(phoneNumbers, imageUrl, caption = '', progressCallback = null) {
    const results = {
      total: phoneNumbers.length,
      success: 0,
      failed: 0,
      details: []
    };

    const delayMs = config.broadcast.delayMs;

    // Validasi URL gambar terlebih dahulu
    if (!this.isValidImageUrl(imageUrl)) {
      throw new Error('URL gambar tidak valid. Gunakan HTTP/HTTPS URL.');
    }

    for (let i = 0; i < phoneNumbers.length; i++) {
      const phone = phoneNumbers[i];
      
      try {
        const result = await this.sendImage(phone, imageUrl, caption);
        
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
   * Validasi URL gambar
   * @param {string} url - URL untuk divalidasi
   */
  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      // Hanya terima HTTP dan HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // ✅ IMPROVED: Support URL tanpa extension (CDN modern seperti Unsplash, Imgur, dll)
      // Cek extension jika ada, tapi jangan reject jika tidak ada
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const pathname = urlObj.pathname.toLowerCase();
      
      // Jika punya extension yang valid, OK
      if (validExtensions.some(ext => pathname.endsWith(ext))) {
        return true;
      }
      
      // Jika tidak punya extension tapi terlihat seperti gambar path (Unsplash, CDN, dll), OK
      // Indikator: punya query params (Unsplash, Imgur) atau path yang reasonable
      if (urlObj.search || urlObj.hostname.includes('unsplash') || 
          urlObj.hostname.includes('imgur') || urlObj.hostname.includes('cloudinary') ||
          urlObj.hostname.includes('cdn')) {
        return true;
      }
      
      // Default: jika punya extension valid, accept; otherwise reject
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch (error) {
      return false;
    }
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
