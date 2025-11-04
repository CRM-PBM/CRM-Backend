const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Umkm = require("./Umkm");

const KategoriProduk = sequelize.define("KategoriProduk", {
    kategori_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama_kategori: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    deskripsi: { type: DataTypes.TEXT, allowNull: true },
    umkm_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true
    }
}, {
    tableName: "KATEGORI_PRODUK",
    timestamps: false
}); 

KategoriProduk.belongsTo(Umkm, { foreignKey: "umkm_id" });
Umkm.hasMany(KategoriProduk, { foreignKey: "umkm_id" });

module.exports = KategoriProduk;