const jwt = require('jsonwebtoken');
const config = require('../config');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ 
            msg: 'Akses ditolak. Tidak ada token.',
            code: 'NO_TOKEN'
        });
    }

    try {
        const tokenString = token.substring(7);

        const decoded = jwt.verify(tokenString, config.jwt.secret);
        
        req.userId = decoded.userId; 
        req.umkmId = decoded.umkmId;
        req.role = decoded.role;
        
        next(); // Lanjutkan ke controller
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                msg: 'Access token expired. Silakan refresh token.',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(401).json({ 
            msg: 'Token tidak valid.',
            code: 'INVALID_TOKEN'
        });
    }
};

module.exports = auth;