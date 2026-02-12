const pool = require('../config/db');
const { sendMerchantApprovalEmail, sendMerchantRejectionEmail } = require('../utils/emailservice');

const getPendingStores = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                s.store_id,
                s.store_name,
                s.description,
                s.address,
                s.city,
                s.phone,
                s.operating_hours,
                s.bank_account_number,
                s.qris_image_url,
                s.id_card_image_url,
                s.approval_status,
                s.created_at,
                u.user_id,
                u.name AS merchant_name,
                u.email AS merchant_email,
                u.phone AS merchant_phone,
                u.is_verified AS merchant_verified
            FROM stores s
            INNER JOIN users u ON s.merchant_id = u.user_id
            WHERE s.approval_status = 'pending'
            ORDER BY s.created_at ASC`
        );

        res.status(200).json({
            success: true,
            message: 'Pending stores retrieved successfully',
            data: {
                stores: result.rows,
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error('Get pending stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const approveStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const adminId = req.user.userId;

        // Get store and merchant info
        const storeResult = await pool.query(
            `SELECT s.*, u.name, u.email 
             FROM stores s
             INNER JOIN users u ON s.merchant_id = u.user_id
             WHERE s.store_id = $1`,
            [storeId]
        );
        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const store = storeResult.rows[0];
        if (store.approval_status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Store is already approved'
            });
        }

        const updateResult = await pool.query(
            `UPDATE stores 
             SET approval_status = 'approved',
                 is_active = true,
                 approved_at = CURRENT_TIMESTAMP,
                 approved_by = $1,
                 admin_notes = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE store_id = $2
             RETURNING *`,
            [adminId, storeId]
        );

        const updatedStore = updateResult.rows[0];

        const emailSent = await sendMerchantApprovalEmail(
            store.email,
            store.name,
            store.store_name
        );
        res.status(200).json({
            success: true,
            message: 'Store approved successfully',
            data: {
                store: updatedStore,
                emailSent
            }
        });
        console.log(`✅ Store approved: ${store.store_name} by admin ${adminId}`);
    } catch (error) {
        console.error('Approve store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const rejectStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { adminNotes } = req.body;
        const adminId = req.user.userId;

        // Validate admin notes
        if(!adminNotes || adminNotes.trim().length < 10 ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a detailed reason for rejection (minimum 10 characters)'
            });
        }
        
        // Get store and merchant info before deleting
        const storeResult = await pool.query(
            `SELECT s.*, u.name, u.email 
             FROM stores s
             INNER JOIN users u ON s.merchant_id = u.user_id
             WHERE s.store_id = $1`,
            [storeId]
        );
        
        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const store = storeResult.rows[0];
        
        // Send rejection email BEFORE deleting
        const emailSent = await sendMerchantRejectionEmail(
            store.email,
            store.name,
            store.store_name,
            adminNotes.trim()
        );
        
        // Delete store from database
        await pool.query(
            'DELETE FROM stores WHERE store_id = $1',
            [storeId]
        );

        await pool.query(
            'DELETE FROM users WHERE user_id = $1',
            [store.merchant_id]
        );

        // Success response
        res.status(200).json({
            success: true,
            message: 'Store rejected and deleted. Merchant can re-register.',
            data: {
                deletedStoreId: storeId,
                storeName: store.store_name,
                merchantEmail: store.email,
                rejectionReason: adminNotes.trim(),
                emailSent
            }
        });

        console.log(`❌ Store rejected & deleted: ${store.store_name} by admin ${adminId}`);
        console.log(`📧 Rejection email sent to: ${store.email}`);
        
    } catch (error) {
        console.error('Reject store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllStores = async (req, res) => {
    try {
        const { status } = req.query; // Filter by status: pending/approved/rejected

        let query = `
            SELECT 
                s.*,
                u.name AS merchant_name,
                u.email AS merchant_email
            FROM stores s
            INNER JOIN users u ON s.merchant_id = u.user_id
        `;

        const params = [];

        if (status) {
            query += ` WHERE s.approval_status = $1`;
            params.push(status);
        }

        query += ` ORDER BY s.created_at DESC`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: {
                stores: result.rows,
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error('Get all stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getPlatformStats = async (req, res) => {
    try {
        // Get counts
        const statsResult = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_customers,
                (SELECT COUNT(*) FROM users WHERE role = 'merchant') AS total_merchants,
                (SELECT COUNT(*) FROM stores) AS total_stores,
                (SELECT COUNT(*) FROM stores WHERE approval_status = 'pending') AS pending_stores,
                (SELECT COUNT(*) FROM stores WHERE approval_status = 'approved') AS approved_stores,
                (SELECT COUNT(*) FROM stores WHERE approval_status = 'rejected') AS rejected_stores
        `);

        res.status(200).json({
            success: true,
            data: statsResult.rows[0]
        });
    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getPendingStores,
    approveStore,
    rejectStore,
    getAllStores,
    getPlatformStats
};