const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Umkm = require("./Umkm");

const WaBlastLog = sequelize.define("WaBlastLog", {
  wa_blast_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  umkm_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "UMKM", key: "umkm_id" } },
  broadcast_id: { type: DataTypes.STRING(50), allowNull: false },
  phone_number: { type: DataTypes.STRING(20), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "sent", "failed"), defaultValue: "pending" },
  tanggal_kirim: { type: DataTypes.DATE, allowNull: true },
  error: { type: DataTypes.TEXT, allowNull: true },
  media_url: { type: DataTypes.STRING(255), allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "WA_BLAST_LOG",
  timestamps: false
});

WaBlastLog.belongsTo(Umkm, { foreignKey: "umkm_id", as: "umkm" });
Umkm.hasMany(WaBlastLog, { foreignKey: "umkm_id", as: "wa_blasts" });

module.exports = WaBlastLog;
