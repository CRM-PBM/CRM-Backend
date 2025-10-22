// src/controllers/authController.js
const { 
  registerService, 
  loginService, 
  refreshTokenService, 
  logoutService 
} = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const result = await registerService(req.body);
    res.status(201).json({
      msg: 'Registrasi berhasil, Silahkan Login',
      ...result
    });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(400).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await loginService(req.body);
    res.json(result);
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(400).json({ msg: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshTokenService(refreshToken);
    res.json(result);
  } catch (err) {
    console.error('Refresh Token Error:', err.message);
    res.status(401).json({ msg: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await logoutService(refreshToken);
    res.json(result);
  } catch (err) {
    console.error('Logout Error:', err.message);
    res.status(400).json({ msg: err.message });
  }
};
