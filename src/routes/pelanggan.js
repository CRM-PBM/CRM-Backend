const express = require('express');
const router = express.Router();
const pelangganController = require('../controllers/pelangganController');

router.get('/', pelangganController.getAllPelanggan.bind(pelangganController));
router.get('/:id', pelangganController.getPelangganById.bind(pelangganController));
router.post('/', pelangganController.createPelanggan.bind(pelangganController));
router.put('/:id', pelangganController.updatePelanggan.bind(pelangganController));
router.delete('/:id', pelangganController.deletePelanggan.bind(pelangganController));

module.exports = router;
