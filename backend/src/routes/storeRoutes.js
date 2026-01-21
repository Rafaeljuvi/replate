const express = require('express');
const router = express.Router();

//Import middleware
const { verifyToken } = require('../middleware/authMiddleware');
//Import controller
const { getMerchantStore } = require('../controllers/storeController');

router.get('/merchant/store', verifyToken, getMerchantStore);

module.exports = router;