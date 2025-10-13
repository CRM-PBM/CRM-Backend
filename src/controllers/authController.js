// src/controllers/authController.js
const { registerService, loginService } = require('../services/authService');

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
