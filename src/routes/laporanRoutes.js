const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController'); // Sesuaikan path
const auth = require('../middleware/authHandler')

// Route untuk Laporan Penjualan
router.get('/penjualan', auth, laporanController.getSalesReports);

// Route untuk Laporan Pelanggan
router.get('/pelanggan', auth, laporanController.getCustomerReport);

module.exports = router;