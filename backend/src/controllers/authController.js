const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
    isValidEmail,
    isValidPassword,
    isValidPhoneNumber,
    isPasswordMatch
} = require('../utils/validation');
const {
    sendVerificationEmail,
    resendVerificationEmail,
    sendPasswordResetEmail
} = require('../utils/emailservice');

const googleAuth = async (req, res) =>{
    try {
        const {credential, mode} = req.body;
        if(!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google Credential is required.'
            });
        }

        //decode Google JWT Token
        const jwt = require('jsonwebtoken');
        const decodedToken = jwt.decode(credential);

        if (!decodedToken){
            return res.status(400).json({
                success: false,
                message: 'Invalid Google Credential.'
            });
        }

        const { email, name, picture, sub: googleId } = decodedToken;

        //check if user exists
        let userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',[email]
        );

        let user;
        let isNewUser = false;

        if (userExists.rows.length === 0){
            // Jika mode = signin/login user.length == 00 return error
            if( mode === 'signin') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found. Please register first.',
                    isNewUser: true
                });
            }

            // create account if mode == register
            if (mode === 'register'){
                const result = await pool.query(
                    `INSERT INTO users (email, password, name, phone, role, is_verified, google_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     RETURNING user_id, email, name, phone, role, is_verified, created_at`,
                    [email, 'GOOGLE_AUTH', name, 'N/A', 'user', true, googleId]
                );
                user = result.rows [0];
                isNewUser = true;
            }
        }else {
            user = userExists.rows[0];

            if(!user.google_id){
                await pool.query(
                    'UPDATE users SET google_id = $1, is_verified = true WHERE user_id = $2', [googleId, user.user_id]
                );
            }
        }

        const token = jwt.sign({
            userId: user.user_id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: '7d'});

        //return user data without password
        const { password: _, ...userData} = user;

        res.status(200).json({
            success: true,
            message: isNewUser ? 'Account created successfully with Google.' : 'Login successful with Google.',
            data: {
                user: userData,
                token,
                isNewUser
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.'
        })
    }
}

