const adminService = require('../services/adminService');

// [GET] /api/admin/umkm
exports.getAllUmkm = async (req, res) => {
    try {
        const umkmList = await adminService.getAllUmkm();
        res.status(200).json({ 
            msg: 'Daftar UMKM Global berhasil diambil.',
            data: umkmList 
        });
    } catch (error) {
        console.error("Error in getAllUmkm:", error.message);
        res.status(500).json({ msg: 'Gagal mengambil daftar UMKM global.' });
    }
};

// [PUT] /api/admin/umkm/verify/:umkmId
exports.verifyUmkm = async (req, res) => {
    const { umkmId } = req.params;
    const adminId = req.userId; 

    try {
        const updatedUmkm = await adminService.verifyUmkm(umkmId, adminId); // updatedUmkm kini adalah instance UMKM
        res.status(200).json({ 
            msg: `UMKM ${updatedUmkm.nama_umkm} berhasil diverifikasi dan diaktifkan.`, // <-- AKSES NAMA UMKM DENGAN BENAR
            umkm: updatedUmkm.toJSON() 
        });
    } catch (error) {
        const statusCode = error.message.includes('ditemukan') ? 404 : 400;
        res.status(statusCode).json({ msg: error.message });
    }
};

// [PUT] /api/admin/umkm/suspend/:umkmId
exports.suspendUmkm = async (req, res) => {
    const { umkmId } = req.params;
    
    try {
        const updatedUmkm = await adminService.suspendUmkm(umkmId); // updatedUmkm kini adalah instance UMKM
        res.status(200).json({ 
            msg: `UMKM ${updatedUmkm.nama_umkm} berhasil ditangguhkan.`, // INI SUDAH BENAR
            umkm: updatedUmkm.toJSON() 
        });
    } catch (error) {
        const statusCode = error.message.includes('ditemukan') ? 404 : 400;
        res.status(statusCode).json({ msg: error.message });
    }
};

// [GET] /api/admin/stats/global
exports.getGlobalStats = async (req, res) => {
    try {
        const stats = await adminService.getGlobalStats();
        res.status(200).json({ 
            msg: 'Statistik Global berhasil diambil.',
            data: stats 
        });
    } catch (error) {
        console.error("Error in getGlobalStats:", error.message);
        res.status(500).json({ msg: 'Gagal mengambil statistik global.' });
    }
};

// [GET] /api/admin/stats/umkm-growth
exports.getUmkmGrowthData = async (req, res) => {
    const period = req.query.period || 'month'; 
    try {
        const data = await adminService.getUmkmGrowthData(period);
        res.status(200).json({ 
            msg: 'Data pertumbuhan UMKM berhasil diambil.',
            data: data
        });
    } catch (error) {
        console.error("Error in getUmkmGrowthData:", error.message);
        res.status(500).json({ msg: 'Gagal mengambil data pertumbuhan UMKM.' });
    }
};