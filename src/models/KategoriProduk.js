const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KategoriProduk = sequelize.define("KategoriProduk", {
    kategori_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama_kategori: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: "KATEGORI_PRODUK",
    timestamps: false
}); 

module.exports = KategoriProduk;