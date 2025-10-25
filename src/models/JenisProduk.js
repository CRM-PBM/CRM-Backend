    const { DataTypes } = require("sequelize");
    const sequelize = require("../config/database");
    const KategoriProduk = require("./KategoriProduk");
    const Umkm = require("./Umkm");

    const JenisProduk = sequelize.define("JenisProduk", {
        jenis_produk_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nama_jenis: { type: DataTypes.STRING(20), allowNull: false },
        kategori_id: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: { model: KategoriProduk, key: "kategori_id" } 
        },
        umkm_id: { 
            type: DataTypes.INTEGER, 
            allowNull: true
        }
    }, {
        tableName: "JENIS_PRODUK",
        timestamps: false
    });


    JenisProduk.belongsTo(KategoriProduk, { foreignKey: "kategori_id" });
    KategoriProduk.hasMany(JenisProduk, { foreignKey: "kategori_id" });

    JenisProduk.belongsTo(Umkm, { foreignKey: "umkm_id" });
    Umkm.hasMany(JenisProduk, { foreignKey: "umkm_id" });

    module.exports = JenisProduk;