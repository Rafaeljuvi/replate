const express = require('express');
const router = express.Router();
const {uploadMerchantImages} = require('../middleware/uploadMiddleware')

const{
    registerUser,
    RegisterMerchant,
    registerStoreInfo,
    registerStoreVerification,
    login,
    getProfile,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    googleAuth,
    updateProfile,
    changePassword 
} = require('../controllers/authController');
const {verifyToken} = require('../middleware/authMiddleware');

//register routes
router.post('/register/user', registerUser);
router.post('/register/store/merchant', RegisterMerchant);
router.post('/register/store/info', verifyToken, registerStoreInfo);
router.post('/register/store/verification', verifyToken,
   uploadMerchantImages.fields([
        {name: 'qrisImage', maxCount: 1},
        {name: 'idCardImage', maxCount: 1}
    ]),
    registerStoreVerification
);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/login', login);
router.post('/google', googleAuth);
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);
router.patch('/change-password', verifyToken, changePassword);

module.exports = router;
