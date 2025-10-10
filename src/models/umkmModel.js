module.exports = (sequelize, DataTypes) => {
  const UMKM = sequelize.define('UMKM', {
    umkm_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nama_umkm: {
      type: DataTypes.STRING(101),
      allowNull: false
    },
    nama_pemilik: {
      type: DataTypes.STRING(101),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true
    },
    telepon: {
      type: DataTypes.STRING(50)
    },
    alamat: {
      type: DataTypes.STRING(255)
    },
    tanggal_daftar: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'umkm',
    timestamps: false
  });

  return UMKM;
};