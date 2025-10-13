const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');

router.get('/', produkController.getAllProduk.bind(produkController));
router.get('/:id', produkController.getProdukById.bind(produkController));
router.post('/', produkController.createProduk.bind(produkController));
router.put('/:id', produkController.updateProduk.bind(produkController));
router.delete('/:id', produkController.deleteProduk.bind(produkController));

module.exports = router;
