const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

// POST /api/transaksi - Create new transaksi
router.post('/transaksi', transaksiController.createTransaksi);

// GET /api/transaksi - Get all transaksi
router.get('/transaksi', transaksiController.getAllTransaksi);

// GET /api/transaksi/:id - Get transaksi by ID
router.get('/transaksi/:id', transaksiController.getTransaksiById);

// PUT /api/transaksi/:id - Update transaksi
router.put('/transaksi/:id', transaksiController.updateTransaksi);

// DELETE /api/transaksi/:id - Delete transaksi
router.delete('/transaksi/:id', transaksiController.deleteTransaksi);

module.exports = router;