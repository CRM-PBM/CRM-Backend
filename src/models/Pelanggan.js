const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Umkm = require("./Umkm");

const Pelanggan = sequelize.define("Pelanggan", {
  pelanggan_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  kode_pelanggan: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  nama: { type: DataTypes.STRING(100), allowNull: false },
  telepon: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100) },
  alamat: { type: DataTypes.TEXT }, 
  gender: { type: DataTypes.ENUM("Pria", "Wanita") },
  level: { type: DataTypes.STRING(50) },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "PELANGGAN",
  timestamps: false
});

Pelanggan.belongsTo(Umkm, { foreignKey: "umkm_id" });
Umkm.hasMany(Pelanggan, { foreignKey: "umkm_id" });

module.exports = Pelanggan;
