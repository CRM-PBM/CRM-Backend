const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Konfigurasi transport email
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    pool: true,
    maxConnections: 5,
    auth: {
        user: EMAIL_USER, 
        pass: EMAIL_PASS  
    }
});

exports.sendVerificationSuccessEmail = async (toEmail, umkmName) => {
    // Cek keamanan: memastikan variabel terbaca
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error("Kesalahan Konfigurasi Email: Kredensial tidak ditemukan. Pastikan .env sudah dimuat.");
        return; 
    }

    const mailOptions = {
        from: `CRM UMKM Support <${EMAIL_USER}>`, 
        to: toEmail,
        subject: '🚀 Akun UMKM Anda Telah Diverifikasi!',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #0e7490;">Selamat, ${umkmName}!</h2>
                <p>Kami dengan senang hati memberitahukan bahwa proses verifikasi akun UMKM Anda telah selesai dan <strong>Berhasil disetujui</strong> oleh Administrator kami.</p>
                <p><strong>Anda sekarang dapat masuk dan mulai menggunakan semua fitur di Aplikasi CRM-UMKM.</strong></p>
                <p style="margin-top: 30px; text-align: center;">
                    <a href="https://crmumkm.id/login" 
                       style="background-color: #0e7490; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                       Masuk ke Aplikasi Anda
                    </a>
                </p>
                <p style="margin-top: 50px; font-size: 0.8em; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
                    Salam Hormat,<br>
                    Tim Administrator CRM-UMKM
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email notifikasi verifikasi berhasil dikirim ke: ${toEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ Gagal mengirim email ke ${toEmail}. Error:`, error.message);
    }
};