const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');

// checkAdmin inline — tidak pakai file terpisah
const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

const {
    getPendingStores,
    approveStore,
    rejectStore,
    getAllStores,
    getPlatformStats
} = require('../controllers/adminController');

// Routes
router.get('/stores/pending', verifyToken, checkAdmin, getPendingStores);
router.get('/stores', verifyToken, checkAdmin, getAllStores);
router.patch('/stores/:storeId/approve', verifyToken, checkAdmin, approveStore);
router.patch('/stores/:storeId/reject', verifyToken, checkAdmin, rejectStore);
router.get('/stats', verifyToken, checkAdmin, getPlatformStats);

module.exports = router;