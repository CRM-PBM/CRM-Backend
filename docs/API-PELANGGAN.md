# REST API Pelanggan

Base URL: `http://localhost:3000/api`

## Endpoints

### 1. Get All Pelanggan
**GET** `/api/pelanggan`

Query Parameters:
- `page` (optional): Nomor halaman, default: 1
- `limit` (optional): Jumlah data per halaman, default: 10
- `umkm_id` (optional): Filter berdasarkan UMKM
- `level` (optional): Filter berdasarkan level pelanggan
- `gender` (optional): Filter berdasarkan gender (Pria/Wanita)
- `search` (optional): Pencarian berdasarkan nama, email, atau telepon

Response:
```json
{
  "success": true,
  "message": "Data pelanggan berhasil diambil",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 2. Get Pelanggan by ID
**GET** `/api/pelanggan/:id`

Response:
```json
{
  "success": true,
  "message": "Data pelanggan berhasil diambil",
  "data": {
    "pelanggan_id": 1,
    "nama": "John Doe",
    "telepon": "08123456789",
    "email": "john@example.com",
    "gender": "Pria",
    "level": "VIP",
    "umkm_id": 1,
    "Umkm": {
      "umkm_id": 1,
      "nama_umkm": "Toko ABC"
    }
  }
}
```

### 3. Create Pelanggan
**POST** `/api/pelanggan`

Request Body:
```json
{
  "nama": "John Doe",
  "telepon": "08123456789",
  "email": "john@example.com",
  "gender": "Pria",
  "level": "VIP",
  "umkm_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Pelanggan berhasil ditambahkan",
  "data": {...}
}
```

### 4. Update Pelanggan
**PUT** `/api/pelanggan/:id`

Request Body:
```json
{
  "nama": "John Doe Updated",
  "telepon": "08123456789",
  "email": "john.updated@example.com",
  "gender": "Pria",
  "level": "Gold"
}
```

Response:
```json
{
  "success": true,
  "message": "Pelanggan berhasil diupdate",
  "data": {...}
}
```

### 5. Delete Pelanggan
**DELETE** `/api/pelanggan/:id`

Response:
```json
{
  "success": true,
  "message": "Pelanggan berhasil dihapus"
}
```

## Contoh Penggunaan dengan cURL

### Get All Pelanggan
```bash
curl http://localhost:3000/api/pelanggan

# Dengan pagination
curl "http://localhost:3000/api/pelanggan?page=1&limit=5"

# Dengan filter
curl "http://localhost:3000/api/pelanggan?gender=Pria&level=VIP"

# Dengan search
curl "http://localhost:3000/api/pelanggan?search=john"
```

### Get Pelanggan by ID
```bash
curl http://localhost:3000/api/pelanggan/1
```

### Create Pelanggan
```bash
curl -X POST http://localhost:3000/api/pelanggan \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Jane Doe",
    "telepon": "08198765432",
    "email": "jane@example.com",
    "gender": "Wanita",
    "level": "Silver",
    "umkm_id": 1
  }'
```

### Update Pelanggan
```bash
curl -X PUT http://localhost:3000/api/pelanggan/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Jane Doe Updated",
    "level": "Gold"
  }'
```

### Delete Pelanggan
```bash
curl -X DELETE http://localhost:3000/api/pelanggan/1
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Nama pelanggan wajib diisi"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Pelanggan tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```
