const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
    createReview,
    getStoreReviews,
    getMyReviews,
    checkOrderReview
} = require('../controllers/reviewController');

// Customer routes
router.post('/', verifyToken, checkRole('user'), createReview);
router.get('/my-reviews', verifyToken, checkRole('user'), getMyReviews);
router.get('/check/:orderId', verifyToken, checkRole('user'), checkOrderReview);

// Public routes
router.get('/store/:storeId', getStoreReviews);

module.exports = router;