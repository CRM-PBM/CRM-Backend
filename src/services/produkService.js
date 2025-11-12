const Produk = require('../models/Produk');
const JenisProduk = require('../models/JenisProduk');
const { Op } = require('sequelize');
const sequelize = require('../config/database');


class ProdukService {
  async generateKodeProduk(umkmId, jenisProdukId, produkId) {
    const JenisProdukModel = require('../models/JenisProduk');
    const jenisProduk = await JenisProdukModel.findByPk(jenisProdukId, { attributes: ['jenis_produk_id'] });
    
    const jenisCode = jenisProduk?.jenis_produk_id ? String(jenisProduk.jenis_produk_id).padStart(2, '0') : '00'; 

    const umkmCode = String(umkmId).padStart(2, '0');
    const produkCode = String(produkId).padStart(2, '0'); 

    return `PROD${umkmCode}${jenisCode}${produkCode}`;
  }

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
      include: [{ model: JenisProduk, attributes: ['jenis_produk_id', 'nama_jenis'] }] 
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
        attributes: ['jenis_produk_id', 'nama_jenis', 'kategori_id'], 
        include: [require('../models/KategoriProduk')], 
        order: [['nama_jenis', 'ASC']]
    });
    return { success: true, data: list };
  }

  async getProdukById(id) {
    const produk = await Produk.findByPk(id);
    if (!produk) {
      throw new Error('Produk tidak ditemukan');
    }
    return produk;
  }

  async createProduk(data) {
    const { nama_produk, jenis_produk_id, harga, stok, aktif, umkm_id } = data;
    const umkmId = umkm_id;

    if (!nama_produk) {
      throw new Error('Nama produk wajib diisi');
    }
    if (!harga || harga <= 0) {
      throw new Error('Harga harus lebih dari 0');
    }

    if (!jenis_produk_id) {
        throw new Error('Jenis produk wajib diisi'); 
    }

    let t;
    try {
        t = await sequelize.transaction();

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

  async deleteProduk(id) {
    const produk = await Produk.findByPk(id);
    if (!produk) {
      throw new Error('Produk tidak ditemukan');
    }

    await produk.destroy();
    return { message: 'Produk berhasil dihapus' };
  }

  async getStatistics(umkmId) {
    try {
      const totalProduk = await Produk.count({ where: { umkm_id: umkmId } });
      const produkAktif = await Produk.count({ where: { umkm_id: umkmId, aktif: true } });
      const totalStok = await Produk.sum('stok', { where: { umkm_id: umkmId } });
      const nilaiInventoriResult = await Produk.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.literal('stok * harga')), 'nilai_inventori']
        ],
        where: { umkm_id: umkmId },
        raw: true
      });

      const nilaiInventori = nilaiInventoriResult?.nilai_inventori || 0;

      return {
        success: true,
        data: {
          total_produk: totalProduk || 0,
          produk_aktif: produkAktif || 0,
          total_stok: totalStok || 0,
          nilai_inventori: nilaiInventori || 0
        }
      };
    } catch (error) {
      console.error("🔥 Error di produkService.getStatistics:", error);
      throw error;
    }
  }

  async toggleActive(id, umkmId) {
    const produk = await Produk.findOne({
        where: { produk_id: id, umkm_id: umkmId },
      attributes: ['aktif', 'produk_id']
    });

    if (!produk) {
        throw new Error('Produk tidak ditemukan atau tidak berhak diakses');
    };
    
    const newStatus = !produk.aktif;
    
    await Produk.update(
        { aktif: newStatus },
        { 
          where: { 
              produk_id: id, 
              umkm_id: umkmId
          } 
        }
    );
    return { produk_id: id, aktif: newStatus };
  }
}

module.exports = new ProdukService();