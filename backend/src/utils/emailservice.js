const nodemailer = require('nodemailer');

//configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

//Send verification email 
const sendVerificationEmail = async (email, name, verificationToken, userType = 'user') => {
    const verificationUrl= `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    //Different message based on user type
    const roleMessage = userType ==='merchant'
    ? 'Welcome to Replate as a <strong>Bakery Owner</strong>!' 
    : 'Welcome to Replate!';

    const mailOptions = {
        from: `"Replate - Bakery Marketplace" <${process.env.EMAIL_USER}`,
        to: email,
        subject: 'Verify Your Email - Replate',
        html: `
            <div style = "font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style= "text-align: center; margin-bottom: 30px;">
                    <h1 style ="color: #2D7A5E; margin: 0;">Replate</h1>
                    <p style ="color: #666; margin: 5px 0;">Rescue. Reduce. Replate</p>
                </div>

                <h2 style="color: #2D7A5E;">${roleMessage}</h2>

                <p style="color: #333; line-height: 1.6;"> Hello <strong>${name}</strong>,</p> 

                <p style= "color: #333; line-height: 1.6;">
                    Thank you for registering at Replate! To complete your registration and activate your account, 
                    please verify your email address by clicking the link below:
                </p>
                
                <div style="text-align :center; margin: 30px 0;">
                    <a href="${verificationUrl}"
                        style="display: inline-block; padding: 14px 28px; background-color: #2D7A5E; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Verify Email Address
                    </a>
                </div>
                <p style= "color: #666; line-height: 1.6; font-size: 14px;>
                    Or copy and paste this link in your browser:
                </p>
                <div style = "margin-top: 40px; padding-top: 20px; border-top 1px solid #ddd;">
                    <p style= "color: #999; font-size: 12px; line-height: 1.6;">
                        This verification link will expire in <strong> 1 hours</strong>.
                    </p>
                    <p style= "color: #999; font-size: 12px; line-height: 1.6;">
                        If you don't create an account with Replate, please ignore this email.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px">
                    <p>&copy; 2026 Replate. All rights reserved.</p>
                </div>
            </div>
            `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to: ${email} (${userType})`);
        return true;
    } catch (error) {
        console.error('Error sending verification email: ', error.message);
        return false;
    };
};

//resend Verfification Email
const resendVerificationEmail = async (email, name, verificationToken, userType = 'user') => {
    return await sendVerificationEmail(email, name, verificationToken, userType);
};

//Send forget password reset email
const sendPasswordResetEmail = async (email, name, resetToken) =>{
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"Replate - Bakery MarketPlace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - Replate',
        html:`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style= "color: #2D7A5E; margin: 0;">
                        Replate
                    </h1>
                    <p style = "color: #666; margin: 5px 0;">
                        Rescue. Reduce. Replate
                    </p>
                </div>

                <h2 style= "color: #2D7A5E;">
                    Password Reset Request
                </h2>
                <p style="color: #333; line-height: 1.6;">
                    Hello <strong>${name}</strong>,</p>
                
                 <p style="color: #333; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 28px; background-color: #2D7A5E; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #666; line-height: 1.6; font-size: 14px;">
                    Or copy and paste this link in your browser:
                </p>
                <p style="color: #2D7A5E; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">
                    ${resetUrl}
                </p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px; line-height: 1.6;">
                        ⏰ This link will expire in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #999; font-size: 12px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>© 2025 Replate. All rights reserved.</p>
                </div>
            </div>   
        `
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sen to:${email}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error.message);
        return false;
    }
};

// Send merchant approval email
const sendMerchantApprovalEmail = async (email, name, storeName) => {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const mailOptions = {
        from: `"Replate - Bakery Marketplace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Congratulations! Your Store is Approved - Replate',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2D7A5E; margin: 0;">Replate</h1>
                    <p style="color: #666; margin: 5px 0;">Rescue. Reduce. Replate</p>
                </div>

                <div style="background-color: #E8F5E9; border-left: 4px solid #2D7A5E; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #2D7A5E; margin: 0 0 10px 0;">🎉 Congratulations!</h2>
                    <p style="color: #333; margin: 0; font-size: 16px;">
                        Your store has been approved and is now live on Replate!
                    </p>
                </div>

                <h3 style="color: #2D7A5E;">Hello ${name},</h3>

                <p style="color: #333; line-height: 1.6;">
                    Great news! Your store <strong>${storeName}</strong> has been reviewed and approved by our team. 
                    You can now start selling your products and helping reduce food waste!
                </p>

                <div style="background-color: #F5F5F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #2D7A5E; margin: 0 0 10px 0;">What's Next?</h4>
                    <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Login to your merchant dashboard</li>
                        <li>Add your products and set prices</li>
                        <li>Start receiving orders from customers</li>
                        <li>Manage your store and track sales</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" 
                       style="display: inline-block; padding: 14px 28px; background-color: #2D7A5E; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Go to Dashboard
                    </a>
                </div>

                <div style="background-color: #FFF9C4; border-left: 4px solid #FBC02D; padding: 15px; margin: 20px 0;">
                    <p style="color: #333; margin: 0; font-size: 14px;">
                        <strong>💡 Pro Tip:</strong> Complete your store profile with a logo and banner to attract more customers!
                    </p>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px; line-height: 1.6;">
                        Need help getting started? Contact our support team at support@replate.com
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>© 2025 Replate. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Approval email sent to: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending approval email:', error.message);
        return false;
    }
};

// Send merchant rejection email
const sendMerchantRejectionEmail = async (email, name, storeName, rejectionReason) => {
    const supportUrl = `${process.env.FRONTEND_URL}/contact-support`;
    const loginUrl = `${process.env.FRONTEND_URL}/login`;

    const mailOptions = {
        from: `"Replate - Bakery Marketplace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Update on Your Store Application - Replate',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2D7A5E; margin: 0;">Replate</h1>
                    <p style="color: #666; margin: 5px 0;">Rescue. Reduce. Replate</p>
                </div>

                <h2 style="color: #D32F2F;">Application Update</h2>

                <p style="color: #333; line-height: 1.6;">
                    Hello <strong>${name}</strong>,
                </p>

                <p style="color: #333; line-height: 1.6;">
                    Thank you for your interest in joining Replate. After reviewing your application for 
                    <strong>${storeName}</strong>, we are unable to approve it at this time.
                </p>

                <div style="background-color: #FFEBEE; border-left: 4px solid #D32F2F; padding: 15px; margin: 20px 0;">
                    <h4 style="color: #D32F2F; margin: 0 0 10px 0;">Reason for Rejection:</h4>
                    <p style="color: #333; margin: 0; line-height: 1.6;">
                        ${rejectionReason || 'Your application did not meet our current requirements.'}
                    </p>
                </div>

                <div style="background-color: #F5F5F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #2D7A5E; margin: 0 0 10px 0;">What You Can Do:</h4>
                    <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Review the feedback above</li>
                        <li>Reapply in a few minutes</li>
                    </ul>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #999; font-size: 12px; line-height: 1.6;">
                        If you have any questions or believe this was a mistake, please reach out to our support team at support@replate.com
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>© 2025 Replate. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Rejection email sent to: ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending rejection email:', error.message);
        return false;
    }
};


module.exports = {
    sendVerificationEmail,
    resendVerificationEmail,
    sendPasswordResetEmail,
    sendMerchantApprovalEmail,
    sendMerchantRejectionEmail
};