const Produk = require('../models/Produk');
const JenisProduk = require('../models/JenisProduk');
const KategorIProduk = require('../models/KategoriProduk');
const { Op } = require('sequelize');
const sequelize = require('../config/database')


class ProdukService {
  async generateKodeProduk(umkmId, jenisProdukId, produkId) {
    const JenisProdukModel = require('../models/JenisProduk');
    const jenisProduk = await JenisProdukModel.findByPk(jenisProdukId, { attributes: ['kode_jenis'] });
    
    // Fallback jika ID Jenis Produk tidak ditemukan atau tidak memiliki kode
    const jenisCode = jenisProduk?.kode_jenis ? String(jenisProduk.kode_jenis).padStart(2, '0') : '00'; 

    const umkmCode = String(umkmId).padStart(2, '0');
    const produkCode = String(produkId).padStart(2, '0'); 

    // Format: PROD0102003
    return `PROD${umkmCode}${jenisCode}${produkCode}`;
  }

  // Get all produk
  async getAllProduk(filters = {}, umkmId) {
    const { page = 1, limit = 10, aktif, search } = filters;
    const offset = (page - 1) * limit;
    
    const where = { umkm_id: umkmId };

    if (aktif !== undefined) where.aktif = aktif === 'true';
    
    if (search) {
      where.nama_produk = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Produk.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['produk_id', 'DESC']],
      includes: [JenisProduk, ]
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

  async getJenisProduk() {
    const JenisProdukModel = require('../models/JenisProduk');
    const list = await JenisProdukModel.findAll({
        attributes: ['jenis_produk_id', 'nama_jenis', 'kode_jenis', 'kategori_id'], 
        include: [require('../models/KategoriProduk')], 
        order: [['nama_jenis', 'ASC']]
    });
    return { success: true, data: list }; 
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
    const { nama_produk, jenis_produk_id, harga, stok, aktif, umkm_id } = data;
    const umkmId = umkm_id;

    if (!nama_produk) {
      throw new Error('Nama produk wajib diisi');
    }
    if (!harga || harga <= 0) {
      throw new Error('Harga harus lebih dari 0');
    }
    if (!umkm_id) {
      throw new Error('UMKM ID wajib diisi');
    }

    if (!jenis_produk_id) {
        throw new Error('Jenis produk wajib diisi'); // Tambahkan validasi ini
    }

    let t;
    try {
        t = await sequelize.transaction();

        // 1. CREATE PRODUK AWAL (Untuk mendapatkan produk_id yang di-auto-generate)
        const produk = await Produk.create({
            nama_produk,
            jenis_produk_id, 
            harga,
            stok: stok || 0,
            aktif: aktif !== undefined ? aktif : true,
            umkm_id
        }, { transaction: t });
        
        const kode_produk = await this.generateKodeProduk(
            umkmId, 
            jenis_produk_id, 
            produk.produk_id 
        );

        await produk.update({ kode_produk }, { transaction: t });

        await t.commit();

        return produk; 

    } catch (error) {
        if (t) await t.rollback();
        throw error;
    }
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
