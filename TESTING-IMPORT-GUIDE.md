# 🧪 Testing Guide - Fitur Import Pelanggan

## 📋 Test Setup

### Prerequisites
```bash
# 1. Install packages
npm install multer xlsx

# 2. Start backend
npm start
# atau dengan nodemon
npm run dev

# 3. Backend harus running di http://localhost:3000
```

### Authentication
Semua test endpoint memerlukan JWT token valid. Cara mendapatkan token:

```bash
# 1. Login terlebih dahulu
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "password": "demo123"
  }'

# Response akan berisi token
# Gunakan token tersebut untuk semua request di bawah
```

---

## 🧪 Test Cases

### Test 1: Download Template (Basic)
**Objective**: Verify template download functionality

```bash
curl -X GET http://localhost:3000/api/pelanggan/template/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o template_pelanggan.csv
```

**Expected Result**:
- ✅ File `template_pelanggan.csv` berhasil didownload
- ✅ File berisi header: `nama,telepon,email,alamat,gender,level`
- ✅ File berisi 2 baris contoh data
- ✅ HTTP Status: 200

---

### Test 2: Import Valid CSV (Happy Path)
**Objective**: Verify basic import functionality with valid data

**File: test_valid.csv**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,0821234567890,budi@example.com,Jl. Raya No. 1,Pria,Regular
Siti Nurhaliza,0829876543210,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium
Ahmad Wijaya,628111222333,ahmad@example.com,Jl. Sudirman No. 10,Pria,
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_valid.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `success: true`
- ✅ `successful: 3`
- ✅ `failed: 0`
- ✅ Semua 3 pelanggan berhasil ditambahkan ke database
- ✅ Nomor telepon ter-normalize ke format 62...
- ✅ Kode pelanggan auto-generated

**Verification**:
```bash
# Cek database
SELECT * FROM pelanggan WHERE nama IN ('Budi Santoso', 'Siti Nurhaliza', 'Ahmad Wijaya');
```

---

### Test 3: Import Valid Excel (.xlsx)
**Objective**: Verify Excel parsing functionality

**File: test_valid.xlsx**
(Same data as test_valid.csv, tapi dalam format Excel)

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_valid.xlsx"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 3`
- ✅ Data parsed correctly dari Excel
- ✅ Result sama seperti CSV import

---

### Test 4: Missing Required Field (Nama)
**Objective**: Verify validation for missing required field

**File: test_missing_nama.csv**
```csv
nama,telepon,email,alamat,gender,level
,0821234567890,budi@example.com,Jl. Raya No. 1,Pria,Regular
Siti Nurhaliza,0829876543210,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_missing_nama.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 1`
- ✅ `failed: 1`
- ✅ Row 2 error: "Nama dan Telepon wajib diisi"
- ✅ Row 3 berhasil ditambahkan

---

### Test 5: Missing Required Field (Telepon)
**Objective**: Verify validation for missing phone number

**File: test_missing_telepon.csv**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,,budi@example.com,Jl. Raya No. 1,Pria,Regular
Siti Nurhaliza,0829876543210,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium
```

**Expected Result**:
- ✅ Row 2 failed: "Nama dan Telepon wajib diisi"
- ✅ Row 3 berhasil ditambahkan
- ✅ `successful: 1, failed: 1`

---

### Test 6: Duplicate Phone Number
**Objective**: Verify duplicate detection

**Precondition**: Import first set of data
```bash
# First import - should succeed
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_valid.csv"
# Result: 3 success
```

**File: test_duplicate.csv**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,0821234567890,budi@example.com,Jl. Raya No. 1,Pria,Regular
```
(Nomor 0821234567890 sudah ada dari import sebelumnya)

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_duplicate.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 0`
- ✅ `failed: 1`
- ✅ Error: "Nomor telepon 0821234567890 sudah terdaftar"

---

### Test 7: Phone Number Format Normalization
**Objective**: Verify phone number normalization

**File: test_phone_formats.csv**
```csv
nama,telepon,email,alamat,gender,level
Customer 1,0821234567890,c1@example.com,Alamat 1,Pria,Regular
Customer 2,621234567890,c2@example.com,Alamat 2,Wanita,Regular
Customer 3,628123456789,c3@example.com,Alamat 3,Pria,Regular
Customer 4,0812-345-67890,c4@example.com,Alamat 4,Wanita,Regular
Customer 5,+62 812 345 67890,c5@example.com,Alamat 5,Pria,Regular
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_phone_formats.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ Semua 5 rows berhasil (format normalization working)
- ✅ Semua nomor di-normalize ke format 62... (8 digits setelah 62)

