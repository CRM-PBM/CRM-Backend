const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Broadcast = sequelize.define("Broadcast", {
  broadcast_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  judul_pesan: { type: DataTypes.STRING(200), allowNull: false },
  isi_pesan: { type: DataTypes.TEXT, allowNull: false },
  tanggal_kirim: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(50) }
}, {
  tableName: "broadcast",
  timestamps: false
});

Broadcast.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Broadcast, { foreignKey: "user_id" });

module.exports = Broadcast;
