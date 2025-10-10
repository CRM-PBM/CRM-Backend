const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Akses ditolak. Tidak ada token.' });
    }

    try {
        const tokenString = token.substring(7);

        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        
        req.userId = decoded.userId; 
        req.umkmId = decoded.umkmId 
        
        next(); // Lanjutkan ke controller
    } catch (err) {
        res.status(401).json({ msg: 'Token tidak valid/expired.' });
    }
};

module.exports = auth;