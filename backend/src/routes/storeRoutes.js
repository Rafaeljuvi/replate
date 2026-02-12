const express = require('express');
const router = express.Router();

//Import middleware
const { verifyToken } = require('../middleware/authMiddleware');
//Import controller
const { 
    getMerchantStore,
    getMerchantStoreStats
 } = require('../controllers/storeController');

router.get('/merchant/store', verifyToken, getMerchantStore);
router.get('/merchant/store/stats', verifyToken, getMerchantStoreStats)

module.exports = router;