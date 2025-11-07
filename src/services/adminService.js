const Umkm = require('../models/Umkm');
const User = require('../models/User'); 
const Transaksi = require('../models/Transaksi');
const { Sequelize, DataTypes, fn, col, literal, Op } = require('sequelize');
const sequelize = require('../config/database');

// Mengambil SEMUA daftar UMKM (tanpa filter umkm_id)
exports.getAllUmkm = async () => {
    const umkmList = await Umkm.findAll({
        attributes: [
            'umkm_id', 
            'nama_umkm', 
            'nama_pemilik', 
            'email', 
            'telepon', 
            'status', 
            'tanggal_daftar', 
            'verified_at'
        ],
        order: [['status', 'ASC'], ['tanggal_daftar', 'DESC']] 
    });
    
    return umkmList;
};

// Logika untuk memverifikasi/mengaktifkan UMKM
exports.verifyUmkm = async (umkmId, adminId) => {
    const umkm = await Umkm.findByPk(umkmId);

    if (!umkm) {
        throw new Error('UMKM tidak ditemukan.');
    }

    if (umkm.status === 'active') {
        throw new Error('UMKM ini sudah aktif.'); 
    }

    await umkm.update({
        status: 'active',
        verified_by: adminId,
        verified_at: new Date()
    });

    return umkm;
};

// Logika untuk menangguhkan/mensuspend UMKM
exports.suspendUmkm = async (umkmId) => {
    const umkm = await Umkm.findByPk(umkmId);

    if (!umkm) {
        throw new Error('UMKM tidak ditemukan.');
    }

    if (umkm.status === 'suspended') {
        throw new Error('UMKM ini sudah ditangguhkan.');
    }

    // Update status menjadi suspended
    await umkm.update({
        status: 'suspended'
    });

    return umkm;
};

// [GET] Mengambil metrik utama (Cards)
exports.getGlobalStats = async () => {
    const totalUmkm = await Umkm.count();
    const activeUmkm = await Umkm.count({ where: { status: 'active' } });
    const pendingUmkm = await Umkm.count({ where: { status: 'pending' } });
    
    const totalTransaksiVolume = await Transaksi.count();
    return {
        totalUmkm,
        activeUmkm,
        pendingUmkm,
        totalTransaksiVolume
    };
};


// [GET] Mengambil data pertumbuhan UMKM (untuk Grafik)
exports.getUmkmGrowthData = async (period = 'month') => {
    // 1. Menentukan format SQL berdasarkan periode
    let groupFormat;
    let labelKey;

    switch (period) {
        case 'day':
            groupFormat = '%Y-%m-%d'; // Grouping per hari
            labelKey = 'tanggal';
            break;
        case 'week':
            groupFormat = '%Y-%v'; // Grouping per minggu (Tahun-Minggu ke-)
            labelKey = 'minggu';
            break;
        case 'year':
            groupFormat = '%Y'; // Grouping per tahun
            labelKey = 'tahun';
            break;
        case 'month':
        default:
            groupFormat = '%Y-%m'; // Grouping per bulan
            labelKey = 'bulan';
            break;
    }
    
    // 2. Query untuk menghitung UMKM BARU (berdasarkan tanggal_daftar)
    const newUmkmData = await Umkm.findAll({
        attributes: [
            // Alias: 'period' akan berisi hasil grouping (misal: '2025-10')
            [fn('date_format', col('tanggal_daftar'), groupFormat), 'period'], 
            [fn('count', col('umkm_id')), 'new_count'] // Alias: 'new_count'
        ],
        where: {
            status: {
                [Op.in]: ['active', 'pending']
            }
        },
        group: ['period'],
        order: [[literal('period'), 'ASC']] 
    });
    
    // 3. Mengkonversi hasil Sequelize menjadi Map untuk penggabungan & menghitung kumulatif
    const newMap = new Map(newUmkmData.map(item => [
        item.get('period'), 
        item.get('new_count')
    ]));
    
    // 4. Hitung Kumulatif Aktif (Simulasi UMKM Lama/Akumulasi)
    let cumulativeActive = 0;
    const allPeriods = [...newMap.keys()].sort(); 
    
    const formattedData = allPeriods.map(periodKey => {
        const newCount = parseInt(newMap.get(periodKey), 10) || 0;
        
        // Akumulasi UMKM Aktif
        cumulativeActive += newCount; 
        
        return {
            [labelKey]: periodKey,                  // Label (Bulan/Tahun/Hari)
            new_umkm: newCount,                     // Jumlah UMKM Baru pada periode ini
            cumulative_active_umkm: cumulativeActive // Total Akumulasi Aktif hingga periode ini
        };
    });

    return formattedData;
};