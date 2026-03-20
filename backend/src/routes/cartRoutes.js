const express = require('express')
const router = express.Router();
const {verifyToken, checkRole} = require('../middleware/authMiddleware')

const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require('../controllers/cartController');

router.get('/', verifyToken, checkRole('user'), getCart);
router.post('/items', verifyToken, checkRole('user'), addToCart);
router.patch('/items/:cartItemId', verifyToken, checkRole('user'), updateCartItem);
router.delete('/items/:cartItemId', verifyToken, checkRole('user'), removeCartItem);
router.delete('/', verifyToken, checkRole('user'), clearCart);

module.exports = router;