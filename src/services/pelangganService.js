const { Op } = require('sequelize');
const Pelanggan = require('../models/Pelanggan');
const Umkm = require('../models/Umkm');

const sequelize = require('../config/database')


class PelangganService {

  getMonthDateRange(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  async generateKodePelanggan(umkmId, gender) {
    const GENDER_CODES = {
        "Pria": '01',
        "Wanita": '02',
    };

    const umkmCode = String(umkmId).padStart(2, '0');
    const genderCode = GENDER_CODES[gender] || '00'; 

    // Cari ID pelanggan terakhir di seluruh tabel untuk sequence
    const lastPelanggan = await Pelanggan.findOne({
        order: [['pelanggan_id', 'DESC']],
        limit: 1,
    });

    const nextId = (lastPelanggan ? lastPelanggan.pelanggan_id : 0) + 1;
    const sequenceCode = String(nextId).padStart(3, '0');

    // Format: PEL0101004
    return `PEL${umkmCode}${genderCode}${sequenceCode}`;
  } 

  // Get all pelanggan dengan pagination dan filter
  async getAllPelanggan(filters = {}, umkmId) {
    const { page = 1, limit = 10, umkm_id, level, gender, search } = filters;
    const offset = (page - 1) * limit;

    const where = { umkm_id: umkmId };

    if (umkm_id) where.umkm_id = umkm_id;
    if (level) where.level = level;
    if (gender) where.gender = gender;
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { telepon: { [Op.like]: `%${search}%` } },
        { alamat: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Pelanggan.findAndCountAll({
      where,
      include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Get pelanggan by ID
  async getPelangganById(id, umkm_id) {
    const where = { pelanggan_id: id };
    
    // Filter berdasarkan umkm_id untuk keamanan
    if (umkm_id) {
      where.umkm_id = umkm_id;
    }
    
    const pelanggan = await Pelanggan.findOne({
      where,
      include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }]
    });

    if (!pelanggan) {
      throw new Error('Pelanggan tidak ditemukan');
    }

    return pelanggan;
  }

  // Create pelanggan baru
  async createPelanggan(data) {
    const { nama, telepon, email, gender, alamat, level, umkm_id } = data;

    if (!nama) throw new Error('Nama pelanggan wajib diisi');

    if (email) {
      const existingEmail = await Pelanggan.findOne({ where: { email } });
      if (existingEmail) throw new Error('Email sudah terdaftar');
    }

    let t;
    try {
      t = await sequelize.transaction();

      const kode_pelanggan = await this.generateKodePelanggan(umkm_id, gender);
      const pelanggan = await Pelanggan.create({
        nama,
        telepon,
        email,
        gender,
        alamat,
        level,
        umkm_id,
        kode_pelanggan
      }, { transaction: t });

      await t.commit();
      return this.getPelangganById(pelanggan.pelanggan_id);

    } catch (error) {
      if (t) await t.rollback();
      if (error.name === 'SequelizeUniqueConstraintError' && error.fields && error.fields.kode_pelanggan) {
        throw new Error('Gagal membuat kode pelanggan unik. Coba lagi.');
      }
      throw error;
    }
  }

  // Update pelanggan
  async updatePelanggan(id, data, umkm_id) {
    const where = { pelanggan_id: id };
    
    // Filter berdasarkan umkm_id untuk keamanan
    if (umkm_id) {
      where.umkm_id = umkm_id;
    }
    
  const pelanggan = await Pelanggan.findOne({ where });

  if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');

  // Ambil umkm_id dari body sebagai newUmkmId untuk menghindari redeclare
  const { nama, telepon, email, gender, alamat, level, umkm_id: newUmkmId } = data;

    if (email && email !== pelanggan.email) {
      const existingEmail = await Pelanggan.findOne({ where: { email } });
      if (existingEmail) throw new Error('Email sudah terdaftar');
    }

    await pelanggan.update({
      nama: nama || pelanggan.nama,
      telepon: telepon !== undefined ? telepon : pelanggan.telepon,
      email: email !== undefined ? email : pelanggan.email,
      gender: gender || pelanggan.gender,
      level: level !== undefined ? level : pelanggan.level,
      alamat: alamat !== undefined ? alamat : pelanggan.alamat,
      umkm_id: newUmkmId || pelanggan.umkm_id,
      updated_at: new Date()
    });

    return this.getPelangganById(id, umkm_id);
  }

  // Delete pelanggan
  async deletePelanggan(id, umkm_id) {
    const where = { pelanggan_id: id };
    
    // Filter berdasarkan umkm_id untuk keamanan
    if (umkm_id) {
      where.umkm_id = umkm_id;
    }
    
    const pelanggan = await Pelanggan.findOne({ where });

    if (!pelanggan) throw new Error('Pelanggan tidak ditemukan');

    await pelanggan.destroy();
    return { message: 'Pelanggan berhasil dihapus' };
  }

  // Get pelanggan by UMKM
  async getPelangganByUmkm(umkm_id, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const { count, rows } = await Pelanggan.findAndCountAll({
      where: { umkm_id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  // Statistik pelanggan per UMKM
  async getStatistik(umkmId) {
    const today = new Date();
    const { start: startOfMonth, end: endOfMonth } = this.getMonthDateRange(today);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const umkmWhere = { umkm_id: umkmId };

    // Total pelanggan keseluruhan
    const total = await Pelanggan.count({ where: umkmWhere });

    // Pelanggan baru bulan ini
    const baruBulanIni = await Pelanggan.count({
      where: {
        ...umkmWhere,
        created_at: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    });

    // Pelanggan baru bulan lalu
    const baruBulanLalu = await Pelanggan.count({
      where: {
        ...umkmWhere,
        created_at: { [Op.between]: [lastMonthStart, lastMonthEnd] },
      },
    });

    // Hitung pertumbuhan (%)
    let pertumbuhan = 0;
    if (baruBulanLalu > 0) {
      pertumbuhan = ((baruBulanIni - baruBulanLalu) / baruBulanLalu) * 100;
    } else if (baruBulanIni > 0) {
      pertumbuhan = 100;
    }

    return {
      total,
      baru_bulan_ini: baruBulanIni,
      pertumbuhan: parseFloat(pertumbuhan.toFixed(1)),
    };
  }

  /**
   * Import pelanggan dari file CSV atau Excel
   */
  async importPelangganFromFile(file, umkmId) {
    const results = [];
    const errors = [];
    let successful = 0;
    let failed = 0;

    try {
      let rows = [];

      // Parse file based on extension
      if (file.originalname.endsWith('.csv')) {
        rows = this.parseCSV(file.buffer.toString('utf-8'));
      } else if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        rows = this.parseExcel(file.buffer);
      } else {
        throw new Error('Format file tidak didukung. Gunakan CSV atau Excel (.xlsx, .xls)');
      }

      if (rows.length === 0) {
        throw new Error('File kosong atau format tidak valid');
      }

      // Process each row
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const rowNumber = rowIndex + 2; // +2 karena header di baris 1

        try {
          // Validasi required fields: nama dan telepon
          if (!row.nama || !row.telepon) {
            errors.push({
              row: rowNumber,
              error: 'Nama dan Telepon wajib diisi',
              data: row
            });
            failed++;
            continue;
          }

          // Normalize data
          const pelangganData = {
            nama: row.nama.trim(),
            telepon: this.formatPhoneNumber(row.telepon.trim()),
            email: row.email ? row.email.trim() : null,
            alamat: row.alamat ? row.alamat.trim() : null,
            gender: row.gender && ['Pria', 'Wanita'].includes(row.gender.trim()) 
              ? row.gender.trim() 
              : null,
            level: row.level ? row.level.trim() : null,
            umkm_id: umkmId
          };

          // Validasi nomor telepon
          if (!this.isValidPhoneNumber(pelangganData.telepon)) {
            errors.push({
              row: rowNumber,
              error: 'Format nomor telepon tidak valid',
              data: row
            });
            failed++;
            continue;
          }

          // Check if pelanggan dengan nomor telepon yang sama sudah ada
          const existingPelanggan = await Pelanggan.findOne({
            where: {
              telepon: pelangganData.telepon,
              umkm_id: umkmId
            }
          });

          if (existingPelanggan) {
            errors.push({
              row: rowNumber,
              error: `Nomor telepon ${pelangganData.telepon} sudah terdaftar`,
              data: row
            });
            failed++;
            continue;
          }

          // Generate kode pelanggan
          pelangganData.kode_pelanggan = await this.generateKodePelanggan(umkmId, pelangganData.gender);

          // Create pelanggan
          const newPelanggan = await Pelanggan.create(pelangganData);

          results.push({
            row: rowNumber,
            status: 'success',
            pelanggan_id: newPelanggan.pelanggan_id,
            kode_pelanggan: newPelanggan.kode_pelanggan,
            nama: newPelanggan.nama,
            telepon: newPelanggan.telepon
          });

          successful++;
        } catch (rowError) {
          failed++;
          errors.push({
            row: rowNumber,
            error: rowError.message,
            data: row
          });
        }
      }

      return {
        total_rows: rows.length,
        successful,
        failed,
        errors,
        results
      };
    } catch (error) {
      throw new Error(`Error saat import file: ${error.message}`);
    }
  }

  /**
   * Parse CSV file
   */
  parseCSV(csvString) {
    const lines = csvString.trim().split('\n');
    
    if (lines.length < 2) {
      return [];
    }

    // Get header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      // Handle quoted fields
      const values = this.parseCSVLine(line);
      
      if (values.length > 0) {
        const row = {};
        header.forEach((col, index) => {
          row[col] = values[index] ? values[index].trim() : '';
        });
        rows.push(row);
      }
    }

    return rows;
  }

  /**
   * Parse single CSV line handling quoted values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Parse Excel file
   */
  parseExcel(buffer) {
    try {
      const XLSX = require('xlsx');
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      // Normalize keys to lowercase
      return rows.map(row => {
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        });
        return normalizedRow;
      });
    } catch (error) {
      throw new Error(`Error parsing Excel: ${error.message}`);
    }
  }

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let formatted = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 62
    if (formatted.startsWith('0')) {
      formatted = '62' + formatted.substring(1);
    }
    
    // If doesn't start with 62, add it
    if (!formatted.startsWith('62')) {
      formatted = '62' + formatted;
    }
    
    return formatted;
  }

  /**
   * Validate Indonesian phone number
   */
  isValidPhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    // Indonesian phone: 62 + 8-11 digits
    return /^628\d{8,11}$/.test(formatted);
  }


}

module.exports = new PelangganService();
