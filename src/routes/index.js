const express = require('express');
const router = express.Router();

const transaksiRoutes = require('./transaksiRoutes');

// Use routes
router.use('/api', transaksiRoutes);

module.exports = router;