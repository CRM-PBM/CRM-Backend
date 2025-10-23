const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const KategoriProduk = require("./KategoriProduk");

const JenisProduk = sequelize.define("JenisProduk", {
    jenis_produk_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nama_jenis: { type: DataTypes.STRING(20), allowNull: false },
    kategori_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'kategori_produk', key: 'kategori_id' } }
}, {
    tableName: "JENIS_PRODUK",
    timestamps: false
});


JenisProduk.belongsTo(KategoriProduk, { foreignKey: "kategori_id" });
KategoriProduk.hasMany(JenisProduk, { foreignKey: "kategori_id" });

module.exports = JenisProduk;