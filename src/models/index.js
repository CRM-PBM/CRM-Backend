const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Define models
const UMKM = sequelize.define('UMKM', {
  umkm_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_umkm: {
    type: DataTypes.STRING(101),
    allowNull: false
  },
  nama_pemilik: {
    type: DataTypes.STRING(101),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  telepon: DataTypes.STRING(50),
  alamat: DataTypes.STRING(255),
  tanggal_daftar: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'umkm',
  timestamps: false
});

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  umkm_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'umkm'),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_login: DataTypes.DATE,
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user',
  timestamps: false
});

const Pelanggan = sequelize.define('Pelanggan', {
  pelanggan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  umkm_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nama: {
    type: DataTypes.STRING(101),
    allowNull: false
  },
  telepon: DataTypes.STRING(15),
  email: DataTypes.STRING(100),
  gender: DataTypes.ENUM('Pria', 'Wanita'),
  alamat: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pelanggan',
  timestamps: false
});

const Produk = sequelize.define('Produk', {
  produk_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_produk: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  harga: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  deskripsi: DataTypes.STRING(255),
  stok: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'produk',
  timestamps: false
});

const Transaksi = sequelize.define('Transaksi', {
  transaksi_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nomor_transaksi: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  tanggal_transaksi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  pelanggan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  metode_pembayaran: DataTypes.STRING(50),
  keterangan: DataTypes.STRING(255)
}, {
  tableName: 'transaksi',
  timestamps: false
});

const DetailTransaksi = sequelize.define('DetailTransaksi', {
  detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaksi_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  produk_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nama_barang: DataTypes.STRING(101),
  harga_satuan: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'detail_transaksi',
  timestamps: false
});

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaksi_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nomor_invoice: {
    type: DataTypes.STRING(50),
    unique: true
  },
  tanggal_cetak: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  path_file: DataTypes.STRING(255)
}, {
  tableName: 'invoice',
  timestamps: false
});

// Define associations
UMKM.hasMany(User, { foreignKey: 'umkm_id' });
User.belongsTo(UMKM, { foreignKey: 'umkm_id' });

UMKM.hasMany(Pelanggan, { foreignKey: 'umkm_id' });
Pelanggan.belongsTo(UMKM, { foreignKey: 'umkm_id' });

Pelanggan.hasMany(Transaksi, { foreignKey: 'pelanggan_id' });
Transaksi.belongsTo(Pelanggan, { foreignKey: 'pelanggan_id' });

Transaksi.hasMany(DetailTransaksi, { foreignKey: 'transaksi_id' });
DetailTransaksi.belongsTo(Transaksi, { foreignKey: 'transaksi_id' });

Produk.hasMany(DetailTransaksi, { foreignKey: 'produk_id' });
DetailTransaksi.belongsTo(Produk, { foreignKey: 'produk_id' });

Transaksi.hasOne(Invoice, { foreignKey: 'transaksi_id' });
Invoice.belongsTo(Transaksi, { foreignKey: 'transaksi_id' });

module.exports = {
  sequelize,
  UMKM,
  User,
  Pelanggan,
  Produk,
  Transaksi,
  DetailTransaksi,
  Invoice
};