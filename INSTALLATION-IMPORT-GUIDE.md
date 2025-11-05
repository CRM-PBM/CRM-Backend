# 🔧 Installation & Setup Guide - Import Pelanggan Feature

## 📋 Prerequisites

Sebelum mulai, pastikan:
- ✅ Node.js dan npm sudah terinstall
- ✅ Backend sudah berjalan di `http://localhost:3000`
- ✅ Database sudah sync dengan `node src/sync.js`
- ✅ Git branch sudah di-commit

---

## 🚀 Installation Steps

### Step 1: Check Current Node Modules Status

```bash
cd d:\dandy\CRM-Backend

# Cek apakah multer dan xlsx sudah ada
npm list multer xlsx 2>/dev/null || echo "Packages not found"

# Cek versi node
node --version

# Cek npm
npm --version
```

**Expected Output**:
```
v18.x.x (or higher)
8.x.x (or higher)
npm ERR! extraneous - multer (tidak ada)
npm ERR! extraneous - xlsx (tidak ada)
```

---

### Step 2: Install Required Packages

```bash
# Install multer dan xlsx
npm install multer xlsx

# Atau dengan specific versions
npm install multer@1.4.5-lts.1 xlsx@0.18.5
```

**Installation Output** (expected):
```
added 25 packages in 12.34s
```

### Step 3: Verify Installation

```bash
# Verify packages installed
npm list multer xlsx

# Should show:
# your-project@1.0.0
# ├── multer@1.4.5
# └── xlsx@0.18.5
```

### Step 4: Restart Backend

Backend dengan nodemon akan otomatis restart. Tunggu hingga:

```bash
# Terminal akan menunjukkan:
[nodemon] restarting due to changes...
[nodemon] starting `node src/app.js`
Server running on port 3000
Database connected
```

### Step 5: Verify Backend Running

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"OK"}
```

---

## ✅ Post-Installation Verification

### Check 1: Multer Middleware Loaded
```bash
# Backend logs harus show:
# [INFO] Loading middleware...
# [INFO] Multer configured
```

### Check 2: Routes Registered
```bash
curl -X GET http://localhost:3000/api/pelanggan/template/download \
  -H "Authorization: Bearer invalid_token"

# Should return 401 (not 404), meaning route exists
```

### Check 3: Download Template Works
```bash
# Get valid token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}' \
  | jq -r '.data.token')

# Download template
curl -X GET http://localhost:3000/api/pelanggan/template/download \
  -H "Authorization: Bearer $TOKEN" \
  -o template_pelanggan.csv

# Check if file created
ls -la template_pelanggan.csv

# Should show file size > 0
```

---

## 🧪 Quick Test After Installation

### Test 1: Import Template Data

```bash
# 1. Set token
TOKEN="your_jwt_token_here"

# 2. Import sample data
curl -X POST http://localhost:3000/api/pelanggan/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample-import-data.csv"

# 3. Expected response (success):
# {
#   "success": true,
#   "message": "Import berhasil! 9 pelanggan berhasil ditambahkan",
#   "data": {
#     "total_rows": 9,
#     "successful": 9,
#     "failed": 0
#   }
# }
```

### Test 2: Verify Data in Database

```bash
# Connect to MySQL
mysql -u root -p your_password

# Use database
USE crm_backend; # atau sesuai nama database

# Check imported data
SELECT COUNT(*) as total FROM pelanggan;

# Check imported customer details
SELECT pelanggan_id, kode_pelanggan, nama, telepon, created_at 
FROM pelanggan 
ORDER BY created_at DESC LIMIT 5;
```

---

## 📋 Package.json Changes

### Before Installation
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.37.7",
    "mysql2": "^3.15.2",
    // ... other packages
    // ❌ "multer" tidak ada
    // ❌ "xlsx" tidak ada
  }
}
```

### After Installation
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.37.7",
    "mysql2": "^3.15.2",
    // ... other packages
    "multer": "^1.4.5",        // ✅ Ditambah
    "xlsx": "^0.18.5",         // ✅ Ditambah
  }
}
```

---

## 🔍 File Structure Verification

Pastikan file-file berikut sudah ada:

```
src/
├── controllers/
│   └── pelangganController.js          ✅ Modified (importPelanggan method)
├── routes/
│   └── pelanggan.js                    ✅ Modified (multer config + import routes)
├── services/
│   └── pelangganService.js             ✅ Modified (importPelangganFromFile method)
└── ...

Root/
├── IMPORT-PELANGGAN-GUIDE.md            ✅ New file
├── TESTING-IMPORT-GUIDE.md              ✅ New file
├── README-PELANGGAN-IMPORT.md           ✅ New file
├── sample-import-data.csv               ✅ New file
├── package.json                         ✅ Modified (added multer, xlsx)
└── ...
```

**Verify files**:
```bash
# Check if files exist
ls -la IMPORT-PELANGGAN-GUIDE.md
ls -la TESTING-IMPORT-GUIDE.md
ls -la README-PELANGGAN-IMPORT.md
ls -la sample-import-data.csv

