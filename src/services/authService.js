const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const config = require('../config');
const User = require('../models/User');
const Umkm = require('../models/Umkm');
const RefreshToken = require('../models/RefreshToken');

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

  // Generate access token (short-lived)
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });

  // Calculate expiry date for refresh token
  const expiresAt = new Date();
  const daysMatch = config.jwt.refreshExpiresIn.match(/(\d+)d/);
  if (daysMatch) {
    expiresAt.setDate(expiresAt.getDate() + parseInt(daysMatch[1]));
  } else {
    expiresAt.setDate(expiresAt.getDate() + 7); // default 7 days
  }

  // Save refresh token to database
  await RefreshToken.create({
    user_id: user.user_id,
    token: refreshToken,
    expires_at: expiresAt
  });

  await user.update({ last_login: new Date() });

  return {
    msg: 'Login berhasil.',
    accessToken,
    refreshToken,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      umkm_id: user.Umkm.umkm_id,
      nama_umkm: user.Umkm.nama_umkm
    }
  };
};

// ========== REFRESH TOKEN SERVICE ==========
exports.refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token tidak ditemukan.');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (error) {
    throw new Error('Refresh token tidak valid atau expired.');
  }

  // Check if token exists in database and not revoked
  const tokenRecord = await RefreshToken.findOne({
    where: {
      token: refreshToken,
      is_revoked: false
    }
  });

  if (!tokenRecord) {
    throw new Error('Refresh token tidak ditemukan atau sudah dicabut.');
  }

  // Check if token is expired
  if (new Date() > new Date(tokenRecord.expires_at)) {
    throw new Error('Refresh token sudah expired.');
  }

  // Get user data
  const user = await User.findOne({
    where: { user_id: decoded.userId },
    include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }]
  });

  if (!user) {
    throw new Error('User tidak ditemukan.');
  }

  // Generate new access token
  const payload = {
    userId: user.user_id,
    umkmId: user.Umkm.umkm_id,
    role: user.role
  };

  const newAccessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  return {
    msg: 'Access token berhasil di-refresh.',
    accessToken: newAccessToken,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      umkm_id: user.Umkm.umkm_id,
      nama_umkm: user.Umkm.nama_umkm
    }
  };
};

// ========== LOGOUT SERVICE ==========
exports.logoutService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token tidak ditemukan.');
  }

  // Revoke the refresh token
  const tokenRecord = await RefreshToken.findOne({
    where: { token: refreshToken }
  });

  if (!tokenRecord) {
    throw new Error('Refresh token tidak ditemukan.');
  }

  await tokenRecord.update({ is_revoked: true });

  return {
    msg: 'Logout berhasil. Refresh token telah dicabut.'
  };
};
