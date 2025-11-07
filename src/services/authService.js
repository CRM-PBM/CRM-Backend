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
        alamat,
        status: 'pending' 
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
      msg: 'Registrasi berhasil, Silahkan tunggu verifikasi admin 1x24 jam.',
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        umkm_id: newUmkm.umkm_id,
        nama_umkm: newUmkm.nama_umkm,
        status: newUmkm.status 
      }
    };
  });
};

// ========== LOGIN SERVICE ==========
exports.loginService = async (data) => {
  const { email, password } = data;

  let user = await User.findOne({ where: { email } });

  if (!user) throw new Error('Kredensial tidak valid (Email tidak ditemukan)');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Kredensial tidak valid (Password salah)');
  
  let umkmData = null;
  
  if (user.role === 'umkm') {
    user = await User.findOne({
      where: { user_id: user.user_id },
      include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm', 'nama_pemilik', 'status'] }]
    });

    // Cek Verifikasi UMKM
    if (user.Umkm && user.Umkm.status !== 'active') {
      if (user.Umkm.status === 'pending') {
        throw new Error('Akun Anda masih dalam proses verifikasi admin. Silakan tunggu 1x24 jam.');
      }
      if (user.Umkm.status === 'suspended') {
        throw new Error('Akun Anda telah dinonaktifkan oleh Admin.');
      }
    }

    umkmData = {
      umkm_id: user.Umkm.umkm_id,
      nama_umkm: user.Umkm.nama_umkm,
      nama_pemilik: user.Umkm.nama_pemilik,
      status_umkm: user.Umkm.status
    };
  } else if (user.role === 'admin') {
    umkmData = {
      umkm_id: null,
      nama_umkm: 'Aplikasi CRM-UMKM',
      nama_pemilik: 'Admin CRM-UMKM',
      status_umkm: 'active'
    };
  } else {
    throw new Error('Role pengguna tidak valid atau UMKM tidak ditemukan.');
  }

  const payload = {
    userId: user.user_id,
    umkmId: umkmData.umkm_id,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });

  await user.update({ last_login: new Date() });

  return {
    msg: 'Login berhasil.',
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      ...umkmData
    } 
  };
};