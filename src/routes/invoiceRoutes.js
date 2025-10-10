const express = require('express');
const router = express.Router();
const authHandler = require('../middleware/authHandler'); 
const invoiceController = require('../controllers/invoiceController');

// Route untuk membuat Invoice dari ID Transaksi
router.post('/', authHandler, invoiceController.createInvoice);

// Route untuk mendapatkan detail Invoice (beserta data Transaksi terkait)
router.get('/:invoiceId', authHandler, invoiceController.getInvoiceDetail);

// Route untuk mengunduh PDF (Public access, karena path_file akan digunakan)
// Ini adalah route untuk mengakses file statis dari folder public/invoices
// Anda harus memastikan app.use(express.static('public')); sudah terpasang di app.js

module.exports = router;