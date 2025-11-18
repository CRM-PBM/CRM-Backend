const WaBlastLog = require("../models/WaBlastLog");
const {
  getSocketInstance,
  sockets,
  createBlastSocket,
  blastEvents,
} = require("../middleware/WaBlastConnection");
const { sendBlastToAll } = require("../services/WaBlastService");
const { Op } = require("sequelize");

// 🔹 Kirim pesan blast
async function blastMessage(req, res) {
  try {
    const umkm_id = req.umkmId;
    const { message, media_url, customer_ids } = req.body;

    if (!message) throw new Error("Pesan wajib diisi");

    let selectedIds = null;

    if (customer_ids && Array.isArray(customer_ids)) {
      selectedIds = customer_ids
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id));
    }

    const sock = await getSocketInstance(umkm_id);
    await sendBlastToAll(sock, umkm_id, message, media_url, 4000, selectedIds);

    res.json({
      status: "success",
      message: "Pesan blast berhasil dikirim",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

// 🔹 Ambil riwayat broadcast (summary per broadcast)
async function getBlastLogs(req, res) {
  try {
    const umkm_id = req.umkmId;

    const logs = await WaBlastLog.findAll({
      where: { umkm_id },
      order: [["created_at", "DESC"]],
    });

    const grouped = {};

    logs.forEach((log) => {
      const id = log.broadcast_id;

      if (!grouped[id]) {
        grouped[id] = {
          broadcast_id: id,
          isi_pesan: log.message || "-",
          tanggal_kirim: log.tanggal_kirim || log.created_at,
          media_url: log.media_url || null,
          total_penerima: 0,
          sent: 0,
          pending: 0,
          failed: 0,
          status: "done",
        };
      }

      grouped[id].total_penerima++;

      if (log.status === "sent") grouped[id].sent++;
      if (log.status === "pending") grouped[id].pending++;
      if (log.status === "failed") grouped[id].failed++;
    });

    Object.values(grouped).forEach((b) => {
      if (b.failed === b.total_penerima) b.status = "failed";
      else if (b.sent === b.total_penerima) b.status = "success";
      else if (b.failed > 0 && b.sent > 0) b.status = "partial";
      else if (b.pending > 0) b.status = "in_progress";
    });

    // convert to array
    const result = Object.values(grouped);

    res.json({ status: "success", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

// 🔹 riwayat broadcast details
async function getBlastLogsDetails(req, res) {
  const { broadcast_id } = req.params;
  const umkm_id = req.umkmId;

  const logs = await WaBlastLog.findAll({
    where: { broadcast_id, umkm_id },
    order: [["created_at", "ASC"]],
  });

  res.json({ status: "success", data: logs });
}

// 🔹 Cek status koneksi socket untuk UMKM login
async function getBlastStatus(req, res) {
  try {
    const umkm_id = req.umkmId;

    const sock = sockets[umkm_id];
    if (!sock)
      return res.json({
        status: "disconnected",
        message: "Belum login atau koneksi belum aktif",
      });

    const isConnected = !!sock.user;
    res.json({
      status: isConnected ? "connected" : "disconnected",
      message: isConnected ? "Koneksi aktif" : "Koneksi putus",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

// 🔹 Inisialisasi koneksi WhatsApp (generate QR)
async function connectBlast(req, res) {
  try {
    const umkm_id = req.umkmId;

    if (sockets[umkm_id]?.user) {
      return res.json({
        status: "already_connected",
        message: "Sudah terhubung ke WhatsApp",
      });
    }

    const sock = await createBlastSocket(umkm_id);

    let responded = false; // <-- flag buat mastiin res cuma kirim sekali

    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        res.status(408).json({
          status: "error",
          message: "QR tidak muncul dalam waktu 10 detik",
        });
      }
    }, 10000);

    blastEvents.once("qr", ({ umkmId, qr }) => {
      if (umkmId === umkm_id && !responded) {
        responded = true;
        clearTimeout(timeout);
        res.json({ status: "qr", qr });
      }
    });

    blastEvents.once("connected", ({ umkmId }) => {
      if (umkmId === umkm_id && !responded) {
        responded = true;
        clearTimeout(timeout);
        res.json({
          status: "connected",
          message: "Sudah terhubung ke WhatsApp",
        });
      }
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent)
      res.status(500).json({ status: "error", message: err.message });
  }
}

// 🔹 Putuskan koneksi WhatsApp
async function disconnectBlast(req, res) {
  try {
    const umkm_id = req.umkmId;

    const sock = sockets[umkm_id];
    if (!sock) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada koneksi aktif untuk umkm ini",
      });
    }

    await sock.logout();
    delete sockets[umkm_id];

    res.json({
      status: "success",
      message: "Koneksi WhatsApp berhasil diputus",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

// blast statistics
async function getBlastStatistics(req, res) {
  try {
    const umkmId = req.umkmId;

    // Total broadcast unik
    const totalBroadcast = await WaBlastLog.count({
      where: { umkm_id: umkmId },
      distinct: true,
      col: "broadcast_id",
    });

    // Total penerima unik
    const totalPenerima = await WaBlastLog.count({
      where: { umkm_id: umkmId },
      distinct: true,
      col: "phone_number",
    });

    // success rate by status
    const sent = await WaBlastLog.count({
      where: { umkm_id: umkmId, status: "sent" },
    });

    const failed = await WaBlastLog.count({
      where: { umkm_id: umkmId, status: "failed" },
    });

    const successRate =
      sent + failed > 0 ? Math.round((sent / (sent + failed)) * 100) : 0;

    res.json({
      total_broadcast: totalBroadcast,
      total_penerima: totalPenerima,
      terkirim: sent,
      gagal: failed,
      success_rate: successRate,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = {
  blastMessage,
  getBlastLogs,
  getBlastStatus,
  connectBlast,
  disconnectBlast,
  getBlastStatistics,
  getBlastLogsDetails,
};
