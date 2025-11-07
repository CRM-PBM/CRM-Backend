const express = require('express');
const router = express.Router();

const auth = require('../middleware/authHandler'); 
const adminAuth = require('../middleware/adminAuth');

const adminController = require('../controllers/adminController');

router.use(auth, adminAuth);

router.get('/umkm', adminController.getAllUmkm);
router.put('/umkm/verify/:umkmId', adminController.verifyUmkm);
router.put('/umkm/suspend/:umkmId', adminController.suspendUmkm);
router.get('/stats/global', adminController.getGlobalStats);
router.get('/stats/umkm-growth', adminController.getUmkmGrowthData);

module.exports = router;