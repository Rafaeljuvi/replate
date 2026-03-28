const express = require('express')
const router = express.Router();
const {verifyToken, checkRole} = require('../middleware/authMiddleware')
const {
    createOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder,
    getStoreOrders,
    updateOrderStatus,
    getStoreOrderDetail
} = require('../controllers/orderController')

//Merchant Routes
router.get('/store/list', verifyToken, checkRole('merchant'), getStoreOrders)
router.patch('/store/:orderId/status', verifyToken, checkRole('merchant'), updateOrderStatus)
// Tambahkan route baru untuk merchant
router.get('/store/:orderId/detail', verifyToken, checkRole('merchant'), getStoreOrderDetail);

//Customer routes
router.post('/', verifyToken, checkRole('user'), createOrder);
router.get('/', verifyToken, checkRole('user'), getMyOrders);
router.get('/:orderId', verifyToken, checkRole('user'), getOrderDetail);
router.patch('/:orderId/cancel', verifyToken, checkRole('user'), cancelOrder)



module.exports = router;