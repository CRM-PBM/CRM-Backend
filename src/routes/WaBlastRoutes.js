const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const auth = require("../middleware/authHandler");
const {
  blastMessage,
  getBlastLogs,
  getBlastStatus,
  connectBlast,
  disconnectBlast,
  getBlastStatistics,
  getBlastLogsDetails
} = require("../controllers/WaBlastController");

// --- Upload setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// --- WA Blast endpoints ---
router.post("/send", auth, blastMessage);
router.get("/logs", auth, getBlastLogs);
router.get("/logs/:broadcast_id", auth, getBlastLogsDetails);
router.get("/statistics", auth, getBlastStatistics);
router.get("/status", auth, getBlastStatus);
router.post("/connect", auth, connectBlast);
router.delete("/logout", auth, disconnectBlast);

// --- Upload endpoint ---
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: 'File wajib diupload' });

  const localPath = `uploads/${req.file.filename}`;
  res.json({ success: true, localPath });
});

// --- Serve uploaded files with auth ---
router.get('/uploads/:filename', auth, (req, res) => {
  const filePath = path.join(__dirname, '../../uploads', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
  }

  res.sendFile(filePath);
});

module.exports = router;
