const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler')
const pelangganController = require('../controllers/pelangganController');

// 1. Route Spesifik (Wajib di atas /:id)
router.get('/statistik', auth, pelangganController.getStatistik.bind(pelangganController)); 
router.get('/growth', auth, pelangganController.getPelangganGrowthData.bind(pelangganController)); 
router.get('/umkm/:umkm_id', auth, pelangganController.getPelangganByUmkm.bind(pelangganController)); 

// 2. Route Umum (Tanpa Parameter)
router.get('/', auth, pelangganController.getAllPelanggan.bind(pelangganController));
router.post('/', auth, pelangganController.createPelanggan.bind(pelangganController));

// 3. Route Wildcard (Paling Akhir)
router.get('/:id', auth, pelangganController.getPelangganById.bind(pelangganController));
router.put('/:id', auth, pelangganController.updatePelanggan.bind(pelangganController));
router.delete('/:id', auth, pelangganController.deletePelanggan.bind(pelangganController));

module.exports = router;