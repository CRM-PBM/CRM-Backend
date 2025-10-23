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
        await t.rollback();
        if (error.name === 'SequelizeUniqueConstraintError' && error.fields.kode_pelanggan) {
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

    const { nama, telepon, email, gender, alamat, level, umkm_id } = data;

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
      umkm_id: umkm_id || pelanggan.umkm_id,
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


}

module.exports = new PelangganService();
