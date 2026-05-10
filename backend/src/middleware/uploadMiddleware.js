const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File filter untuk validasi gambar
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
};

// Product Image Storage (Cloudinary)
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'replate/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        public_id: (req, file) => `product-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
    },
});

const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Merchant Image Storage (ID Card & Logo) - Cloudinary
const merchantStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'replate/merchant/misc';
        let prefix = 'file';

        if (file.fieldname === 'idCardImage') {
            folder = 'replate/merchant/id-cards';
            prefix = 'idcard';
        } else if (file.fieldname === 'logo') {
            folder = 'replate/merchant/logos';
            prefix = 'logo';
        }

        return {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
            public_id: `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        };
    },
});

const uploadMerchantImages = multer({
    storage: merchantStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
    uploadProductImage,
    uploadMerchantImages
};