const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const User = require('../models/User');
const Umkm = require('../models/Umkm');

require('dotenv').config();

// ========== REGISTER SERVICE ==========
exports.registerService = async (data) => {
  const { email, password, nama_pemilik, nama_umkm, telepon, alamat } = data;

  // Cek apakah email sudah terdaftar
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
  }

  // Gunakan managed transaction
  return await sequelize.transaction(async (t) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUmkm = await Umkm.create(
      {
        nama_umkm,
        nama_pemilik,
        email,
        telepon,
        alamat
      },
      { transaction: t }
    );

    const newUser = await User.create(
      {
        role: 'umkm',
        email,
        password: hashedPassword,
        umkm_id: newUmkm.umkm_id
      },
      { transaction: t }
    );

    // Tidak membuat token di sini
    return {
      msg: 'Registrasi berhasil.',
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        umkm_id: newUmkm.umkm_id,
        nama_umkm: newUmkm.nama_umkm
      }
    };
  });
};

// ========== LOGIN SERVICE ==========
exports.loginService = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({
    where: { email },
    include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }]
  });

  if (!user) throw new Error('Kredensial tidak valid (Email tidak ditemukan)');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Kredensial tidak valid (Password salah)');

  const payload = {
    userId: user.user_id,
    umkmId: user.Umkm.umkm_id,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });

  await user.update({ last_login: new Date() });

  return {
    msg: 'Login berhasil.',
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      umkm_id: user.Umkm.umkm_id,
      nama_umkm: user.Umkm.nama_umkm
    }
  };
};
