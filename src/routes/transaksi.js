const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

// GET /api/transaksi/statistik - Get statistik transaksi (harus di atas /:id)
router.get('/statistik', transaksiController.getStatistik.bind(transaksiController));

// GET /api/transaksi - Get all transaksi
router.get('/', transaksiController.getAllTransaksi.bind(transaksiController));

// GET /api/transaksi/:id - Get transaksi by ID
router.get('/:id', transaksiController.getTransaksiById.bind(transaksiController));

// POST /api/transaksi - Create new transaksi
router.post('/', transaksiController.createTransaksi.bind(transaksiController));

// PUT /api/transaksi/:id - Update transaksi
router.put('/:id', transaksiController.updateTransaksi.bind(transaksiController));

// DELETE /api/transaksi/:id - Delete transaksi
router.delete('/:id', transaksiController.deleteTransaksi.bind(transaksiController));

module.exports = router;
