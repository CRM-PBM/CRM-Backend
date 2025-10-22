const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route untuk registrasi UMKM dan User pertama
router.post('/register', authController.register);

// Route untuk login
router.post('/login', authController.login);

// Route untuk refresh access token
router.post('/refresh', authController.refreshToken);

// Route untuk logout (revoke refresh token)
router.post('/logout', authController.logout);

module.exports = router;