**Verification**:
```bash
SELECT nama, telepon FROM pelanggan WHERE nama LIKE 'Customer%';
# Hasil harus:
# Customer 1 | 628212345678
# Customer 2 | 621234567890 (format 621 kept as-is)
# Customer 3 | 628123456789
# Customer 4 | 628123456789
# Customer 5 | 628123456789
```

---

### Test 8: Invalid Phone Number Format
**Objective**: Verify rejection of invalid phone formats

**File: test_invalid_phone.csv**
```csv
nama,telepon,email,alamat,gender,level
Customer 1,1234567890,c1@example.com,Alamat 1,Pria,Regular
Customer 2,555,c2@example.com,Alamat 2,Wanita,Regular
Customer 3,abcdefghijk,c3@example.com,Alamat 3,Pria,Regular
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_invalid_phone.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 0`
- ✅ `failed: 3`
- ✅ Semua rows error dengan pesan: "Format nomor telepon tidak valid"

---

### Test 9: Invalid Gender Value
**Objective**: Verify optional field validation

**File: test_invalid_gender.csv**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,0821234567890,budi@example.com,Jl. Raya No. 1,Invalid,Regular
Siti Nurhaliza,0829876543210,siti@example.com,Jl. Gatot Subroto No. 5,Wanita,Premium
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_invalid_gender.csv"
```

**Expected Result**:
- ✅ Row 2 error: "Gender harus 'Pria' atau 'Wanita'"
- ✅ Row 3 berhasil ditambahkan
- ✅ `successful: 1, failed: 1`

---

### Test 10: Optional Fields Handling
**Objective**: Verify optional fields are correctly processed

**File: test_optional_fields.csv**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso,0821234567890,,Jl. Raya No. 1,Pria,
Siti Nurhaliza,0829876543210,siti@example.com,,Wanita,Premium
Ahmad Wijaya,628111222333,ahmad@example.com,Jl. Sudirman No. 10,,Regular
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_optional_fields.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 3`
- ✅ `failed: 0`
- ✅ Data dengan empty optional fields tetap tersimpan
- ✅ Gender dan level dapat null di database

**Verification**:
```bash
SELECT nama, email, alamat, gender, level FROM pelanggan 
WHERE nama IN ('Budi Santoso', 'Siti Nurhaliza', 'Ahmad Wijaya');
# Budi Santoso: email=NULL, level=NULL
# Siti Nurhaliza: alamat=NULL
# Ahmad Wijaya: gender=NULL
```

---

### Test 11: Whitespace Trimming
**Objective**: Verify whitespace is properly trimmed

**File: test_whitespace.csv**
```csv
nama,telepon,email,alamat,gender,level
  Budi Santoso  , 0821234567890 ,  budi@example.com  ,  Jl. Raya  ,  Pria  ,  Regular  
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_whitespace.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 1`
- ✅ Data tersimpan dengan whitespace ter-trim
- ✅ Nama: "Budi Santoso" (tanpa extra spaces)

---

### Test 12: Special Characters in Name & Address
**Objective**: Verify special characters are handled correctly

