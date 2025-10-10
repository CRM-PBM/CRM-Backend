const { Transaksi, DetailTransaksi, Pelanggan, Produk, Invoice } = require('../models');
const { Sequelize } = require('sequelize');

// Generate nomor transaksi
const generateNomorTransaksi = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TRX-${year}${month}${day}-${random}`;
};

// Create Transaksi
const createTransaksi = async (req, res) => {
  try {
    const { pelanggan_id, items, metode_pembayaran, keterangan } = req.body;
    
    // Hitung total
    let total = 0;
    const detailItems = [];
    
    for (const item of items) {
      const produk = await Produk.findByPk(item.produk_id);
      if (!produk) {
        return res.status(404).json({ error: `Produk dengan ID ${item.produk_id} tidak ditemukan` });
      }
      
      if (produk.stok < item.quantity) {
        return res.status(400).json({ error: `Stok produk ${produk.nama_produk} tidak mencukupi` });
      }
      
      const subtotal = produk.harga * item.quantity;
      total += subtotal;
      
      detailItems.push({
        produk_id: item.produk_id,
        nama_barang: produk.nama_produk,
        harga_satuan: produk.harga,
        quantity: item.quantity,
        subtotal: subtotal
      });
    }
    
    // Buat transaksi
    const transaksi = await Transaksi.create({
      nomor_transaksi: generateNomorTransaksi(),
      pelanggan_id,
      total,
      metode_pembayaran,
      keterangan
    });
    
    // Buat detail transaksi
    for (const item of detailItems) {
      await DetailTransaksi.create({
        transaksi_id: transaksi.transaksi_id,
        ...item
      });
      
      // Update stok produk
      await Produk.decrement('stok', {
        by: item.quantity,
        where: { produk_id: item.produk_id }
      });
    }
    
    // Buat invoice
    const invoice = await Invoice.create({
      transaksi_id: transaksi.transaksi_id,
      nomor_invoice: `INV-${transaksi.nomor_transaksi}`,
      path_file: `/invoices/${transaksi.transaksi_id}.pdf`
    });
    
    // Get complete transaksi data
    const completeTransaksi = await Transaksi.findByPk(transaksi.transaksi_id, {
      include: [
        {
          model: Pelanggan,
          attributes: ['nama', 'telepon', 'email']
        },
        {
          model: DetailTransaksi,
          include: [Produk]
        },
        {
          model: Invoice
        }
      ]
    });
    
    res.status(201).json({
      message: 'Transaksi berhasil dibuat',
      data: completeTransaksi
    });
    
  } catch (error) {
    console.error('Error creating transaksi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get All Transaksi
const getAllTransaksi = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereCondition = {};
    
    if (search) {
      whereCondition = {
        [Sequelize.Op.or]: [
          { nomor_transaksi: { [Sequelize.Op.like]: `%${search}%` } },
          { '$Pelanggan.nama$': { [Sequelize.Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const transaksis = await Transaksi.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Pelanggan,
          attributes: ['nama', 'telepon']
        },
        {
          model: DetailTransaksi,
          include: [Produk]
        }
      ],
      order: [['tanggal_transaksi', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      data: transaksis.rows,
      total: transaksis.count,
      page: parseInt(page),
      totalPages: Math.ceil(transaksis.count / limit)
    });
    
  } catch (error) {
    console.error('Error getting transaksi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Transaksi by ID
const getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaksi = await Transaksi.findByPk(id, {
      include: [
        {
          model: Pelanggan,
          attributes: ['nama', 'telepon', 'email', 'alamat']
        },
        {
          model: DetailTransaksi,
          include: [Produk]
        },
        {
          model: Invoice
        }
      ]
    });
    
    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    
    res.json({ data: transaksi });
    
  } catch (error) {
    console.error('Error getting transaksi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Transaksi
const updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { metode_pembayaran, keterangan } = req.body;
    
    const transaksi = await Transaksi.findByPk(id);
    
    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    
    await transaksi.update({
      metode_pembayaran,
      keterangan
    });
    
    res.json({ message: 'Transaksi berhasil diupdate', data: transaksi });
    
  } catch (error) {
    console.error('Error updating transaksi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete Transaksi
const deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaksi = await Transaksi.findByPk(id, {
      include: [DetailTransaksi]
    });
    
    if (!transaksi) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    
    // Kembalikan stok produk
    for (const detail of transaksi.DetailTransaksis) {
      await Produk.increment('stok', {
        by: detail.quantity,
        where: { produk_id: detail.produk_id }
      });
    }
    
    // Hapus detail transaksi terlebih dahulu
    await DetailTransaksi.destroy({ where: { transaksi_id: id } });
    
    // Hapus invoice jika ada
    await Invoice.destroy({ where: { transaksi_id: id } });
    
    // Hapus transaksi
    await transaksi.destroy();
    
    res.json({ message: 'Transaksi berhasil dihapus' });
    
  } catch (error) {
    console.error('Error deleting transaksi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  updateTransaksi,
  deleteTransaksi
};