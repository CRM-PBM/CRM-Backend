module.exports = (sequelize, DataTypes) => {
  const Transaksi = sequelize.define('Transaksi', {
    transaksi_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nomor_transaksi: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    },
    tanggal_transaksi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    pelanggan_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    metode_pembayaran: {
      type: DataTypes.STRING(50)
    },
    keterangan: {
      type: DataTypes.STRING(255)
    }
  }, {
    tableName: 'transaksi',
    timestamps: false
  });

  return Transaksi;
};