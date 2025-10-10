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

module.exports = Umkm;
