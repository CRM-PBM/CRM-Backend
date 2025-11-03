const { Op, literal, fn, col } = require('sequelize');
const sequelize = require('../config/database');
const Transaksi = require('../models/Transaksi');
const DetailTransaksi = require('../models/DetailTransaksi');
const Pelanggan = require('../models/Pelanggan');
const Produk = require('../models/Produk');


const getDateRangeFilter = (startDate, endDate) => {
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); 
        
        return {
            tanggal_transaksi: {
                [Op.gte]: start,
                [Op.lt]: end 
            }
        };
    }
    return {};
};

class LaporanService {
    // 1. Logika Laporan Transaksi
    async getTransactionReports(umkmId, startDate, endDate) {
        const dateFilter = getDateRangeFilter(startDate, endDate);

        // A. Query Summary/Agregasi
        const summary = await Transaksi.findOne({
            attributes: [
                [fn('COUNT', col('transaksi_id')), 'jumlah_transaksi'],
                [fn('SUM', col('total')), 'total_pendapatan'],
                [fn('AVG', col('total')), 'rata_rata'],
            ],
            where: {
                ...dateFilter,
            },
            include: [{ 
                model: Pelanggan, 
                attributes: [],
                where: { umkm_id: umkmId },
                required: true
            }],
            raw: true
        });

        // B. Query Detail List
        const detail = await Transaksi.findAll({
            where: {
                ...dateFilter
            },
            include: [{
                model: Pelanggan, 
                attributes: ['nama'],
                where: { umkm_id: umkmId },
                required: true
            }], 
            order: [['tanggal_transaksi', 'DESC']]
        });

        const totalProfitKotor = parseFloat(summary.total_pendapatan || 0) * 0.3;

        return { 
            summary: { 
                jumlah_transaksi: parseInt(summary.jumlah_transaksi || 0),
                total_pendapatan: parseFloat(summary.total_pendapatan || 0),
                rata_rata: parseFloat(summary.rata_rata || 0),
                
                profit_kotor: totalProfitKotor
            }, 
            detail 
        };
    }

    // 2. Logika Laporan Pelanggan
    async getCustomerReport(umkmId, startDate, endDate) {
        const dateFilter = getDateRangeFilter(startDate, endDate);
        
        try {
            const customerReport = await Pelanggan.findAll({
                attributes: [
                    'pelanggan_id', 'nama', 'Kode_pelanggan','telepon', 'email', 'alamat', 'level','created_at',
                    [fn('COUNT', col('Transaksis.transaksi_id')), 'jumlah_transaksi'],
                    [fn('SUM', col('Transaksis.total')), 'total_pembelian']
                ],
                include: [{
                    model: Transaksi,
                    attributes: [], 
                    where: {
                        ...dateFilter
                    },
                    required: true 
                }],
                where: { umkm_id: umkmId },
                group: [['Pelanggan.pelanggan_id', 'Pelanggan.nama', 'Pelanggan.Kode_pelanggan', 'Pelanggan.telepon', 'Pelanggan.email','Pelanggan.alamat','Pelanggan.level','Pelanggan.created_at']],
                order: [[literal('total_pembelian'), 'DESC']],
                raw: true 
            });

            // Mapping untuk konversi tipe data
            return customerReport.map(c => ({
                ...c,
                jumlah_transaksi: parseInt(c.jumlah_transaksi || 0),
                total_pembelian: parseFloat(c.total_pembelian || 0),
            }));
        } catch (error) {
            console.error("SQL Error di getCustomerReport:", error.message || error);
            throw error;
        }
    }
}

module.exports = new LaporanService();