# Check if code changes exist in service
grep -c "importPelangganFromFile" src/services/pelangganService.js
# Should return: 1 (meaning method exists)
```

---

## 🐛 Troubleshooting Installation

### Issue 1: npm install fails with network error

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again with verbose logging
npm install multer xlsx --verbose

# Or use alternative registry
npm install multer xlsx --registry https://registry.npm.taobao.org
```

### Issue 2: "Cannot find module 'multer'"

**Solution**:
```bash
# Verify installation
npm list multer

# If missing, reinstall
rm -rf node_modules package-lock.json
npm install

# Or just reinstall specific packages
npm install multer xlsx
```

### Issue 3: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
echo "PORT=3001" >> .env
npm start
```

### Issue 4: Database connection failed

**Solution**:
```bash
# Check database status
mysql -u root -p -e "SELECT 1"

# Verify .env configuration
cat .env | grep DB_

# Sync database again
node src/sync.js
```

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | v14.x | v18.x or higher |
| npm | v6.x | v8.x or higher |
| MySQL | 5.7 | 8.0 or higher |
| RAM | 512MB | 2GB or higher |
| Disk | 500MB | 2GB or higher |

**Check Current System**:
```bash
node --version          # v18.x.x
npm --version           # 8.x.x
mysql --version         # mysql Ver 8.0
```

---

## 🔐 Environment Configuration

Verify `.env` file has all required variables:

```bash
# Check .env file
cat .env | grep -E "PORT|DB_|WATZAP|JWT"

# Should show:
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crm_backend
DB_USER=root
DB_PASSWORD=****
JWT_SECRET=your_secret
```

---

## 📝 Installation Checklist

```
Pre-Installation:
[ ] Backend running at http://localhost:3000
[ ] Database connected
[ ] Git status clean (no uncommitted changes)
[ ] Node.js v14+ installed
[ ] npm v6+ installed

Installation:
[ ] npm install multer xlsx - SUCCESS
[ ] npm list shows multer and xlsx
[ ] Backend auto-restarted with nodemon
[ ] No error messages in terminal

Post-Installation:
[ ] Health endpoint returns {"status":"OK"}
[ ] GET /api/pelanggan/template/download returns 401 (auth required)
[ ] Download template successful with valid token
[ ] Sample CSV import successful
[ ] Database shows imported data

Verification:
[ ] All source files exist and modified
[ ] All documentation files created
[ ] Sample data file exists
[ ] package.json contains multer and xlsx
[ ] npm list confirms versions
[ ] No "Cannot find module" errors
```

---

## 🚀 Ready to Use

Setelah semua langkah di atas selesai, fitur import siap digunakan!

### Next Steps:
1. ✅ **Installation Complete** - Semua packages terinstall
2. ⏳ **Testing** - Buka TESTING-IMPORT-GUIDE.md untuk test cases
3. ⏳ **Documentation** - Lihat IMPORT-PELANGGAN-GUIDE.md untuk API reference
4. ⏳ **Frontend Integration** - Buat upload component di frontend

---

## 💾 Backup & Recovery

### Backup Current Database
```bash
# Backup database sebelum bulk import
mysqldump -u root -p crm_backend > backup_pelanggan_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
# Restore if needed
mysql -u root -p crm_backend < backup_pelanggan_TIMESTAMP.sql
```

---

## 📞 Support Commands

```bash
# Show all installed packages
npm list --depth=0

# Show specific package version
npm list multer xlsx

# Check for updates
npm outdated

# View package documentation
npm view multer
npm view xlsx

# Show npm cache
npm cache ls

# Clear npm cache
npm cache clean --force
```

---

## ✅ Verification Commands Summary

```bash
#!/bin/bash
# Quick verification script

echo "🔍 Verifying Installation..."

# Check Node.js
echo "Node.js version:"
node --version

# Check npm
echo "npm version:"
npm --version

# Check packages
echo "Installed packages:"
npm list multer xlsx 2>/dev/null

# Check backend
echo "Backend status:"
curl -s http://localhost:3000/health

# Check database
echo "Database status:"
mysql -u root -p -e "SELECT 1" 2>/dev/null

echo "✅ Verification complete!"
```

---

## 📖 Documentation Reference

| Document | Purpose |
|----------|---------|
| **IMPORT-PELANGGAN-GUIDE.md** | Complete API & usage guide |
| **TESTING-IMPORT-GUIDE.md** | Comprehensive test cases |
| **README-PELANGGAN-IMPORT.md** | Implementation summary |
| **This file** | Installation guide |

---

**Installation Status**: ✅ Ready to Begin
**Next**: Run `npm install multer xlsx` and restart backend
