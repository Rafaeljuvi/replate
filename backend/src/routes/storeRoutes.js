const express = require('express');
const router = express.Router();

//Import middleware
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
//Import controller
const { 
    getMerchantStore,
    getMerchantStoreStats,
    updateMerchantStore,
    getDailyStats,
    getTopSellingProducts
 } = require('../controllers/storeController');
const { uploadMerchantImages } = require('../middleware/uploadMiddleware');

router.get('/merchant/store', verifyToken, getMerchantStore);
router.get('/merchant/store/stats', verifyToken, getMerchantStoreStats)
router.patch('/merchant/store', verifyToken, uploadMerchantImages.single('logo'), updateMerchantStore);
router.get('/merchant/store/daily-stats', verifyToken, checkRole('merchant'), getDailyStats);
router.get('/merchant/store/top-products', verifyToken, checkRole('merchant'), getTopSellingProducts);

module.exports = router;