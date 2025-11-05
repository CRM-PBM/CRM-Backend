const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcastController');
const { uploadBroadcastImage } = require('../middleware/uploadBroadcastImage');

// GET /api/broadcast/device/status - Cek status device (harus di atas /:id)
router.get('/device/status', broadcastController.checkDeviceStatus.bind(broadcastController));

// GET /api/broadcast/statistik - Get statistik (harus di atas /:id)
router.get('/statistik', broadcastController.getStatistik.bind(broadcastController));

// POST /api/broadcast/upload-image - Upload gambar broadcast (NEW!)
// uploadBroadcastImage sudah include .single('image') di middleware
router.post('/upload-image', uploadBroadcastImage, broadcastController.uploadImage.bind(broadcastController));

// GET /api/broadcast - Get all broadcast
router.get('/', broadcastController.getAllBroadcast.bind(broadcastController));

// GET /api/broadcast/:id - Get broadcast by ID
router.get('/:id', broadcastController.getBroadcastById.bind(broadcastController));

// POST /api/broadcast - Create new broadcast (draft)
router.post('/', broadcastController.createBroadcast.bind(broadcastController));

// POST /api/broadcast/:id/send - Kirim broadcast
router.post('/:id/send', broadcastController.sendBroadcast.bind(broadcastController));

// DELETE /api/broadcast/:id - Delete broadcast
router.delete('/:id', broadcastController.deleteBroadcast.bind(broadcastController));

module.exports = router;
