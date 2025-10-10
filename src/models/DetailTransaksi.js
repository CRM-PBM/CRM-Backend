const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Transaksi = require("./Transaksi");
const Produk = require("./Produk");

const DetailTransaksi = sequelize.define("DetailTransaksi", {
  detail_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jumlah: { type: DataTypes.INTEGER, allowNull: false },
  harga_satuan: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(12,2), allowNull: false }
}, {
  tableName: "DETAIL_TRANSAKSI",
  timestamps: false
});

DetailTransaksi.belongsTo(Transaksi, { foreignKey: "transaksi_id" });
Transaksi.hasMany(DetailTransaksi, { foreignKey: "transaksi_id" });

DetailTransaksi.belongsTo(Produk, { foreignKey: "produk_id" });
Produk.hasMany(DetailTransaksi, { foreignKey: "produk_id" });

module.exports = DetailTransaksi;
