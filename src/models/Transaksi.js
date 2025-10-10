const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Pelanggan = require("./Pelanggan");

const Transaksi = sequelize.define("Transaksi", {
  transaksi_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nomor_transaksi: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  tanggal_transaksi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  metode_pembayaran: { type: DataTypes.STRING(50) },
  keterangan: { type: DataTypes.STRING(255) }
}, {
  tableName: "TRANSAKSI",
  timestamps: false
});

Transaksi.belongsTo(Pelanggan, { foreignKey: "pelanggan_id" });
Pelanggan.hasMany(Transaksi, { foreignKey: "pelanggan_id" });

module.exports = Transaksi;
