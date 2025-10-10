// server/index.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_umkm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Routes
app.get('/api/produk', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT p.*, u.nama_umkm 
      FROM produk p 
      LEFT JOIN umkm u ON p.umkm_id = u.umkm_id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.nama_produk LIKE ? OR p.deskripsi LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.tanggal_input DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching produk:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data produk' });
  }
});

app.post('/api/produk', async (req, res) => {
  try {
    const { nama_produk, harga, deskripsi, stok, satuan } = req.body;
    const umkm_id = 1; // Default UMKM ID

    const [result] = await pool.execute(
      'INSERT INTO produk (umkm_id, nama_produk, harga, deskripsi, stok, satuan) VALUES (?, ?, ?, ?, ?, ?)',
      [umkm_id, nama_produk, harga, deskripsi, stok, satuan]
    );

    const [newProduk] = await pool.execute(
      'SELECT p.*, u.nama_umkm FROM produk p LEFT JOIN umkm u ON p.umkm_id = u.umkm_id WHERE p.produk_id = ?',
      [result.insertId]
    );

    res.json({ success: true, data: newProduk[0] });
  } catch (error) {
    console.error('Error creating produk:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat produk' });
  }
});

app.put('/api/produk/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_produk, harga, deskripsi, stok, satuan } = req.body;

    await pool.execute(
      'UPDATE produk SET nama_produk = ?, harga = ?, deskripsi = ?, stok = ?, satuan = ? WHERE produk_id = ?',
      [nama_produk, harga, deskripsi, stok, satuan, id]
    );

    res.json({ success: true, message: 'Produk berhasil diupdate' });
  } catch (error) {
    console.error('Error updating produk:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate produk' });
  }
});

app.delete('/api/produk/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM produk WHERE produk_id = ?', [id]);

    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting produk:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
  }
});

// Pelanggan Routes
app.get('/api/pelanggan', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT p.*, u.nama_umkm 
      FROM pelanggan p 
      LEFT JOIN umkm u ON p.umkm_id = u.umkm_id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.nama LIKE ? OR p.email LIKE ? OR p.telepon LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching pelanggan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data pelanggan' });
  }
});

app.post('/api/pelanggan', async (req, res) => {
  try {
    const { nama, telepon, email, gender, alamat } = req.body;
    const umkm_id = 1; // Default UMKM ID

    const [result] = await pool.execute(
      'INSERT INTO pelanggan (umkm_id, nama, telepon, email, gender, alamat) VALUES (?, ?, ?, ?, ?, ?)',
      [umkm_id, nama, telepon, email, gender, alamat]
    );

    const [newPelanggan] = await pool.execute(
      'SELECT p.*, u.nama_umkm FROM pelanggan p LEFT JOIN umkm u ON p.umkm_id = u.umkm_id WHERE p.pelanggan_id = ?',
      [result.insertId]
    );

    res.json({ success: true, data: newPelanggan[0] });
  } catch (error) {
    console.error('Error creating pelanggan:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat pelanggan' });
  }
});

app.put('/api/pelanggan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, telepon, email, gender, alamat } = req.body;

    await pool.execute(
      'UPDATE pelanggan SET nama = ?, telepon = ?, email = ?, gender = ?, alamat = ? WHERE pelanggan_id = ?',
      [nama, telepon, email, gender, alamat, id]
    );

    res.json({ success: true, message: 'Pelanggan berhasil diupdate' });
  } catch (error) {
    console.error('Error updating pelanggan:', error);
    res.status(500).json({ success: false, message: 'Gagal mengupdate pelanggan' });
  }
});

app.delete('/api/pelanggan/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM pelanggan WHERE pelanggan_id = ?', [id]);

    res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting pelanggan:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pelanggan' });
  }
});

