const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Transaksi = require("./Transaksi");

const Invoice = sequelize.define("Invoice", {
  invoice_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nomor_invoice: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  tanggal_cetak: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  path_file: { type: DataTypes.STRING(200) }
}, {
  tableName: "INVOICE",
  timestamps: false
});

Invoice.belongsTo(Transaksi, { foreignKey: "transaksi_id" });
Transaksi.hasOne(Invoice, { foreignKey: "transaksi_id" });

module.exports = Invoice;
