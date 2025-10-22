const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Produk = sequelize.define("Produk", {
  produk_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nama_produk: { type: DataTypes.STRING(100), allowNull: false },
  harga: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  stok: { type: DataTypes.INTEGER, defaultValue: 0 },
  umkm_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, // Kembali ke false setelah data di-migrate
    references: {
      model: 'UMKM',
      key: 'umkm_id'
    }
  },
  aktif: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: "PRODUK",
  timestamps: false
});

// Asosiasi
Produk.associate = function(models) {
  // Produk milik satu UMKM
  Produk.belongsTo(models.Umkm, {
    foreignKey: 'umkm_id',
    as: 'umkm'
  });
};

module.exports = Produk;
