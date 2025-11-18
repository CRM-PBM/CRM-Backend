const WaBlastLog = require("../models/WaBlastLog");
const Pelanggan = require("../models/Pelanggan");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function sendBlastToAll(
  sock,
  umkmId,
  message,
  mediaUrl = null,
  delayMs = 4000,
  selectedIds = null
) {
  const broadcastId = uuidv4();

  let pelangganList;

  if (selectedIds && selectedIds.length > 0) {
    // Ambil hanya pelanggan yang dipilih
    pelangganList = await Pelanggan.findAll({
      where: {
        umkm_id: umkmId,
        pelanggan_id: selectedIds,
      },
    });
  } else {
    // fallback lama: ambil semua
    pelangganList = await Pelanggan.findAll({
      where: { umkm_id: umkmId },
    });
  }

  if (!pelangganList.length)
    throw new Error("Tidak ada pelanggan untuk UMKM ini");

  for (const pelanggan of pelangganList) {
    let phone = pelanggan.telepon.trim();
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    phone = phone.replace(/\D/g, "");
    const jid = `${phone}@s.whatsapp.net`;

    let formattedPhoneForMessage = pelanggan.telepon.trim().replace(/\D/g, "");
    if (formattedPhoneForMessage.startsWith("62")) {
      formattedPhoneForMessage = "0" + formattedPhoneForMessage.slice(2);
    }

    let personalizedMessage = message;
    personalizedMessage = personalizedMessage
      .replaceAll("{nama}", pelanggan.nama || "")
      .replaceAll("{telepon}", formattedPhoneForMessage || "")
      .replaceAll("{email}", pelanggan.email || "");

    let retries = 0;
    let sent = false;

    while (retries < 2 && !sent) {
      try {
        // Tentukan payload pesan
        const msgPayload = mediaUrl
          ? await buildMediaMessage(mediaUrl, personalizedMessage, sock)
          : { text: personalizedMessage };

        await sock.sendMessage(jid, msgPayload);

        await WaBlastLog.create({
          umkm_id: umkmId,
          phone_number: phone,
          message: personalizedMessage,
          status: "sent",
          media_url: mediaUrl,
          tanggal_kirim: new Date(),
          broadcast_id: broadcastId
        });

        console.log(`✅ [${umkmId}] Terkirim ke ${phone}`);
        sent = true;
      } catch (err) {
        retries++;
        console.error(`❌ [${umkmId}] Gagal kirim ke ${phone}: ${err.message}`);
        if (retries >= 2) {
          await WaBlastLog.create({
            umkm_id: umkmId,
            phone_number: phone,
            message: personalizedMessage,
            status: "failed",
            error: err.message,
            broadcast_id: broadcastId
          });
        }
        await new Promise((res) => setTimeout(res, 1500));
      }
    }

    // Delay antar pelanggan
    const randomDelay = delayMs + Math.floor(Math.random() * 4000);
    await new Promise((res) => setTimeout(res, randomDelay));
  }
}

/**
 * Membuat payload pesan media sesuai tipe file
 */
async function buildMediaMessage(mediaInput, caption, sock) {
  const absolutePath = path.join(process.cwd(), mediaInput);
  const buffer = fs.readFileSync(absolutePath);

  const ext = path.extname(mediaInput).toLowerCase();

  let mediaType;
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    mediaType = "image";
  } else if ([".mp4", ".mov", ".3gp"].includes(ext)) {
    mediaType = "video";
  } else {
    mediaType = "document";
  }

  const payload = {
    [mediaType]: buffer,
  };

  if (mediaType !== "document") {
    payload.caption = caption;
  } else {
    payload.mimetype = "application/octet-stream";
    payload.fileName = path.basename(mediaInput);
  }

  return payload;
}

module.exports = { sendBlastToAll };
