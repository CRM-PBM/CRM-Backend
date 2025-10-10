module.exports = (sequelize, DataTypes) => {
  const Produk = sequelize.define('Produk', {
    produk_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama_produk: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    harga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.STRING(255)
    },
    stok: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  }, {
    tableName: 'produk',
    timestamps: false
  });

  return Produk;
};