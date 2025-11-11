const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const auth = require('../middleware/authHandler');

router.get('/', transaksiController.getAllTransaksi.bind(transaksiController));
router.get('/statistik', transaksiController.getStatistik.bind(transaksiController));
router.get('/growth', auth, transaksiController.getTransaksiGrowthData.bind(transaksiController));
router.get('/:id', transaksiController.getTransaksiById.bind(transaksiController));
router.post('/', transaksiController.createTransaksi.bind(transaksiController));
router.put('/:id', transaksiController.updateTransaksi.bind(transaksiController));
router.delete('/:id', transaksiController.deleteTransaksi.bind(transaksiController));

module.exports = router;