**File: test_special_chars.csv**
```csv
nama,telepon,email,alamat,gender,level
Budi Santoso Jr.,0821234567890,budi@example.com,Jl. Raya No. 1 (Gedung A),Pria,Regular
Ahmad & Teman-teman,0829876543210,ahmad@example.com,Jl. Sudirman No. 5/A,Pria,Regular
"Tuti, Suhartini & Keluarga",628111222333,tuti@example.com,Jl. Gatot Subroto No. 10 - Blok C,Wanita,Premium
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_special_chars.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200
- ✅ `successful: 3`
- ✅ Special characters correctly parsed dan tersimpan
- ✅ Quoted fields dengan comma handled correctly

---

### Test 13: Large File (Performance Test)
**Objective**: Verify handling of large files

**File: test_large.csv** (1000 rows)
```
# Generate dengan script:
# Row 1: Header
# Row 2-1001: 1000 pelanggan dengan data unik
```

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_large.csv"
```

**Expected Result**:
- ✅ HTTP Status: 200 (within reasonable time, e.g., <30 seconds)
- ✅ `successful: 1000`
- ✅ `failed: 0`
- ✅ Memory usage reasonable
- ✅ All 1000 rows saved to database

---

### Test 14: File Too Large (5MB+)
**Objective**: Verify file size limit enforcement

**File: test_huge.csv** (>5MB)

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_huge.csv"
```

**Expected Result**:
- ✅ HTTP Status: 400 atau 413 (Request Entity Too Large)
- ✅ Error message: File size exceeds maximum allowed

---

### Test 15: Invalid File Format
**Objective**: Verify rejection of unsupported file formats

**File: test_invalid.txt** (atau .pdf, .doc, dll)

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_invalid.txt"
```

**Expected Result**:
- ✅ HTTP Status: 400
- ✅ Error message: "Hanya file CSV atau Excel yang diizinkan"

---

### Test 16: No File Provided
**Objective**: Verify error handling when no file uploaded

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer YOUR_TOKEN"
# Tanpa -F "file=@..."
```

**Expected Result**:
- ✅ HTTP Status: 400
- ✅ Error message: "File tidak ditemukan. Silakan upload file CSV atau Excel"

---

### Test 17: Missing Authentication
**Objective**: Verify authentication requirement

**Request**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -F "file=@test_valid.csv"
# Tanpa Authorization header
```

**Expected Result**:
- ✅ HTTP Status: 401
- ✅ Error message: Unauthorized

---

### Test 18: Multi-UMKM Isolation
**Objective**: Verify data isolation between different UMKM users

**Setup**:
1. Login dengan user UMKM A → dapatkan tokenA
2. Login dengan user UMKM B → dapatkan tokenB
3. Import data dengan tokenA
4. Import data dengan tokenB

**Request UMKM A**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer TOKEN_A" \
  -F "file=@test_data_a.csv"
```

**Request UMKM B**:
```bash
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer TOKEN_B" \
  -F "file=@test_data_b.csv"
```

**Expected Result**:
- ✅ Pelanggan dari UMKM A hanya dilihat oleh UMKM A
- ✅ Pelanggan dari UMKM B hanya dilihat oleh UMKM B
- ✅ Duplicate phone numbers allowed per UMKM (tokenA and tokenB bisa punya nomor sama)

**Verification**:
```bash
# Query dengan UMKM A
SELECT * FROM pelanggan WHERE umkm_id = 1;

# Query dengan UMKM B
SELECT * FROM pelanggan WHERE umkm_id = 2;
```

---

## 🚀 Running Test Suite

### Automated Testing Script

**File: test-import-pelanggan.sh**
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN="your_token_here"

echo "🧪 Starting Import Feature Tests..."

# Test 1: Download Template
echo "Test 1: Download Template"
curl -X GET $BASE_URL/api/pelanggan/template/download \
  -H "Authorization: Bearer $TOKEN" \
  -o template_pelanggan.csv
echo "✅ Template downloaded"

# Test 2: Import Valid CSV
echo "Test 2: Import Valid CSV"
curl -X POST $BASE_URL/api/pelanggan/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_valid.csv"
echo "✅ Import test completed"

echo "🎉 All tests completed!"
```

