const { Transaksi, DetailTransaksi, Pelanggan, Produk, Invoice } = require('../models');

// Generate nomor transaksi
function generateNomorTransaksi() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TRX-${year}${month}${day}-${random}`;
}

// Create Transaksi
exports.createTransaksi = async (req, res) => {
  const transaction = await require('../models').sequelize.transaction();
  
  try {
    const { pelanggan_id, items, metode_pembayaran, keterangan } = req.body;
    
    // Validasi input
    if (!pelanggan_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Data tidak lengkap. Pastikan pelanggan_id dan items diisi' 
      });
    }
    
    // Hitung total dan validasi stok
    let total = 0;
    const detailItems = [];
    
    for (const item of items) {
      const produk = await Produk.findByPk(item.produk_id);
      if (!produk) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: `Produk dengan ID ${item.produk_id} tidak ditemukan` 
        });
      }
      
      if (produk.stok < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Stok produk ${produk.nama_produk} tidak mencukupi. Stok tersedia: ${produk.stok}` 
        });
      }
      
      const subtotal = parseFloat(produk.harga) * parseInt(item.quantity);
      total += subtotal;
      
      detailItems.push({
        produk_id: item.produk_id,
        nama_barang: produk.nama_produk,
        harga_satuan: parseFloat(produk.harga),
        quantity: parseInt(item.quantity),
        subtotal: subtotal
      });
    }
    
    // Buat transaksi
    const transaksi = await Transaksi.create({
      nomor_transaksi: generateNomorTransaksi(),
      pelanggan_id: parseInt(pelanggan_id),
      total: total,
      metode_pembayaran: metode_pembayaran || 'Cash',
      keterangan: keterangan || ''
    }, { transaction });
    
    // Buat detail transaksi
    for (const item of detailItems) {
      await DetailTransaksi.create({
        transaksi_id: transaksi.transaksi_id,
        ...item
      }, { transaction });
      
      // Update stok produk
      await Produk.decrement('stok', {
        by: item.quantity,
        where: { produk_id: item.produk_id },
        transaction
      });
    }
    
    // Buat invoice
    await Invoice.create({
      transaksi_id: transaksi.transaksi_id,
      nomor_invoice: `INV-${transaksi.nomor_transaksi}`,
      path_file: `/invoices/${transaksi.transaksi_id}.pdf`
    }, { transaction });
    
    // Commit transaction
    await transaction.commit();
    
    // Get complete transaksi data
    const completeTransaksi = await Transaksi.findByPk(transaksi.transaksi_id, {
      include: [
        {
          model: Pelanggan,
          attributes: ['pelanggan_id', 'nama', 'telepon', 'email']
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
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: completeTransaksi
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating transaksi:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    });
  }
};

// Get All Transaksi
exports.getAllTransaksi = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereCondition = search ? {
      '$Pelanggan.nama$': { 
        [require('sequelize').Op.like]: `%${search}%` 
      }
    } : {};
    
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
      success: true,
      data: transaksis.rows,
      total: transaksis.count,
      page: parseInt(page),
      totalPages: Math.ceil(transaksis.count / limit)
    });
    
  } catch (error) {
    console.error('Error getting transaksi:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get Transaksi by ID
exports.getTransaksiById = async (req, res) => {
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
      return res.status(404).json({ 
        success: false,
        error: 'Transaksi tidak ditemukan' 
      });
    }
    
    res.json({ 
      success: true,
      data: transaksi 
    });
    
  } catch (error) {
    console.error('Error getting transaksi:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Update Transaksi
exports.updateTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { metode_pembayaran, keterangan } = req.body;
    
    const transaksi = await Transaksi.findByPk(id);
    
    if (!transaksi) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaksi tidak ditemukan' 
      });
    }
    
    await transaksi.update({
      metode_pembayaran: metode_pembayaran || transaksi.metode_pembayaran,
      keterangan: keterangan || transaksi.keterangan
    });
    
    res.json({ 
      success: true,
      message: 'Transaksi berhasil diupdate', 
      data: transaksi 
    });
    
  } catch (error) {
    console.error('Error updating transaksi:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Delete Transaksi
exports.deleteTransaksi = async (req, res) => {
  const transaction = await require('../models').sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const transaksi = await Transaksi.findByPk(id, {
      include: [DetailTransaksi]
    });
    
    if (!transaksi) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaksi tidak ditemukan' 
      });
    }
    
    // Kembalikan stok produk
    for (const detail of transaksi.DetailTransaksis) {
      await Produk.increment('stok', {
        by: detail.quantity,
        where: { produk_id: detail.produk_id },
        transaction
      });
    }
    
    // Hapus detail transaksi
    await DetailTransaksi.destroy({ 
      where: { transaksi_id: id },
      transaction 
    });
    
    // Hapus invoice
    await Invoice.destroy({ 
      where: { transaksi_id: id },
      transaction 
    });
    
    // Hapus transaksi
    await transaksi.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ 
      success: true,
      message: 'Transaksi berhasil dihapus' 
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting transaksi:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};