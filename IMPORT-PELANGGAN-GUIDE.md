# 📥 Fitur Import Pelanggan dari CSV/Excel

## 📋 Overview

Fitur ini memungkinkan UMKM untuk mengimport data pelanggan secara massal dari file CSV atau Excel dengan hanya membutuhkan **nama** dan **telepon** sebagai data prioritas.

---

## 🚀 Setup

### Step 1: Install Required Packages

```bash
npm install multer xlsx
```

**Packages:**
- `multer` - Handle file upload
- `xlsx` - Parse Excel files (.xlsx, .xls)

CSV parsing menggunakan built-in string methods (no additional package needed).

### Step 2: Backend akan otomatis ter-restart

Setelah instalasi, backend akan mendeteksi perubahan dan ter-restart dengan nodemon.

---

## 📱 API Endpoints

### 1. Download Template CSV
```
GET /api/pelanggan/template/download
Authorization: Bearer {token}
```

**Response**: File CSV dengan nama `template_pelanggan.csv`

**Contoh Template:**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,628123456789,budi@example.com,Jl. Raya No. 1,Pria,Regular
Siti Nurhaliza,628987654321,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium
```

---

### 2. Import Pelanggan dari File
```
POST /api/pelanggan/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- file: [CSV atau Excel file]
```

**Request (using curl):**
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@pelanggan.csv"
```

**Response Success:**
```json
{
  "success": true,
  "message": "Import berhasil! 10 pelanggan berhasil ditambahkan",
  "data": {
    "total_rows": 10,
    "successful": 10,
    "failed": 0,
    "results": [
      {
        "row": 2,
        "status": "success",
        "pelanggan_id": 1,
        "kode_pelanggan": "PEL010102001",
        "nama": "Budi Santoso",
        "telepon": "628123456789"
      }
    ]
  }
}
```

**Response dengan Errors:**
```json
{
  "success": true,
  "message": "Import berhasil! 8 pelanggan berhasil ditambahkan",
  "data": {
    "total_rows": 10,
    "successful": 8,
    "failed": 2,
    "errors": [
      {
        "row": 3,
        "error": "Nama dan Telepon wajib diisi",
        "data": { "nama": "", "telepon": "" }
      },
      {
        "row": 5,
        "error": "Nomor telepon 628123456789 sudah terdaftar",
        "data": { "nama": "Budi", "telepon": "628123456789" }
      }
    ],
    "results": [...]
  }
}
```

---

## 📊 Format File Input

### CSV Format
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,628123456789,budi@example.com,Jl. Raya No. 1,Pria,Regular
Siti Nurhaliza,628987654321,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium
Ahmad Wijaya,628111222333,ahmad@example.com,Jl. Sudirman No. 10,Pria,
```

### Excel Format
Same column headers as CSV, but in Excel format.

---

## ✅ Required & Optional Fields

| Field | Type | Required | Catatan |
|-------|------|----------|---------|
| **nama** | String | ✅ Yes | Nama lengkap pelanggan |
| **telepon** | String | ✅ Yes | Nomor telepon (format: 0821..., 621..., atau 621...) |
| email | String | ❌ No | Email pelanggan |
| alamat | String | ❌ No | Alamat lengkap |
| gender | String | ❌ No | "Pria" atau "Wanita" |
| level | String | ❌ No | Level pelanggan (Regular, Premium, dll) |

---

## 🔄 Data Processing

### Validasi yang Dilakukan

1. **Nama & Telepon Tidak Boleh Kosong**
   - Jika salah satu kosong, baris akan di-skip dengan error

2. **Format Nomor Telepon**
   - Valid formats: 0821..., 621..., atau 628...
   - System otomatis normalize ke format 62...
   - Contoh: `0821123456789` → `628211123456789`

3. **Duplikasi Nomor Telepon**
   - Nomor telepon yang sama dalam satu UMKM tidak boleh double
   - Jika duplikat, baris akan di-skip dengan error

4. **Format Data**
   - Gender hanya: "Pria" atau "Wanita"
   - Email jika ada harus valid format
   - Whitespace otomatis di-trim

### Proses Tambahan

1. **Generate Kode Pelanggan** - Otomatis
   - Format: `PEL[UMKM_ID][GENDER_CODE][SEQUENCE]`
   - Contoh: `PEL010102001`

2. **Timestamp** - Otomatis
   - `created_at` dan `updated_at` set ke waktu sekarang

3. **UMKM ID** - Otomatis
   - Diambil dari JWT token user yang login

---

## 🔒 Batasan & Limitasi

### File Size
- Maximum file size: **5 MB**

### File Format
- Accepted: `.csv`, `.xlsx`, `.xls`
- MIME types: `text/csv`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Performance
- Recommended max rows per file: 1000-5000
- Processing time: ~100-500ms per row

### Concurrent Imports
- No limit pada concurrent imports (tapi tergantung server resources)

---

## 📝 Contoh Penggunaan

### Menggunakan Postman

1. **Download Template**
   - Method: GET
   - URL: `http://localhost:3000/api/pelanggan/template/download`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Klik "Send" → File akan terdownload

2. **Edit Template**
   - Buka file CSV di Excel atau text editor
   - Isi data pelanggan (minimal: nama & telepon)
   - Simpan file

3. **Upload File**
   - Method: POST
   - URL: `http://localhost:3000/api/pelanggan/import`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body → form-data
   - Key: `file`
   - Value: Select file yang sudah diedit
   - Klik "Send"