**Run**:
```bash
chmod +x test-import-pelanggan.sh
./test-import-pelanggan.sh
```

---

## 📊 Test Data Generator

### Python Script untuk Generate Large CSV

**File: generate_test_data.py**
```python
import csv
import random

# Generate 1000 rows test data
with open('test_large.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['nama', 'telepon', 'email', 'alamat', 'gender', 'level'])
    
    for i in range(1, 1001):
        nama = f"Customer {i}"
        telepon = f"0821{random.randint(10000000, 99999999)}"
        email = f"customer{i}@example.com"
        alamat = f"Jl. Jalan {i}, Kota"
        gender = random.choice(['Pria', 'Wanita'])
        level = random.choice(['Regular', 'Premium', 'VIP'])
        
        writer.writerow([nama, telepon, email, alamat, gender, level])

print("✅ Generated test_large.csv with 1000 rows")
```

**Run**:
```bash
python generate_test_data.py
```

---

## ✅ Test Results Checklist

### Test Summary Template

```
┌─ IMPORT FEATURE TEST REPORT ─────────────────────────┐
│                                                      │
│ Date: _______________                               │
│ Tester: ______________                              │
│ Backend Version: _______________                    │
│                                                      │
├─ BASIC FUNCTIONALITY ────────────────────────────────┤
│ [✓] Download Template                               │
│ [✓] Import Valid CSV                                │
│ [✓] Import Valid Excel                              │
│ [✓] Required Field Validation                       │
│ [✓] Phone Format Normalization                      │
│ [✓] Duplicate Detection                             │
│ [✓] Optional Fields Handling                        │
│                                                      │
├─ ERROR HANDLING ────────────────────────────────────┤
│ [✓] Missing File Error                              │
│ [✓] Invalid Format Error                            │
│ [✓] File Too Large Error                            │
│ [✓] Invalid Phone Format Error                      │
│ [✓] Invalid Gender Error                            │
│                                                      │
├─ SECURITY & ISOLATION ──────────────────────────────┤
│ [✓] Authentication Required                         │
│ [✓] UMKM Data Isolation                             │
│ [✓] No SQL Injection Risk                           │
│                                                      │
├─ PERFORMANCE ───────────────────────────────────────┤
│ [✓] 100 rows: ___ ms                                │
│ [✓] 500 rows: ___ ms                                │
│ [✓] 1000 rows: ___ ms                               │
│                                                      │
├─ DATABASE INTEGRITY ────────────────────────────────┤
│ [✓] Correct Row Count                               │
│ [✓] Correct Field Values                            │
│ [✓] Correct Relationships                           │
│ [✓] Auto-Generated Fields Correct                   │
│                                                      │
└─ OVERALL RESULT: PASS / FAIL ──────────────────────┘
```

---

## 🔍 Debugging Tips

### Enable Logging
```javascript
// In src/services/pelangganService.js
// Uncomment logger.debug() calls for detailed logging
```

### Database Query Validation
```sql
-- Check imported data
SELECT COUNT(*) as total_pelanggan FROM pelanggan WHERE umkm_id = YOUR_UMKM_ID;

-- Check phone number normalization
SELECT nama, telepon FROM pelanggan WHERE telepon LIKE '62%' AND umkm_id = YOUR_UMKM_ID;

-- Check auto-generated kode_pelanggan
SELECT kode_pelanggan FROM pelanggan WHERE umkm_id = YOUR_UMKM_ID LIMIT 5;
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on import endpoint | Check if routes registered in index.js |
| File not uploading | Check multer config in routes/pelanggan.js |
| Phone format not normalized | Check formatPhoneNumber() in service |
| Duplicate not detected | Check database query for existing phone |
| UMKM isolation not working | Verify req.umkmId passed correctly |
| Excel file not parsing | Verify xlsx package installed |

---

**Next Steps**: 
1. Run manual tests dengan curl/Postman
2. Run automated test script
3. Verify database integrity
4. Document any issues/bugs found
5. Create pull request when all tests pass ✅
