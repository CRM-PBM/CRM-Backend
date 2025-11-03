# Troubleshooting Watzap.id - WhatsApp Instance Not Started

## 🔴 Error: Status 1005 - WhatsApp Instance Not Started

### Gejala:
```json
{
  "status": "1005",
  "message": "WhatsApp Instance Not Started",
  "ack": "fatal_error",
  "wa_number": "628996901370"
}
```

---

## ✅ Solusi Lengkap

### **Step 1: Login ke Dashboard Watzap.id**

1. Buka browser dan kunjungi:
   ```
   https://console.watzap.id/
   ```

2. Login dengan akun Anda

3. Anda akan melihat daftar **Instance/Device** WhatsApp Anda

---

### **Step 2: Start WhatsApp Instance**

1. **Pilih instance** yang sesuai dengan `WATZAP_NUMBER_KEY` Anda
   
2. **Cek status instance**:
   - 🔴 **STOPPED** / **OFFLINE** → Perlu di-start
   - 🟢 **CONNECTED** / **RUNNING** → Sudah OK
   - 🟡 **LOADING** → Tunggu sebentar

3. **Klik tombol "START"** atau **"Run Instance"**

4. **Tunggu proses koneksi** (biasanya 10-30 detik)

5. **Scan QR Code** jika diminta:
   - Buka WhatsApp di HP
   - Tap menu (3 titik) → **Linked Devices**
   - Tap **Link a Device**
   - Scan QR code di dashboard

6. **Verifikasi status berubah** menjadi 🟢 **CONNECTED**

---

### **Step 3: Verifikasi dari Backend**

Jalankan script test koneksi:

```bash
node check-watzap-status.js
```

**Output yang diharapkan:**
```
✅ WhatsApp Instance is RUNNING
✅ Ready to send messages
```

---

### **Step 4: Test Kirim Pesan**

Test manual dari backend:

```bash
# Test broadcast
node tests/test-broadcast-api.js

# Atau test kirim pesan langsung
node tests/test-watzap-send.js
```

---

## 🔧 Penyebab Umum Instance Stopped

### 1. **Timeout/Idle**
- Instance otomatis stop jika tidak digunakan dalam waktu lama
- **Solusi**: Start ulang instance dari dashboard

### 2. **WhatsApp Logout**
- HP Anda logout dari WhatsApp Web/Linked Devices
- **Solusi**: Re-scan QR code

### 3. **Maintenance Watzap.id**
- Server Watzap.id sedang maintenance
- **Solusi**: Tunggu beberapa menit dan coba lagi

### 4. **HP Tidak Terhubung Internet**
- HP yang di-link tidak online
- **Solusi**: Pastikan HP online dan WhatsApp aktif

### 5. **Subscription Expired**
- Paket Watzap.id Anda sudah habis
- **Solusi**: Perpanjang subscription di dashboard

---

## 📋 Checklist Before Sending Broadcast

Sebelum kirim broadcast, pastikan:

- [ ] ✅ Login ke https://console.watzap.id/
- [ ] ✅ Instance status = **CONNECTED** (hijau)
- [ ] ✅ HP WhatsApp dalam keadaan online
- [ ] ✅ Linked Devices tidak expired
- [ ] ✅ Test kirim 1 pesan dulu (`node tests/test-watzap-send.js`)
- [ ] ✅ Subscription Watzap.id masih aktif

---

## 🚨 Error Handling di Code

Backend sudah dilengkapi dengan error handling untuk kasus ini.

### Cek di `src/services/watzapService.js`:

```javascript
// Jika status 1005, broadcast akan skip nomor tersebut
if (response.data.status === '1005') {
  logger.error(`Instance not started for ${phoneNumber}`);
  return {
    success: false,
    status: '1005',
    message: 'WhatsApp Instance Not Started'
  };
}
```

### Cek di `src/services/broadcastService.js`:

```javascript
// Progress akan tetap berjalan meskipun ada yang gagal
if (!result.success) {
  failedCount++;
  // Log error tapi lanjut ke nomor berikutnya
}
```

---

## 🔍 Debug Mode

Untuk debug lebih detail, enable logging:

1. **Edit `.env`**:
   ```env
   NODE_ENV=development
   ```

2. **Cek log di terminal**:
   ```
   [INFO] Sending message to: 628996901370
   [INFO] Watzap response: {...}
   ```

3. **Cek file log** (jika ada):
   ```bash
   tail -f logs/app.log
   ```

---

## 📞 Kontak Support

Jika masalah masih berlanjut:

1. **Watzap.id Support**:
   - Website: https://watzap.id
   - WhatsApp: (cek di dashboard)
   - Email: support@watzap.id

2. **Documentation**:
   - API Docs: https://docs.watzap.id
   - Dashboard: https://console.watzap.id

---

## 🎯 Quick Fix (TL;DR)

```bash
# 1. Buka dashboard
open https://console.watzap.id/

# 2. Klik "START" pada instance Anda

# 3. Tunggu status jadi "CONNECTED"

# 4. Test dari backend
node check-watzap-status.js

# 5. Kalau sudah OK, coba kirim broadcast lagi
```

---

## ✅ Status Codes Watzap.id

| Code | Status | Deskripsi | Action |
|------|--------|-----------|--------|
| `200` | ✅ Success | Pesan terkirim | - |
| `1005` | ❌ Instance Not Started | Instance stopped | Start dari dashboard |
| `1001` | ❌ Invalid Number | Nomor tidak valid | Cek format nomor |
| `1002` | ❌ Message Failed | Gagal kirim | Coba lagi |
| `1003` | ❌ Rate Limit | Terlalu cepat kirim | Tunggu sebentar |
| `1004` | ❌ Invalid API Key | API key salah | Cek .env |

---

**Last Updated**: October 2025
