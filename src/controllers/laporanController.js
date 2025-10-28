const laporanService = require('../services/laporanService'); // Sesuaikan path

exports.getSalesReports = async (req, res) => {
    const { umkmId } = req;
    const { startDate, endDate } = req.query;

    try {
        const data = await laporanService.getSalesReports(umkmId, startDate, endDate);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in getSalesReports controller:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil laporan penjualan.' });
    }
};

exports.getCustomerReport = async (req, res) => {
    const { umkmId } = req;
    const { startDate, endDate } = req.query;

    try {
        const data = await laporanService.getCustomerReport(umkmId, startDate, endDate);
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error in getCustomerReport controller:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil laporan pelanggan.' });
    }
};