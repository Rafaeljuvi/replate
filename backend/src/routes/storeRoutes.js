const express = require('express');
const router = express.Router();

//Import middleware
const { verifyToken } = require('../middleware/authMiddleware');
//Import controller
const { 
    getMerchantStore,
    getMerchantStoreStats,
    updateMerchantStore
 } = require('../controllers/storeController');
const { uploadMerchantImages } = require('../middleware/uploadMiddleware');

router.get('/merchant/store', verifyToken, getMerchantStore);
router.get('/merchant/store/stats', verifyToken, getMerchantStoreStats)
router.patch('/merchant/store', verifyToken, uploadMerchantImages.single('logo'), updateMerchantStore);

module.exports = router;