4. **Lihat Hasil**
   - Response akan menampilkan status import
   - Successful & failed count
   - Detail error untuk baris yang gagal

---

## 🎯 Contoh File untuk Testing

### File: pelanggan_sample.csv
```csv
nama,telepon,email,alamat,gender,level
Andi Pratama,0812-345-6789,andi@example.com,Jl. Merdeka No. 1,Pria,Regular
Dina Kartika,62-821-987-6543,dina@example.com,Jl. Sudirman No. 5,Wanita,Premium
Rudi Hermawan,628123456789,rudi@example.com,Jl. Gatot Subroto No. 10,Pria,
Tuti Suhartini,628987654321,,Jl. Ahmad Yani No. 3,Wanita,VIP
Bambang Sutrisno,628111222333,bambang@example.com,,Pria,Regular
```

---

## ⚠️ Error Handling

### Error: File tidak ditemukan
```json
{
  "success": false,
  "message": "File tidak ditemukan. Silakan upload file CSV atau Excel"
}
```
**Solution**: Upload file terlebih dahulu

### Error: Format file tidak valid
```json
{
  "success": false,
  "message": "Hanya file CSV atau Excel yang diizinkan"
}
```
**Solution**: Gunakan file dengan extension `.csv`, `.xlsx`, atau `.xls`

### Error: File terlalu besar
```json
{
  "success": false,
  "message": "File size exceeds maximum allowed size"
}
```
**Solution**: Gunakan file kurang dari 5 MB

### Error: File kosong
```json
{
  "success": false,
  "message": "File kosong atau format tidak valid"
}
```
**Solution**: Pastikan file memiliki data dan header yang benar

---

## 🧪 Testing Checklist

- [ ] Download template working
- [ ] Import CSV file working
- [ ] Import Excel file working
- [ ] Required field validation working
- [ ] Phone number format validation working
- [ ] Duplicate phone number detection working
- [ ] Gender validation working
- [ ] Error response showing correctly
- [ ] Success response showing correct count
- [ ] Kode pelanggan generated correctly
- [ ] Data saved to database correctly
- [ ] Timestamp auto-set correctly

---

## 📊 Database Impact

### Tabel PELANGGAN
- Rows ditambahkan sesuai dengan jumlah baris valid di file
- Primary key (`pelanggan_id`) auto-increment
- Foreign key (`umkm_id`) otomatis set dari login user

### Tabel UMKM
- No changes

---

## 🔍 Monitoring & Logging

### Logs akan menampilkan:
```
[INFO] Processing import pelanggan for UMKM 1
[INFO] Row 2: Success - Created pelanggan_id 101
[WARN] Row 3: Skipped - Nama dan Telepon wajib diisi
[INFO] Import completed: 8 success, 2 failed
```

---

## 🚀 Performance Tips

1. **Batch Size**
   - Untuk file besar (>1000 rows), split menjadi beberapa file
   - Import satu per satu atau concurrent (tergantung server)

2. **Error Handling**
   - Jika banyak error, check format file terlebih dahulu
   - Gunakan template yang disediakan

3. **Network**
   - Untuk file besar, pastikan koneksi stable
   - Timeout default: sesuai Express config

---

## 🔐 Security

✅ **Implemented**:
- File size limit (5 MB)
- MIME type validation
- Extension validation
- SQL injection prevention (using Sequelize ORM)
- Input sanitization (trim, normalize)
- Authentication required
- UMKM isolation (data only for logged-in UMKM)

✅ **Recommendations**:
- Add rate limiting untuk endpoint import
- Log semua import activities
- Add approval workflow untuk bulk import
- Backup database sebelum import besar

---

## 📖 Integration Example

### Frontend (React/Vue/Angular)

```javascript
// Download template
const downloadTemplate = async () => {
  const response = await fetch('/api/pelanggan/template/download', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_pelanggan.csv';
  a.click();
};

// Import file
const importFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/pelanggan/import', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  
  const result = await response.json();
  console.log(`Import result: ${result.data.successful} success, ${result.data.failed} failed`);
  return result;
};
```

---

## 📝 Version Info

```
Feature: Customer Import from CSV/Excel
Version: 1.0.0
Release Date: November 5, 2025
Status: Ready for Production
Languages: Node.js + Express + Sequelize
Database: MySQL
Required Packages: multer, xlsx
```

---

## 🎓 FAQ

**Q: Apa data minimum untuk import?**
A: Hanya nama dan telepon saja. Data lain (email, alamat, gender, level) optional.

**Q: Nomor telepon format apa yang diterima?**
A: 0821..., 621..., atau 628.... System otomatis normalize.

**Q: Bagaimana kalau ada duplikasi nomor telepon?**
A: Baris akan di-skip dengan error "Nomor telepon sudah terdaftar"

**Q: Berapa limit maksimal baris?**
A: Tidak ada limit teknis, tapi recommended max 5000 baris per file.

**Q: Apakah data bisa di-rollback?**
A: Tidak ada built-in rollback. Jika error, data yang berhasil tetap tersimpan.

**Q: Bisa import ke UMKM lain?**
A: Tidak. Data hanya bisa diimport ke UMKM user yang login.

---

**Untuk pertanyaan lebih lanjut, lihat dokumentasi di folder `/docs`**
