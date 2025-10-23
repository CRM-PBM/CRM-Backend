const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler');
const jenisProdukController = require('../controllers/jenisProdukController'); 

// JENIS PRODUK
router.get('/', auth, jenisProdukController.getAllJenis.bind(jenisProdukController));
router.post('/', auth, jenisProdukController.createJenis.bind(jenisProdukController));
router.put('/:id', auth, jenisProdukController.updateJenis.bind(jenisProdukController));
router.delete('/:id', auth, jenisProdukController.deleteJenis.bind(jenisProdukController));

module.exports = router;