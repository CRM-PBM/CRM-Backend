const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Broadcast = require("./Broadcast");
const Pelanggan = require("./Pelanggan");

const BroadcastDetail = sequelize.define("BroadcastDetail", {
  broadcast_detail_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tanggal_kirim: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(50), defaultValue: "pending" }
}, {
  tableName: "BROADCAST_DETAIL",
  timestamps: false
});

BroadcastDetail.belongsTo(Broadcast, { foreignKey: "broadcast_id" });
Broadcast.hasMany(BroadcastDetail, { foreignKey: "broadcast_id" });

BroadcastDetail.belongsTo(Pelanggan, { foreignKey: "pelanggan_id" });
Pelanggan.hasMany(BroadcastDetail, { foreignKey: "pelanggan_id" });

module.exports = BroadcastDetail;
