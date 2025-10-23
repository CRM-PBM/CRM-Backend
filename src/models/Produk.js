const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const JenisProduk = require("./JenisProduk");
const Umkm = require("./Umkm");

const Produk = sequelize.define("Produk", {
  produk_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama_produk: { type: DataTypes.STRING(50), allowNull: false },
  kode_produk: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  jenis_produk_id: { type: DataTypes.INTEGER, allowNull: false },
  harga: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  stok: { type: DataTypes.INTEGER, defaultValue: 0 },
  umkm_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'UMKM',
      key: 'umkm_id'
    }
  },
  aktif: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: "PRODUK",
  timestamps: false
});

// Relasi dengan JenisProduk
Produk.belongsTo(JenisProduk, { foreignKey: "jenis_produk_id" });
JenisProduk.hasMany(Produk, { foreignKey: "jenis_produk_id" });

// Relasi dengan UMKM
Produk.belongsTo(Umkm, { foreignKey: "umkm_id", as: 'umkm' });
Umkm.hasMany(Produk, { foreignKey: "umkm_id", as: 'produk' });

module.exports = Produk;
