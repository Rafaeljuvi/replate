const express = require('express');
const router = express.Router();
const {verifyToken, checkRole} = require('../middleware/authMiddleware');
const { handleWebhook, getPaymentStatus } = require('../controllers/paymentController');

router.post('/webhook', handleWebhook)
router.get('/status/:orderId', verifyToken, checkRole('user'), getPaymentStatus)

module.exports = router;