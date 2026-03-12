const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');

const {
    getPublicProducts,
    getPublicProductById,
    getPublicStores,
    getPublicStoreById
} = require('../controllers/publicController');

router.get('/products', verifyToken, getPublicProducts);
router.get('/products/:id', verifyToken, getPublicProductById);
router.get('/stores', verifyToken, getPublicStores);
router.get('/stores/:id', verifyToken, getPublicStoreById);

module.exports = router;