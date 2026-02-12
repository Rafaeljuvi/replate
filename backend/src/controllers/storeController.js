const pool = require('../config/db');

const getMerchantStore = async(req,res) => {
    try {
        const merchantId = req.user.userId;

        //verify user is a merchant
        if(req.user.role !== 'merchant'){
            return res.status(403).json({
                success: false,
                message: "Access forbidden. You do not have the required role."
            });
        }

        const result = await pool.query(
            `SELECT
                store_id,
                merchant_id,
                store_name,
                description,
                address,
                city,
                latitude,
                longitude,  
                phone,
                operating_hours,
                logo_url,
                banner_url,
                bank_account_number,
                qris_image_url,
                is_active,
                approval_status,  
                admin_notes,
                approved_at,
                approved_by,
                created_at,
                updated_at  
                FROM stores
                WHERE merchant_id = $1`, [merchantId]
        );

        //check if store exists
        if(result.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: "Merchant store not found"
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });


    } catch (error) {
        console.error('Error fetching merchant store:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getMerchantStoreStats = async (req, res) => {
    try {
        const merchantId = req.user.userId;

        //Verify user's role is merchant
        if(req.user.role !== 'merchant'){
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only'
            })
        }

        //Get merchant store
        const storeResult = await pool.query(
            'SELECT store_id, average_rating, total_ratings FROM stores WHERE merchant_id = $1',
            [merchantId]
        )

        if(storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const storeId = storeResult.rows[0].store_id

        //get statistics
        const statsResult = await pool.query(
            `SELECT
            0 AS total_products,
            0 AS active_products,
            0 AS total_orders,
            0 AS pending_orders,
            0 AS completed_orders,
            0 AS total_revenue,
            COALESCE(s.average_rating, 0) AS average_rating,
            COALESCE(s.total_ratings, 0) AS total_ratings
            FROM stores s WHERE s.store_id = $1`,
            [storeId]
        )

        res.status(200).json({
            success:true,
            data: statsResult.rows[0]
        });

    } catch (error) {
        console.error('Get merchant store stats error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

module.exports = {
    getMerchantStore,
    getMerchantStoreStats
};