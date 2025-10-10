module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    invoice_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transaksi_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nomor_invoice: {
      type: DataTypes.STRING(50),
      unique: true
    },
    tanggal_cetak: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    path_file: {
      type: DataTypes.STRING(255)
    }
  }, {
    tableName: 'invoice',
    timestamps: false
  });

  return Invoice;
};