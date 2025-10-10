module.exports = (sequelize, DataTypes) => {
  const DetailTransaksi = sequelize.define('DetailTransaksi', {
    detail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transaksi_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    produk_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nama_barang: {
      type: DataTypes.STRING(101)
    },
    harga_satuan: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'detail_transaksi',
    timestamps: false
  });

  return DetailTransaksi;
};