// Transaksi Routes
app.get('/api/transaksi', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT t.*, p.nama as pelanggan_nama, p.telepon as pelanggan_telepon, p.email as pelanggan_email,
             u.nama_umkm 
      FROM transaksi t 
      LEFT JOIN pelanggan p ON t.pelanggan_id = p.pelanggan_id 
      LEFT JOIN umkm u ON t.umkm_id = u.umkm_id 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (t.nomor_transaksi LIKE ? OR p.nama LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY t.tanggal_transaksi DESC';

    const [rows] = await pool.execute(query, params);

    // Get detail transaksi for each transaction
    const transaksisWithDetails = await Promise.all(
      rows.map(async (transaksi) => {
        const [details] = await pool.execute(
          'SELECT * FROM detail_transaksi WHERE transaksi_id = ?',
          [transaksi.transaksi_id]
        );
        
        return {
          ...transaksi,
          Pelanggan: transaksi.pelanggan_id ? {
            nama: transaksi.pelanggan_nama,
            telepon: transaksi.pelanggan_telepon,
            email: transaksi.pelanggan_email
          } : null,
          DetailTransaksis: details
        };
      })
    );

    res.json({ success: true, data: transaksisWithDetails });
  } catch (error) {
    console.error('Error fetching transaksi:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data transaksi' });
  }
});

app.post('/api/transaksi', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { pelanggan_id, items, metode_pembayaran, keterangan } = req.body;
    const umkm_id = 1; // Default UMKM ID

    // Generate transaction number
    const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const nomor_transaksi = `TRX-${date}-${random}`;

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Insert transaction
    const [transaksiResult] = await connection.execute(
      'INSERT INTO transaksi (umkm_id, nomor_transaksi, pelanggan_id, total, metode_pembayaran, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [umkm_id, nomor_transaksi, pelanggan_id, total, metode_pembayaran, keterangan]
    );

    const transaksi_id = transaksiResult.insertId;

    // Insert transaction details and update product stock
    for (const item of items) {
      // Insert detail
      await connection.execute(
        'INSERT INTO detail_transaksi (transaksi_id, produk_id, nama_barang, harga_satuan, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [transaksi_id, item.produk_id, item.nama_barang, item.harga_satuan, item.quantity, item.subtotal]
      );

      // Update product stock
      await connection.execute(
        'UPDATE produk SET stok = stok - ? WHERE produk_id = ?',
        [item.quantity, item.produk_id]
      );
    }

    // Get complete transaction data
    const [transaksi] = await connection.execute(
      `SELECT t.*, p.nama as pelanggan_nama, p.telepon as pelanggan_telepon, p.email as pelanggan_email 
       FROM transaksi t 
       LEFT JOIN pelanggan p ON t.pelanggan_id = p.pelanggan_id 
       WHERE t.transaksi_id = ?`,
      [transaksi_id]
    );

    const [details] = await connection.execute(
      'SELECT * FROM detail_transaksi WHERE transaksi_id = ?',
      [transaksi_id]
    );

    await connection.commit();

    const newTransaksi = {
      ...transaksi[0],
      Pelanggan: transaksi[0].pelanggan_id ? {
        nama: transaksi[0].pelanggan_nama,
        telepon: transaksi[0].pelanggan_telepon,
        email: transaksi[0].pelanggan_email
      } : null,
      DetailTransaksis: details
    };

    res.json({ success: true, data: newTransaksi });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating transaksi:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi' });
  } finally {
    connection.release();
  }
});

app.delete('/api/transaksi/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get transaction details to restore stock
    const [details] = await connection.execute(
      'SELECT * FROM detail_transaksi WHERE transaksi_id = ?',
      [id]
    );

    // Restore product stock
    for (const detail of details) {
      await connection.execute(
        'UPDATE produk SET stok = stok + ? WHERE produk_id = ?',
        [detail.quantity, detail.produk_id]
      );
    }

    // Delete transaction (cascade will delete details)
    await connection.execute('DELETE FROM transaksi WHERE transaksi_id = ?', [id]);

    await connection.commit();

    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting transaksi:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus transaksi' });
  } finally {
    connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});