// User Registration
const registerUser = async (req, res) => {
    try{
        const { email, password, confirmPassword, name, phone} = req.body;

        //input validation
        if(!email || !password ||!confirmPassword || !name ||!phone){
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }
        if(!isValidEmail(email)){
            return res.status(400).json({
                success: false,
                message: 'Invalid email format.'
            });
        }

        if(!isValidPassword(password)){
            return res.status(400).json({
                success: false,
                message: 'Password must be 8 characters or longer.'
            });
        }

        if(!isPasswordMatch(password, confirmPassword)){
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            })
        }

        if(!isValidPhoneNumber(phone)){
            return res.status(400).json({
                success: false,
                message: 'Invalid Phone Number format.'
            });
        }

        //Check if email registered
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        if(userExists.rows.length > 0){
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Insert User
        const result = await pool.query(
            `INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, 'user') RETURNING user_id, email, name, phone, role, created_at`, [email, hashedPassword, name, phone]
        );

        const newUser = result.rows[0];

        //Generate JWT token
        const token = jwt.sign({
            userId: newUser.user_id,
            email: newUser.email,
            role: newUser.role
        },
        process.env.JWT_SECRET,
        {expiresIn: '7d'});

        //generate verification token
        const verificationToken = jwt.sign(
            {
                userId: newUser.user_id,
                email: newUser.email,
                purpose: 'email-verification'
            },
            process.env.JWT_SECRET,
                {expiresIn: '24h'}
        );

        //send verification email
        const emailSent = await sendVerificationEmail(
            newUser.email,
            newUser.name,
            verificationToken,
            'user'
        );

        res.status(201).json({
            success: true,
            message:emailSent 
            ? 'User registered Successfully! Please check your email to verify your account.'
            : 'User registered succesfully. Please verify your email to activate your account.',
            data: {
                user: newUser,
                token: token,
                emailSent: emailSent
            }
        });
    } catch (error){
        console.error('Register User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

// Merchant Register
const RegisterMerchant = async (req, res) => {
    try{
        const{email, password, confirmPassword, name, phone} = req.body;

        if(!email || !password || !confirmPassword || !name || !phone){
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        if(!isValidEmail(email)){
            return res.status(409).json({
                success: false,
                message: 'Invalid email format.'
            });
        }

        if(!isValidPassword(password)){
            return res.status(400).json({
                success: false,
                message: 'Password must be 8 characters or longer.'
            });
        }

        if(!isPasswordMatch(password, confirmPassword)){
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }

        if(!isValidPhoneNumber(phone)){
            return res.status(400).json({
                success: false,
                message: 'Invalid Phone Number format.'
            });
        }

        //Check if email registered
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        if (userExists.rows.length > 0){
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Insert Merchant User
        const result = await pool.query(
            `INSERT INTO users (email, password, name, phone, role) VALUES ($1, $2, $3, $4, 'merchant') RETURNING user_id, email, name, phone, role, created_at`, [email, hashedPassword, name, phone]
        );

        const newUser = result.rows[0];

        //Generate JWT token
        const token = jwt.sign({
            userId: newUser.user_id,
            email: newUser.email,
            role: newUser.role,
        },
         process.env.JWT_SECRET, {
            expiresIn: '7d'}
        );

        res.status(201).json({
            success: true,
            message: 'Store account created. Please complete store registration.',
            data:{
                user: newUser,
                token: token
            }
        });

    }catch (error){
        console.error('Register Store Account Error:', error);
        res.status(500).json({
            success: false,
            message: 'Interval server error.'
        });
    } 
};

// RegisterMerchantInfo
// page 2
const registerStoreInfo = async (req, res) => {
    try{
        const merchantID = req.user.userId;
        const {storeName, description, address, city, latitude, longitude, phone, operatingHours} = req.body;

        //validasi role
        if(req.user.role !== 'merchant'){
            return res.status(403).json({
                success: false,
                message: 'Not authorized, only store owner can register.'
            });
        }

        //Input validation
        if(!storeName || !description || !address || !city || !latitude || !longitude || !phone || !operatingHours) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        //Check if merchant already registered store
        const storeExists = await pool.query(
            'SELECT * FROM stores WHERE merchant_id = $1',[merchantID]
        );

        if (storeExists.rows.length > 0){
            return res.status(400).json({
                success: false,
                message: 'You have a store registered.'
            });
        };

        //Insert Store Information
        const result = await pool.query(
            `INSERT INTO stores (merchant_id, store_name, description, address, city, latitude, longitude, phone, operating_hours, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false) RETURNING *`, [merchantID, storeName, description, address, city, latitude, longitude, phone, operatingHours]
        );

        res.status(201).json({
            success: true, 
            message: 'Store info saved. Please complete Verification.',
            data:{
                store: result.rows[0]
            }
        });

    } catch (error){
        console.error('Register Store Info Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.'
        });
    }
};

// Register Merchant Verfication
// Page 3

const registerStoreVerification = async (req, res) => {
    try {
        const merchantID = req.user.userId;
        const {bankAccountNumber} = req.body;

        let qrisImageUrl = null;
        let idCardImageUrl = null;

       if(req.files && req.files.length > 0){
         req.files.forEach(file => {
            
            if(file.fieldname === 'qrisImage') {
                qrisImageUrl = `/uploads/${file.filename}`
            }

            if (file.fieldname === 'idCardImage'){
                idCardImageUrl = `/uploads/${file.filename}`;
            }
         });
       }

        if(!bankAccountNumber){
            return res.status(400).json({
                success: false,
                message: 'Bank account number is required.'
            });
        }


        const result = await pool.query(
            `UPDATE stores SET bank_account_number = $1,
            qris_image_url = $2,
            id_card_image_url = $3,
            updated_at = CURRENT_TIMESTAMP
            WHERE merchant_id = $4
            RETURNING *`, [bankAccountNumber,qrisImageUrl, idCardImageUrl, merchantID]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        //Get merchant user info
        const userResult = await pool.query(
            'SELECT user_id, email, name, is_verified FROM users WHERE user_id = $1', [merchantID]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = userResult.rows[0];

        //Send email verification
        let emailSent = false;
        let verificationToken = null;

        if (!user.is_verified) {
            const jwt = require('jsonwebtoken')
            verificationToken = jwt.sign(
                {
                    userId: user.user_id,
                    email: user.email,
                    purpose: 'email-verification'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { sendVerificationEmail } = require('../utils/emailservice');
            emailSent = await sendVerificationEmail(
                user.email,
                user.name,
                verificationToken,
                'merchant'
            );
        }

        res.status(200).json({
            success: true,
            message: user.is_verified
                ? 'Store registration completed. Waiting for admin approval.'
                : 'Store registration completed! Please check your email to verify your account before admin review.',
            data: {
                store: result.rows[0],
                emailSent: emailSent,
                needsVerification: !user.is_verified,
            },
        });

    } catch (error) {
        console.error('Register Store Verfication Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}

// Login
const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:'Email and password are required'
            });
        }

        //Check if user exists
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`, [email]
        );

        if (result.rows.length === 0){
            return res.status(402).json({
                success:false,
                message:'User not found, please register.'
            });
        }

        const user = result.rows[0];

        //verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        //Check if email is verified
        if(!user.is_verified){
            return res.status(403).json({
                success: false,
                message: 'Please verify your email to activate your account.'
            });
        }

        // Generate JWT Token
        const token = jwt.sign({
            userId: user.user_id,
            email: user.email,
            role: user.role
        },
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );   

        //Return user data withthout password
        const { password: _, ...userData} = user;

        res.status(200).json({
            success:true,
            message: 'Login successful.',
            data: {
                user: userData,
                token,
            }
        });  
    } catch (error) {
        console.error('Login error', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

//Get profile
const getProfile = async (req,res) => {
    try {
        const userId =req.user.userId;
        const result = await pool.query(
            'SELECT user_id, email, name, phone, role, is_verified, created_at FROM users WHERE user_id = $1', [userId]
        );

        if (result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'User Not Found'
            });
        }

        res.status(200).json({
            success: true,
            data:{
                user: result.rows[0]
            },
        });
    } catch (error) {
        console.error('Get profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server Error.'
        });
    }
};

//Verify Email
const verifyEmail = async (req, res) =>{
    try {
        const {token} = req.body;

        if(!token){
            return res.status(400).json({
                success:false,
                message: 'Verification token is required.'
            });
        }

        //verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError'){
                return res.status(400).json({
                    success: false,
                    message: 'Verification token has expired. Please request a new verification email.',
                    expired: true
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid verification token.'
            });
        }

        // Check if token is for email verification
        if(decoded.purpose !== 'email-verification'){
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token.'
            });
        }

        //check if user exists
        const result = await pool.query(
            'SELECT user_id, email, name, role, is_verified FROM users WHERE user_id = $1', [decoded.userId]
        );

        if (result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = result.rows[0];

        if (user.is_verified){
            return res.status(400).json({
                success: false,
                message: 'Email is already verified.'
            });
        }

        //update user as verfied
        await pool.query(
            'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1', [decoded.userId]
        );

        res.status(200).json({
            success: true, 
            message: user.role === 'merchant'
                ? 'Email verified successfully! Your store registration will be reviewed by admin.'
                : 'Email verified successfully! You can now enjoy all features.',
            data:{
                user: {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    is_verified: true
                },
            },
        });
    } catch (error) {
        console.error('Verify Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.'
        });
    }
};

//Resend verification Email
const resendVerification = async (req, res) => {
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        const result = await pool.query(
            'SELECT user_id, email, name, is_verified, role FROM users WHERE email = $1', [email]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = result.rows[0];

        //check if already verfied
        if(user.is_verified){
            return res.status(400).json({
                success: false,
                message: 'Email is already verified.'
            });
        }

        //generate new verification token
        const verificationToken = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                purpose: 'email-verification'
            },
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        //send email
        const userType = user.role ==='merchant' ? 'merchant' : 'user';
        const emailSent = await resendVerificationEmail(
            user.email,
            user.name,
            verificationToken,
            userType
        );

        if(!emailSent){
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification email resent. Please check your email.'
        });
    } catch (error) {
        console.error('Resend Verification Error: '. error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.'
        });

    }
};

const forgotPassword = async (req, res) =>{
    try {
        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        //check if user exists
        const result = await pool.query(
            'SELECT user_id, email, name FROM users WHERE email = $1', [email]
        );

        if (result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'Account has not registered'
            });
        }

        const user = result.rows[0];

        //generate password reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                purpose: 'password-reset'
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        //send password reset email
        const emailSent = await sendPasswordResetEmail(
            user.email,
            user.name,
            resetToken
        );

        if(!emailSent){
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset email sent. Please check your email.'
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.'
        });
    }
};

//Reset Password
const resetPassword = async (req, res) => {
    try {
        const {token, newPassword, confirmPassword} = req.body;

        if(!token || !newPassword || !confirmPassword){
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        if(!isValidPassword(newPassword)){
            return res.status(400).json({
                success: false,
                message:'Password must be 8 characters or longer'
            });
        }

        if(!isPasswordMatch(newPassword, confirmPassword)){
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }

        //verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if(error.name === 'TokenExpiredError'){
                return res.status(400).json({
                    success: false,
                    message: 'Password reset link has expired. Please request a new one.',
                    expired: true
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid password reset link.'
            });
        }

        //Check if token is for password reset
        if (decoded.purpose !== 'password-reset'){
            return res.status(400).json({
                success: false,
                message: 'Invalid password reset link.'
            });
        }

        //Check if user exists
        const result = await pool.query(
            'SELECT user_id, email, name FROM users WHERE user_id = $1', [decoded.userId]
        );

        if (result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = result.rows[0];

        //Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        //Update user password
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [hashedPassword, decoded.userId]
        );

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.',
            data: {
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

module.exports = {
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
    googleAuth
};


