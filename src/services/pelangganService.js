const { Op } = require('sequelize');
const Pelanggan = require('../models/Pelanggan');
const Umkm = require('../models/Umkm');

class PelangganService {
  // Get all pelanggan dengan pagination dan filter
  async getAllPelanggan(filters = {}) {
    const { page = 1, limit = 10, umkm_id, level, gender, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    
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
  async getPelangganById(id) {
    const pelanggan = await Pelanggan.findByPk(id, {
      include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }]
    });

    if (!pelanggan) {
      throw new Error('Pelanggan tidak ditemukan');
    }

    return pelanggan;
  }

  // Create new pelanggan
  async createPelanggan(data) {
    const { nama, telepon, email, gender, alamat, level, umkm_id } = data;

    // Validasi data wajib
    if (!nama) {
      throw new Error('Nama pelanggan wajib diisi');
    }

    // Cek apakah email sudah terdaftar
    if (email) {
      const existingEmail = await Pelanggan.findOne({ where: { email } });
      if (existingEmail) {
        throw new Error('Email sudah terdaftar');
      }
    }

    const pelanggan = await Pelanggan.create({
      nama,
      telepon,
      email,
      gender,
      alamat,
      level,
      umkm_id
    });

    return this.getPelangganById(pelanggan.pelanggan_id);
  }

  // Update pelanggan
  async updatePelanggan(id, data) {
    const pelanggan = await Pelanggan.findByPk(id);

    if (!pelanggan) {
      throw new Error('Pelanggan tidak ditemukan');
    }

    const { nama, telepon, email, gender, alamat, level, umkm_id } = data;

    // Cek email jika diubah
    if (email && email !== pelanggan.email) {
      const existingEmail = await Pelanggan.findOne({ where: { email } });
      if (existingEmail) {
        throw new Error('Email sudah terdaftar'); 
      }
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

    return this.getPelangganById(id);
  }

  // Delete pelanggan
  async deletePelanggan(id) {
    const pelanggan = await Pelanggan.findByPk(id);

    if (!pelanggan) {
      throw new Error('Pelanggan tidak ditemukan');
    }

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
}

module.exports = new PelangganService();
