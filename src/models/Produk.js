const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Produk = sequelize.define("Produk", {
  produk_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama_produk: { type: DataTypes.STRING(100), allowNull: false },
  harga: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  stok: { type: DataTypes.INTEGER, defaultValue: 0 },
  aktif: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: "PRODUK",
  timestamps: false
});

module.exports = Produk;
