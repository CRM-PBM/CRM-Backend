const express = require('express');
const cors = require('cors'); 
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');


const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes')
const transaksiRoutes = require('./routes/transaksiRoutes')
const pelangganRoutes = require('./routes/pelanggan')
const kategoriRoutes = require('./routes/kategoriRoutes');
const jenisProdukRoutes = require('./routes/jenisProdukRoutes');
const laporanRoutes = require('./routes/laporanRoutes');

const app = express();

app.use(cors()); 
app.use(cors({
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (public)
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

app.use('/api/admin', adminRoutes);


// health endpoint
app.get('/', (req, res) => res.send('CRM Backend API'));

// error handler
app.use(errorHandler);

module.exports = app;
