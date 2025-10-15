const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/authHandler');
const pelangganRoutes = require('./pelanggan');
const transaksiRoutes = require('./transaksi');
const produkRoutes = require('./produk');
const broadcastRoutes = require('./broadcast');

// Basic health check (public - tidak perlu auth)
router.get('/health', healthController.health);

// Protected routes - Harus login dulu untuk akses endpoint ini
router.use('/pelanggan', auth, pelangganRoutes);
router.use('/transaksi', auth, transaksiRoutes);
router.use('/produk', auth, produkRoutes);
router.use('/broadcast', auth, broadcastRoutes);

module.exports = router;
