const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Broadcast = sequelize.define("Broadcast", {
  broadcast_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  judul_pesan: { type: DataTypes.STRING(200), allowNull: false },
  isi_pesan: { type: DataTypes.TEXT, allowNull: false },
  image_url: { 
    type: DataTypes.TEXT, 
    allowNull: true,
    comment: 'URL gambar untuk attachment (jika ada)'
  },
  tanggal_kirim: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(50) },
  umkm_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, // NOT NULL setelah data di-migrate
    references: {
      model: 'UMKM',
      key: 'umkm_id'
    }
  }
}, {
  tableName: "broadcast",
  timestamps: false
});

Broadcast.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Broadcast, { foreignKey: "user_id" });

// Asosiasi dengan UMKM
Broadcast.associate = function(models) {
  Broadcast.belongsTo(models.Umkm, {
    foreignKey: 'umkm_id',
    as: 'umkm'
  });
};

module.exports = Broadcast;
