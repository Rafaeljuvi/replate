const express = require('express');
const router = express.Router();


const { verifyToken } = require('../middleware/authMiddleware');

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductActive
} = require('../controllers/productController');
const {uploadProductImage} = require('../middleware/uploadMiddleware');

// Create product
router.post('/merchant/products', verifyToken, uploadProductImage.single('image'), createProduct);

// Get all products (for current merchant)
router.get('/merchant/products', verifyToken, getProducts);

// Get single product
router.get('/merchant/products/:id', verifyToken, getProductById);

// Update product
router.patch('/merchant/products/:id', verifyToken, uploadProductImage.single('image'), updateProduct);

// Delete product
router.delete('/merchant/products/:id', verifyToken, deleteProduct);

// Toggle product active/inactive
router.patch('/merchant/products/:id/toggle', verifyToken, toggleProductActive);

module.exports = router;