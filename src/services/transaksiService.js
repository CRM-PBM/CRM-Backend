const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Transaksi = require('../models/Transaksi');
const DetailTransaksi = require('../models/DetailTransaksi');
const Pelanggan = require('../models/Pelanggan');
const Produk = require('../models/Produk');
const Invoice = require('../models/Invoice');

class TransaksiService {
  // Generate nomor transaksi otomatis
  async generateNomorTransaksi() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Format: TRX-YYYYMMDD-XXXX
    const prefix = `TRX-${year}${month}${day}`;
    
    // Cari transaksi terakhir hari ini
    const lastTransaction = await Transaksi.findOne({
      where: {
        nomor_transaksi: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['transaksi_id', 'DESC']]
    });

    let sequence = 1;
    if (lastTransaction) {
      const lastNumber = lastTransaction.nomor_transaksi.split('-')[2];
      sequence = parseInt(lastNumber) + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  // Get all transaksi dengan pagination dan filter
  async getAllTransaksi(filters = {}) {
    const { 
      page = 1, 
      limit = 10,
      umkm_id, 
      pelanggan_id, 
      metode_pembayaran,
      start_date,
      end_date,
      search 
    } = filters;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Filter berdasarkan UMKM (PENTING untuk data isolation)
    if (umkm_id) where.umkm_id = umkm_id;
    
    if (pelanggan_id) where.pelanggan_id = pelanggan_id;
    if (metode_pembayaran) where.metode_pembayaran = metode_pembayaran;
    
    if (start_date && end_date) {
      where.tanggal_transaksi = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      where.tanggal_transaksi = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      where.tanggal_transaksi = {
        [Op.lte]: new Date(end_date)
      };
    }

    if (search) {
      where[Op.or] = [
        { nomor_transaksi: { [Op.like]: `%${search}%` } },
        { keterangan: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Transaksi.findAndCountAll({
      where,
      include: [
        { 
          model: Pelanggan, 
          attributes: ['pelanggan_id', 'nama', 'telepon', 'email'] 
        },
        {
          model: DetailTransaksi,
          include: [
            {
              model: Produk,
              attributes: ['produk_id', 'nama_produk', 'harga']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_transaksi', 'DESC']]
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

  // Get transaksi by ID
  async getTransaksiById(id) {
    const transaksi = await Transaksi.findByPk(id, {
      include: [
        { 
          model: Pelanggan, 
          attributes: ['pelanggan_id', 'nama', 'telepon', 'email'] 
        },
        {
          model: DetailTransaksi,
          include: [
            {
              model: Produk,
              attributes: ['produk_id', 'nama_produk', 'harga']
            }
          ]
        },
        {
          model: Invoice,
          attributes: ['invoice_id', 'nomor_invoice', 'tanggal_cetak', 'path_file']
        }
      ]
    });

    if (!transaksi) {
      throw new Error('Transaksi tidak ditemukan');
    }

    return transaksi;
  }

  // Create new transaksi dengan detail items
  async createTransaksi(data) {
    const { pelanggan_id, items, metode_pembayaran, keterangan, umkm_id } = data;

    // Validasi
    if (!items || items.length === 0) {
      throw new Error('Items transaksi wajib diisi');
    }

    // Validasi umkm_id (PENTING untuk data isolation)
    if (!umkm_id) {
      throw new Error('UMKM ID wajib diisi');
    }

    // Mulai transaction database
    const t = await sequelize.transaction();

    try {
      // Generate nomor transaksi
      const nomor_transaksi = await this.generateNomorTransaksi();

      // Validasi produk dan hitung total
      let total = 0;
      const validatedItems = [];

      for (const item of items) {
        const produk = await Produk.findByPk(item.produk_id, { transaction: t });
        
        if (!produk) {
          throw new Error(`Produk dengan ID ${item.produk_id} tidak ditemukan`);
        }

        if (!produk.aktif) {
          throw new Error(`Produk ${produk.nama_produk} tidak aktif`);
        }

        if (produk.stok < item.jumlah) {
          throw new Error(`Stok produk ${produk.nama_produk} tidak mencukupi. Stok tersedia: ${produk.stok}`);
        }

        const harga_satuan = item.harga_satuan || produk.harga;
        const subtotal = parseFloat(harga_satuan) * parseInt(item.jumlah);
        
        validatedItems.push({
          produk_id: item.produk_id,
          jumlah: item.jumlah,
          harga_satuan: harga_satuan,
          subtotal: subtotal
        });

        total += subtotal;

        // Update stok produk
        await produk.update(
          { stok: produk.stok - item.jumlah },
          { transaction: t }
        );
      }

      // Create transaksi
      const transaksi = await Transaksi.create({
        nomor_transaksi,
        pelanggan_id,
        tanggal_transaksi: new Date(),
        total,
        metode_pembayaran,
        keterangan,
        umkm_id // PENTING untuk data isolation
      }, { transaction: t });

      // Create detail transaksi
      for (const item of validatedItems) {
        await DetailTransaksi.create({
          transaksi_id: transaksi.transaksi_id,
          ...item
        }, { transaction: t });
      }

      await t.commit();

      return this.getTransaksiById(transaksi.transaksi_id);

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Update transaksi
  async updateTransaksi(id, data) {
    const transaksi = await Transaksi.findByPk(id);

    if (!transaksi) {
      throw new Error('Transaksi tidak ditemukan');
    }

    const { metode_pembayaran, keterangan, pelanggan_id } = data;

    await transaksi.update({
      metode_pembayaran: metode_pembayaran || transaksi.metode_pembayaran,
      keterangan: keterangan !== undefined ? keterangan : transaksi.keterangan,
      pelanggan_id: pelanggan_id || transaksi.pelanggan_id
    });

    return this.getTransaksiById(id);
  }

  // Delete transaksi
  async deleteTransaksi(id) {
    const t = await sequelize.transaction();

    try {
      const transaksi = await Transaksi.findByPk(id, {
        include: [DetailTransaksi],
        transaction: t
      });

      if (!transaksi) {
        throw new Error('Transaksi tidak ditemukan');
      }

      // Kembalikan stok produk
      for (const detail of transaksi.DetailTransaksis) {
        const produk = await Produk.findByPk(detail.produk_id, { transaction: t });
        if (produk) {
          await produk.update(
            { stok: produk.stok + detail.jumlah },
            { transaction: t }
          );
        }
      }

      // Delete detail transaksi
      await DetailTransaksi.destroy({
        where: { transaksi_id: id },
        transaction: t
      });

      // Delete invoice jika ada
      await Invoice.destroy({
        where: { transaksi_id: id },
        transaction: t
      });

      // Delete transaksi
      await transaksi.destroy({ transaction: t });

      await t.commit();

      return { message: 'Transaksi berhasil dihapus' };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Get transaksi by pelanggan
  async getTransaksiByPelanggan(pelanggan_id, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaksi.findAndCountAll({
      where: { pelanggan_id },
      include: [
        {
          model: DetailTransaksi,
          include: [
            {
              model: Produk,
              attributes: ['produk_id', 'nama_produk', 'harga']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['tanggal_transaksi', 'DESC']]
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

  // Get statistik transaksi
  async getStatistik(filters = {}) {
    const { umkm_id, start_date, end_date } = filters;
    const where = {};

    // Filter berdasarkan UMKM (PENTING untuk data isolation)
    if (umkm_id) where.umkm_id = umkm_id;

    if (start_date && end_date) {
      where.tanggal_transaksi = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const totalTransaksi = await Transaksi.count({ where });
    const totalPendapatan = await Transaksi.sum('total', { where });

    const topProducts = await DetailTransaksi.findAll({
      attributes: [
        'produk_id',
        [sequelize.fn('SUM', sequelize.col('jumlah')), 'total_terjual'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'total_pendapatan']
      ],
      include: [
        {
          model: Transaksi,
          attributes: [],
          where
        },
        {
          model: Produk,
          attributes: ['nama_produk']
        }
      ],
      group: ['produk_id'],
      order: [[sequelize.fn('SUM', sequelize.col('jumlah')), 'DESC']],
      limit: 5
    });

    return {
      total_transaksi: totalTransaksi,
      total_pendapatan: totalPendapatan || 0,
      top_products: topProducts
    };
  }
}

module.exports = new TransaksiService();
