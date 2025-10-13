const sequelize  = require('../config/database'); 
const User = require('../models/User');
const Umkm = require('../models/Umkm');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- LOGIKA REGISTRASI UMKM & USER ---
exports.register = async (req, res) => {
    const { 
        email, 
        password, 
        nama_pemilik, 
        nama_umkm, 
        telepon, 
        alamat 
    } = req.body;

    // 1. Cek email duplikat di tabel User
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email sudah terdaftar. Silakan gunakan email lain.' });
        }
    } catch (error) {
        return res.status(500).json({ msg: 'Gagal mengecek email duplikat.' });
    }

    // 2. Jalankan transaksi
    const t = await sequelize.transaction();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUmkm = await Umkm.create({
            nama_umkm,
            nama_pemilik,
            email: email, 
            telepon,
            alamat
        }, { transaction: t });

        const newUser = await User.create({
            role: 'umkm', 
            email,
            password: hashedPassword,
            umkm_id: newUmkm.umkm_id 
        }, { transaction: t });

        await t.commit();

        const payload = { userId: newUser.user_id, umkmId: newUmkm.umkm_id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });

        res.status(201).json({ 
            msg: 'Registrasi berhasil.', 
            token,
            user: { user_id: newUser.user_id, email: newUser.email, umkm_id: newUmkm.umkm_id, nama_umkm: newUmkm.nama_umkm } 
        });

    } catch (err) {
        await t.rollback();
        console.error("Registrasi Error:", err);
        res.status(500).json({ msg: 'Pendaftaran gagal. Terjadi kesalahan server.' });
    }
};

// --- LOGIKA LOGIN USER ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Cari User berdasarkan email
        const user = await User.findOne({ 
            where: { email },
            // Include model Umkm untuk mengambil nama_umkm
            include: [{ model: Umkm, attributes: ['umkm_id', 'nama_umkm'] }] 
        });

        if (!user) {
            return res.status(400).json({ msg: 'Kredensial tidak valid (Email tidak ditemukan)' });
        }

        // 2. Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Kredensial tidak valid (Password salah)' });
        }

        // 3. Buat JWT Token
        const payload = { 
            userId: user.user_id, 
            umkmId: user.Umkm.umkm_id, // Ambil ID UMKM dari relasi
            role: user.role
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
            expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
        });

        // 4. Update last_login
        await user.update({ last_login: new Date() });

        res.json({ 
            token, 
            user: { 
                user_id: user.user_id, 
                email: user.email, 
                role: user.role,
                umkm_id: user.Umkm.umkm_id,
                nama_umkm: user.Umkm.nama_umkm
            } 
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ msg: 'Terjadi kesalahan server saat login.' });
    }
};