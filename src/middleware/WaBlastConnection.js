const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const EventEmitter = require("events");
const fs = require("fs");

const sockets = {};
const socketTimers = {};
const blastEvents = new EventEmitter();

const SOCKET_IDLE_TIMEOUT = 60 * 60 * 1000;

async function createBlastSocket(umkmId) {
  const sessionPath = `./auth_info_blast/${umkmId}`;
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    printQRInTerminal: false,
    browser: ["Windows", "Chrome", "110"]
  });

  // QR event
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`🔹 Scan QR untuk UMKM ${umkmId}`);
      qrcode.generate(qr, { small: true });
      blastEvents.emit("qr", { umkmId, qr });
    }

    if (connection === "open") {
      console.log(`✅ Koneksi aktif untuk UMKM ${umkmId}`);
      sockets[umkmId] = sock;
      blastEvents.emit("connected", { umkmId });
      scheduleSocketCleanup(umkmId);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(`⚠️ Koneksi UMKM ${umkmId} terputus (${reason})`);

      delete sockets[umkmId];
      blastEvents.emit("disconnected", { umkmId, reason });

      // Tangani session expired / logout
      if (reason === DisconnectReason.loggedOut || reason === 440) {
        console.log(`❌ Session UMKM ${umkmId} expired, perlu scan QR lagi`);
        // hapus session lama supaya QR bisa muncul lagi
        try { 
          if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
        } catch (err) {
          console.error(`Gagal hapus session lama UMKM ${umkmId}:`, err);
        }
      } else {
        // reconnect normal jika bukan logout/session expired
        setTimeout(() => createBlastSocket(umkmId), 5000);
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
}

async function getSocketInstance(umkmId) {
  if (!sockets[umkmId]) {
    sockets[umkmId] = await createBlastSocket(umkmId);
  } else {
    scheduleSocketCleanup(umkmId); // reset idle timer setiap dipakai
  }
  return sockets[umkmId];
}

// Bersihkan koneksi idle agar tidak menumpuk
function scheduleSocketCleanup(umkmId) {
  if (socketTimers[umkmId]) clearTimeout(socketTimers[umkmId]);
  socketTimers[umkmId] = setTimeout(() => {
    if (sockets[umkmId]) {
      console.log(`⏳ Menutup koneksi idle untuk UMKM ${umkmId}`);
      try {
        sockets[umkmId].end();
      } catch {}
      delete sockets[umkmId];
    }
  }, SOCKET_IDLE_TIMEOUT);
}

module.exports = { createBlastSocket, getSocketInstance, sockets, blastEvents };
