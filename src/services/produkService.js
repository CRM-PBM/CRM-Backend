const Produk = require('../models/Produk');
const { Op } = require('sequelize');

class ProdukService {
  // Get all produk
  async getAllProduk(filters = {}) {
    const { page = 1, limit = 10, aktif, search } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (aktif !== undefined) where.aktif = aktif === 'true';
    
    if (search) {
      where.nama_produk = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Produk.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['produk_id', 'DESC']]
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

  // Get produk by ID
  async getProdukById(id) {
    const produk = await Produk.findByPk(id);
    if (!produk) {
      throw new Error('Produk tidak ditemukan');
    }
    return produk;
  }

  // Create produk
  async createProduk(data) {
    const { nama_produk, harga, stok, aktif } = data;

    if (!nama_produk) {
      throw new Error('Nama produk wajib diisi');
    }
    if (!harga || harga <= 0) {
      throw new Error('Harga harus lebih dari 0');
    }

    const produk = await Produk.create({
      nama_produk,
      harga,
      stok: stok || 0,
      aktif: aktif !== undefined ? aktif : true
    });

    return produk;
  }

  // Update produk
  async updateProduk(id, data) {
    const produk = await Produk.findByPk(id);
    if (!produk) {
      throw new Error('Produk tidak ditemukan');
    }

    const { nama_produk, harga, stok, aktif } = data;

    await produk.update({
      nama_produk: nama_produk || produk.nama_produk,
      harga: harga !== undefined ? harga : produk.harga,
      stok: stok !== undefined ? stok : produk.stok,
      aktif: aktif !== undefined ? aktif : produk.aktif
    });

    return produk;
  }

  // Delete produk
  async deleteProduk(id) {
    const produk = await Produk.findByPk(id);
    if (!produk) {
      throw new Error('Produk tidak ditemukan');
    }

    await produk.destroy();
    return { message: 'Produk berhasil dihapus' };
  }
}

module.exports = new ProdukService();
