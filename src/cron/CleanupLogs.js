const cron = require("node-cron");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const WaBlastLog = require("../models/WaBlastLog");

const UPLOAD_DIR = path.join(__dirname, "../../uploads"); // sesuaikan path

function startCleanupCron() {
  // cleanup setiap jam 3 pagi
  cron.schedule("0 3 * * *", async () => {
    console.log("[CRON] Cleanup job started");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    try {
      // 1. Hapus logs >30 hari
      const deleted = await WaBlastLog.destroy({
        where: { created_at: { [Op.lt]: cutoffDate } },
      });
      console.log(`[CRON] Clean logs: ${deleted} rows dihapus`);

      // 2. Hapus file uploads >30 hari
      const files = fs.readdirSync(UPLOAD_DIR);
      files.forEach(file => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        const diffDays = (new Date() - stats.birthtime) / (1000 * 60 * 60 * 24);

        if (diffDays > 30) {
          fs.unlinkSync(filePath);
          console.log(`[CRON] Deleted old file: ${file}`);
        }
      });

    } catch (err) {
      console.error("[CRON] Gagal hapus log atau file:", err.message);
    }
  });

  console.log("[CRON] Cleanup log + uploads scheduler aktif");
}

module.exports = startCleanupCron;