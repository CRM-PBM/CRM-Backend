const express = require('express');
const cors = require('cors'); 
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes')
const transaksiRoutes = require('./routes/transaksiRoutes')
const pelangganRoutes = require('./routes/pelanggan')
const kategoriRoutes = require('./routes/kategoriRoutes');
const jenisProdukRoutes = require('./routes/jenisProdukRoutes');
const laporanRoutes = require('./routes/laporanRoutes');

const app = express();

// CORS configuration - allow requests from frontend
app.use(cors({
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Local production
        'http://localhost:5174',  // Alternative port
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (public) - serve uploads
app.use(express.static('public'));

// API routes
app.use('/api', routes);
app.use('/api/auth', authRoutes); 
app.use('/api/invoice', invoiceRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/pelanggan', pelangganRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/jenis', jenisProdukRoutes);
app.use('/api/laporan', laporanRoutes);


// health endpoint
app.get('/', (req, res) => res.send('CRM Backend API'));

// error handler
app.use(errorHandler);

module.exports = app;
