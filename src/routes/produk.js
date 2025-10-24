const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler');
const produkController = require('../controllers/produkController');


router.get('/', auth, produkController.getAllProduk.bind(produkController));
router.get('/jenis', produkController.getJenisProduk.bind(produkController)); 
router.get('/statistik', produkController.getStatistics.bind(produkController));
router.get('/:id', auth, produkController.getProdukById.bind(produkController));
router.post('/', auth, produkController.createProduk.bind(produkController));
router.put('/:id', produkController.updateProduk.bind(produkController));
router.delete('/:id', produkController.deleteProduk.bind(produkController));
router.patch('/:id/toggle-active', auth, produkController.toggleActive.bind(produkController));

module.exports = router;
