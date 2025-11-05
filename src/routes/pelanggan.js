const express = require('express');
const router = express.Router();
const auth = require('../middleware/authHandler')
const pelangganController = require('../controllers/pelangganController');
const multer = require('multer');

// Setup multer untuk upload file
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept only CSV and Excel files
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file CSV atau Excel yang diizinkan'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.get('/', pelangganController.getAllPelanggan.bind(pelangganController));
router.get('/statistik', pelangganController.getStatistik.bind(pelangganController));
router.get('/template/download', pelangganController.getImportTemplate.bind(pelangganController));
router.post('/import', upload.single('file'), pelangganController.importPelanggan.bind(pelangganController));
router.get('/:id', pelangganController.getPelangganById.bind(pelangganController));
router.post('/', pelangganController.createPelanggan.bind(pelangganController));
router.put('/:id', pelangganController.updatePelanggan.bind(pelangganController));
router.delete('/:id', pelangganController.deletePelanggan.bind(pelangganController));


module.exports = router;
