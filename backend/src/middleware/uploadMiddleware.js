const multer = require('multer');
const path = require('path');
const fs = require('fs');

//Product image uploads
const productDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, {recursive: true});
}

//ID card image uploads
const idCardDir = path.join(__dirname, '../../uploads/merchant/id-cards');
if (!fs.existsSync(idCardDir)) {
    fs.mkdirSync(idCardDir, {recursive: true});
}

//QRIS image uploads
const QRISDir = path.join(__dirname, '../../uploads/merchant/qris');
if (!fs.existsSync(QRISDir)) {
    fs.mkdirSync(QRISDir, {recursive: true});
}


//Product Image Upload configure storage
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, productDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() *1E9)
        const ext = path.extname(file.originalname)
        cb(null, `product-${uniqueSuffix}${ext}`);
    }
});

const productImageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
}

const uploadProductImage = multer({
    storage: productStorage,
    filter: productImageFilter,
    limits: {fileSize: 5 * 1024 * 1024} // 5MB
})

//Merchant Image Uplods (ID Card, QRIS)
const merchantStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname === 'idCardImage') {
            cb(null, idCardDir);
        } else if (file.fieldname === 'qrisImage') {
            cb(null, QRISDir)
        } else {
            cb(new Error('Unknown field name'))
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'idCardImage' ? 'idcard' : 'qris';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

const merchantImageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png)'));
    }
}

const uploadMerchantImages = multer({
    storage: merchantStorage,
    filter: merchantImageFilter,
    limits: {fileSize: 5 * 1024 * 1024} // 5MB
})



module.exports = {
    uploadProductImage,
    uploadMerchantImages
}