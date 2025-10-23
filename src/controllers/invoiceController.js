const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit'); 

const Invoice = require('../models/Invoice');
const Transaksi = require('../models/Transaksi');
const DetailTransaksi = require('../models/DetailTransaksi');
const Pelanggan = require('../models/Pelanggan'); 
const Produk = require('../models/Produk'); 
const Umkm = require('../models/Umkm');

// Lokasi penyimpanan file Invoice PDF
const INVOICE_DIR = path.join(__dirname, '..', '..', 'public', 'invoices'); 
if (!fs.existsSync(INVOICE_DIR)) {
    fs.mkdirSync(INVOICE_DIR, { recursive: true });
}

// Fungsi Helper untuk generate Nomor Invoice Unik (Contoh sederhana)
const generateInvoiceNumber = async (umkmId) => {
    // Format: INV-[UMKM ID]-[YYMMDD-HHMMSS]-[SEQUENCE]
    const now = new Date();

    const year = now.getFullYear();
    // Tambahkan 1 karena getMonth() mengembalikan 0-11
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;

    // WAKTU (HHMMSS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}${minutes}${seconds}`;

    const count = await Invoice.count({}); 
    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${umkmId}-${dateString}-${timeString}-${sequence}`;
};

// --- 1. MEMBUAT INVOICE DARI TRANSAKSI ---
exports.createInvoice = async (req, res) => {
    const { transaksiId } = req.body;
    const umkmId = parseInt(req.umkmId, 10); 
    console.log(`[DEBUG] UMKM ID dari Token: ${umkmId}`);

    try {
        // 1. Cek apakah Transaksi sudah ada Invoice
        const existingInvoice = await Invoice.findOne({ where: { transaksi_id: transaksiId } });
        if (existingInvoice) {
            console.error(`[ERROR] Gagal menemukan data UMKM dengan ID: ${umkmId}`);
            return res.status(400).json({ msg: 'Transaksi ini sudah memiliki Invoice.' });
        }

        // 2. Ambil data Transaksi dan Detailnya
        const transactionData = await Transaksi.findByPk(transaksiId, {
            include: [
                { model: Pelanggan, attributes: ['nama', 'alamat', 'telepon', 'email'] },
                { 
                    model: DetailTransaksi, 
                    include: [{ model: Produk, attributes: ['nama_produk'] }] 
                },
            ]
        });

        if (!transactionData) {
            return res.status(404).json({ msg: 'Transaksi tidak ditemukan.' });
        }

        // AMBIL DATA UMKM YANG TERKAIT
        const umkmData = await Umkm.findByPk(umkmId);
        if (!umkmData) {
            return res.status(404).json({ msg: 'Data UMKM tidak ditemukan.' });
        }

        // 3. Generate Nomor Invoice
        const nomorInvoice = await generateInvoiceNumber(umkmId);

        // 4. Generate PDF
        const fileName = `${nomorInvoice}.pdf`;
        const filePath = path.join(INVOICE_DIR, fileName);
        
        // FUNGSI UTAMA GENERATE PDF - Sekarang menerima umkmData juga
        await generatePdfFile(transactionData, nomorInvoice, filePath, umkmData);

        // 5. Simpan record Invoice ke database
        const newInvoice = await Invoice.create({
            nomor_invoice: nomorInvoice,
            tanggal_cetak: new Date(),
            path_file: `/invoices/${fileName}`, 
            transaksi_id: transaksiId
        });

        res.status(201).json({ 
            msg: 'Invoice berhasil dibuat dan disimpan.', 
            invoice: newInvoice,
            download_url: `/invoices/${fileName}`
        });

    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ msg: 'Gagal membuat Invoice. Terjadi kesalahan server.' });
    }
};

// --- 2. MENDAPATKAN DETAIL INVOICE (tidak berubah) ---
exports.getInvoiceDetail = async (req, res) => {
    const { invoiceId } = req.params;

    try {
        const invoiceData = await Invoice.findByPk(invoiceId, {
            include: [{ 
                model: Transaksi,
                include: [
                    { model: Pelanggan, attributes: ['nama', 'alamat', 'telepon'] },
                    { 
                        model: DetailTransaksi, 
                        include: [{ model: Produk, attributes: ['nama_produk'] }] 
                    },
                ]
            }]
        });

        if (!invoiceData) {
            return res.status(404).json({ msg: 'Invoice tidak ditemukan.' });
        }

        res.json(invoiceData);
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ msg: 'Gagal mengambil data Invoice.' });
    }
};

// --- FUNGSI GENERATE PDF (VERSI RAPI) ---
// Fungsi sekarang menerima umkmData sebagai parameter
const generatePdfFile = (transaction, nomorInvoice, filePath, umkmData) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(fs.createWriteStream(filePath))
            .on('finish', resolve)
            .on('error', reject);

        // --- HELPER UNTUK MENGGAMBAR GARIS ---
        const drawLine = (y, thickness = 0.5, color = '#cccccc') => {
            doc.strokeColor(color)
                .lineWidth(thickness)
                .moveTo(50, y)
                .lineTo(doc.page.width - 50, y)
                .stroke();
        };


        doc.fontSize(10)
            .fillColor('#4b5563') // Warna abu-abu teks sekunder
            .text(umkmData.nama_umkm.toUpperCase(), 50, 50, { align: 'left' }); 
        
        doc.text(`NO. ${nomorInvoice}`, doc.page.width - 250, 50, { width: 200, align: 'right' });
        
        doc.moveDown(0.5); // Memberi sedikit jarak
        doc.fontSize(28)
           .fillColor('#1e293b') // Warna abu-abu gelap
           .text('INVOICE', 50, doc.y, { align: 'left' }); // Posisi setelah UMKM Anda

        doc.moveDown(1);
        doc.fontSize(10)
            .fillColor('#4b5563')
            .text(`Date: ${new Date(transaction.tanggal_transaksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 50, doc.y);
        doc.moveDown(2);


        // --- INFORMASI Billed To (Pelanggan) dan From (UMKM Anda) ---
        const startYInfo = doc.y;
        
        doc.fontSize(10).font('Helvetica-Bold').text('Billed to:', 50, startYInfo);
        doc.font('Helvetica').text(transaction.Pelanggan.nama, 50, doc.y);
        doc.text(transaction.Pelanggan.alamat || 'N/A', 50, doc.y);
        doc.text(transaction.Pelanggan.telepon || 'N/A', 50, doc.y);
        doc.text(transaction.Pelanggan.email || 'N/A', 50, doc.y);

        doc.y = startYInfo; // Reset Y position untuk kolom kanan
        doc.font('Helvetica-Bold').text('From:', doc.page.width / 2 + 20, startYInfo); // Mulai dari tengah + offset
        doc.font('Helvetica').text(umkmData.nama_umkm, doc.page.width / 2 + 20, doc.y);
        doc.text(umkmData.alamat || 'N/A', doc.page.width / 2 + 20, doc.y);
        doc.text(umkmData.telepon || 'N/A', doc.page.width / 2 + 20, doc.y);
        doc.text(umkmData.email || 'N/A', doc.page.width / 2 + 20, doc.y);

        doc.moveDown(3);


        // --- TABEL DETAIL TRANSAKSI ---
        const tableTop = doc.y;
        const itemX = 50;
        const qtyX = 300;
        const priceX = 370;
        const amountX = 480;

        // Header Tabel
        doc.font('Helvetica-Bold')
           .fillColor('#1e293b')
           .fontSize(10);
        doc.text('Item', itemX, tableTop, { width: 200 });
        doc.text('Quantity', qtyX, tableTop, { width: 50, align: 'right' });
        doc.text('Price', priceX, tableTop, { width: 100, align: 'right' });
        doc.text('Amount', amountX, tableTop, { width: 100, align: 'right' });
        
        drawLine(tableTop + 15); // Garis bawah header

        // Isi Tabel
        doc.font('Helvetica').fillColor('#4b5563');
        let currentY = tableTop + 25;

        transaction.DetailTransaksis.forEach(item => {
            const hargaSatuan = parseFloat(item.harga_satuan);
            const subtotal = parseFloat(item.subtotal);
            
            doc.text(item.Produk.nama_produk, itemX, currentY, { width: 200 });
            doc.text(item.jumlah.toString(), qtyX, currentY, { width: 50, align: 'right' });
            doc.text(`Rp ${hargaSatuan.toFixed(2)}`, priceX, currentY, { width: 100, align: 'right' });
            doc.text(`Rp ${subtotal.toFixed(2)}`, amountX, currentY, { width: 100, align: 'right' });
            
            currentY += 20; // Jarak antar baris
            if (currentY + 30 > doc.page.height - 100) { // Cek apakah perlu halaman baru
                doc.addPage();
                currentY = 50;
            }
        });

        drawLine(currentY + 10); 
        currentY += 20;

        // TOTAL
        const totalAmount = parseFloat(transaction.total);
        doc.font('Helvetica-Bold').fontSize(12)
           .fillColor('#1e293b')
           .text('Total', amountX - 50, currentY, { width: 50, align: 'right', continued: true });
        doc.text(`Rp ${totalAmount.toFixed(2)}`, amountX, currentY, { width: 100, align: 'right' });
        doc.moveDown(2);

        // Informasi Tambahan (Metode Pembayaran, Keterangan)
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('Payment method:', 50, doc.y);
        doc.font('Helvetica').fillColor('#4b5563').text(transaction.metode_pembayaran || 'N/A', 50, doc.y);
        doc.moveDown(0.5);

        doc.font('Helvetica-Bold').fillColor('#1e293b').text('Note:', 50, doc.y);
        doc.font('Helvetica').fillColor('#4b5563').text(transaction.keterangan || 'Terima kasih atas pembelian Anda!', 50, doc.y);
    
        doc.end();
    });
};