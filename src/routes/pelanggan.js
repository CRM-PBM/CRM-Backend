const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler')
const pelangganController = require('../controllers/pelangganController');

// 1. Route Spesifik (Harus Diletakkan Paling Atas)
router.get('/statistik', pelangganController.getStatistik.bind(pelangganController));
router.get('/growth', auth, pelangganController.getPelangganGrowthData.bind(pelangganController));

// 2. Route Umum (Tanpa Parameter)
router.get('/', pelangganController.getAllPelanggan.bind(pelangganController));
router.post('/', pelangganController.createPelanggan.bind(pelangganController));

// 3. Route Wildcard (Paling Akhir)
router.get('/:id', pelangganController.getPelangganById.bind(pelangganController));
router.put('/:id', pelangganController.updatePelanggan.bind(pelangganController));
router.delete('/:id', pelangganController.deletePelanggan.bind(pelangganController));
router.get('/umkm/:umkm_id', pelangganController.getPelangganByUmkm.bind(pelangganController)); // Asumsi ini ada

module.exports = router;