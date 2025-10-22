const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Umkm = sequelize.define("Umkm", {
  umkm_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama_umkm: { type: DataTypes.STRING(100), allowNull: false },
  nama_pemilik: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true },
  telepon: { type: DataTypes.STRING(20) },
  alamat: { type: DataTypes.TEXT },
  tanggal_daftar: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "UMKM",
  timestamps: false
});

// Asosiasi dengan model lain
Umkm.associate = function(models) {
  // Umkm memiliki banyak Produk
  Umkm.hasMany(models.Produk, {
    foreignKey: 'umkm_id',
    as: 'produk'
  });
  
  // Umkm memiliki banyak Pelanggan
  Umkm.hasMany(models.Pelanggan, {
    foreignKey: 'umkm_id',
    as: 'pelanggan'
  });
  
  // Umkm memiliki banyak Transaksi
  Umkm.hasMany(models.Transaksi, {
    foreignKey: 'umkm_id',
    as: 'transaksi'
  });
  
  // Umkm memiliki banyak Broadcast
  Umkm.hasMany(models.Broadcast, {
    foreignKey: 'umkm_id',
    as: 'broadcast'
  });
  
  // Umkm memiliki banyak User
  Umkm.hasMany(models.User, {
    foreignKey: 'umkm_id',
    as: 'users'
  });
};

module.exports = Umkm;
