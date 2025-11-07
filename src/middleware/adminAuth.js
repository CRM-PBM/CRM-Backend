const adminAuth = (req, res, next) => {
    if (req.userRole && req.userRole === 'admin' ) {
        next();
    } else {
        res.status(403).json({ msg: 'Akses ditolak. Hanya untuk admin.' });
    }
};

module.exports = adminAuth;