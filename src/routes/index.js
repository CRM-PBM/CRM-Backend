const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const pelangganRoutes = require('./pelanggan');
const transaksiRoutes = require('./transaksi');
const produkRoutes = require('./produk');
const broadcastRoutes = require('./broadcast');

// Basic health check
router.get('/health', healthController.health);

// Pelanggan routes
router.use('/pelanggan', pelangganRoutes);

// Transaksi routes
router.use('/transaksi', transaksiRoutes);

// Produk routes
router.use('/produk', produkRoutes);

// Broadcast routes
router.use('/broadcast', broadcastRoutes);

module.exports = router;
