const express = require('express');
const router = express.Router();
const watzapController = require('../controllers/watzapController');
const authHandler = require('../middleware/authHandler');

// Semua routes memerlukan authentication
router.use(authHandler);

/**
 * GET /api/watzap/number-key
 * Get Watzap number key untuk UMKM
 */
router.get('/number-key', (req, res, next) => {
  watzapController.getNumberKey(req, res, next);
});

/**
 * POST /api/watzap/number-key
 * Set/Update Watzap number key untuk UMKM
 */
router.post('/number-key', (req, res, next) => {
  watzapController.setNumberKey(req, res, next);
});

/**
 * DELETE /api/watzap/number-key
 * Clear Watzap number key untuk UMKM
 */
router.delete('/number-key', (req, res, next) => {
  watzapController.clearNumberKey(req, res, next);
});

/**
 * GET /api/watzap/device/status
 * Check Watzap device status untuk UMKM
 */
router.get('/device/status', (req, res, next) => {
  watzapController.checkDeviceStatus(req, res, next);
});

module.exports = router;
