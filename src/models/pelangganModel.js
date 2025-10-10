module.exports = (sequelize, DataTypes) => {
  const Pelanggan = sequelize.define('Pelanggan', {
    pelanggan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    umkm_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nama: {
      type: DataTypes.STRING(101),
      allowNull: false
    },
    telepon: {
      type: DataTypes.STRING(15)
    },
    email: {
      type: DataTypes.STRING(100)
    },
    gender: {
      type: DataTypes.ENUM('Pria', 'Wanita')
    },
    alamat: {
      type: DataTypes.TEXT
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'pelanggan',
    timestamps: false
  });

  return Pelanggan;
};