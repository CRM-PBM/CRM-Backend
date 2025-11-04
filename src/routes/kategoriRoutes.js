const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler');
const kategoriController = require('../controllers/kategoriController'); 


// KATEGORI PRODUK
router.get('/', auth, kategoriController.getAllKategori.bind(kategoriController));
router.post('/', auth, kategoriController.createKategori.bind(kategoriController));
router.put('/:id', auth, kategoriController.updateKategori.bind(kategoriController));
router.delete('/:id', auth, kategoriController.deleteKategori.bind(kategoriController));

module.exports = router;