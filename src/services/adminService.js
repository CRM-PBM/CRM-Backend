const Umkm = require('../models/Umkm');
const User = require('../models/User'); 
const Transaksi = require('../models/Transaksi');
const { Sequelize, DataTypes, fn, col, literal, Op } = require('sequelize');
const sequelize = require('../config/database');

const { sendVerificationSuccessEmail } = require('../utils/emailService');

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

    // 1. Update status di database
    await umkm.update({
        status: 'active',
        verified_by: adminId,
        verified_at: new Date()
    });

    // 2. Kirim Notifikasi Otomatis
    try {
        await sendVerificationSuccessEmail(
            umkm.email,        
            umkm.nama_umkm // Mengakses properti langsung dari instance Sequelize
        );
    } catch (emailError) {
        console.error('Error saat memicu notifikasi email:', emailError);
    }
    
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
    let groupFormat;
    let labelKey;

    switch (period) {
        case 'day':
            groupFormat = '%Y-%m-%d';
            labelKey = 'tanggal';
            break;
        case 'week':
            groupFormat = '%Y-%v';
            labelKey = 'minggu';
            break;
        case 'year':
            groupFormat = '%Y';
            labelKey = 'tahun';
            break;
        case 'month':
        default:
            groupFormat = '%Y-%m';
            labelKey = 'bulan';
            break;
    }
    
    const newUmkmData = await Umkm.findAll({
        attributes: [
            [fn('date_format', col('tanggal_daftar'), groupFormat), 'period'], 
            [fn('count', col('umkm_id')), 'new_count']
        ],
        where: {
            status: {
                [Op.in]: ['active', 'pending']
            }
        },
        group: ['period'],
        order: [[literal('period'), 'ASC']] 
    });
    
    const newMap = new Map(newUmkmData.map(item => [
        item.get('period'), 
        item.get('new_count')
    ]));
    
    let cumulativeActive = 0;
    const allPeriods = [...newMap.keys()].sort(); 
    
    const formattedData = allPeriods.map(periodKey => {
        const newCount = parseInt(newMap.get(periodKey), 10) || 0;
        
        cumulativeActive += newCount; 
        
        return {
            [labelKey]: periodKey,
            new_umkm: newCount,
            cumulative_active_umkm: cumulativeActive
        };
    });

    return formattedData;
};