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
                COUNT(p.product_id) AS total_products,
                COUNT(p.product_id) FILTER (WHERE p.is_active = true) AS active_products,
                (SELECT COUNT(*) FROM orders WHERE store_id = $1) AS total_orders,
                (SELECT COUNT(*) FROM orders WHERE store_id = $1 AND status = 'pending') AS pending_orders,
                (SELECT COUNT(*) FROM orders WHERE store_id = $1 AND status = 'completed') AS completed_orders,
                (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE store_id = $1 AND status = 'completed') AS total_revenue,
                COALESCE(s.average_rating, 0) AS average_rating,
                COALESCE(s.total_ratings, 0) AS total_ratings
            FROM stores s
            LEFT JOIN products p ON p.store_id = s.store_id
            WHERE s.store_id = $1
            GROUP BY s.store_id, s.average_rating, s.total_ratings`,
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

const updateMerchantStore = async (req, res) => {
    try {
        const merchantId = req.user.userId
         if(req.user.role !== 'merchant'){
            return res.status(403).json({
                success:false,
                message: 'Access forbidden'
            });
         }

         const {
            store_name, description, address, city,phone, operating_hours, bank_account_number
         } = req.body

         const fieldsToUpdate = [];
         const values = []
         let paramCount = 1

         if(store_name !== undefined) { fieldsToUpdate.push(`store_name = $${paramCount++}`); values.push(store_name)}
         if(description !== undefined) { fieldsToUpdate.push(`description = $${paramCount++}`); values.push(description)}
         if(address !== undefined) {fieldsToUpdate.push(`address = $${paramCount++}`); values.push(address)}
         if(city !== undefined) {fieldsToUpdate.push(`city = $${paramCount++}`); values.push(city)}
         if(phone !== undefined) {fieldsToUpdate}
         if(operating_hours !==  undefined) {fieldsToUpdate.push(`operating_hours = $${paramCount++}`); values.push(operating_hours)}
         if(bank_account_number !== undefined) {fieldsToUpdate.push(`bank_account_number = $${paramCount++}`); values.push(bank_account_number)}
         if(req.file) {fieldsToUpdate.push(`logo_url = $${paramCount++}`); values.push(`/uploads/merchant/logos/${req.file.filename}`)}

         if(fieldsToUpdate.length === 0) {
            return res.status(400).json({success: false, message: 'No fields to update.'})
         }

         fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);
         values.push(merchantId)

         const query = `UPDATE stores SET ${fieldsToUpdate.join(', ')} WHERE merchant_id = $${paramCount} RETURNING *`
         
         const result = await pool.query(query, values);

         if (result.rows.length === 0) {
            return res.status(404).json({success: false, message: 'Store not found.'})
         }
         
         res.status(200).json({
            success:true,
            message: 'Store updated succesfully',
            data: result.rows[0]
         })

    } catch (error) {
        console.error('Update merchant failed', error)
        res.status(500).json({ success: false, message: 'Internal server error'})
    }

}

module.exports = {
    getMerchantStore,
    getMerchantStoreStats,
    updateMerchantStore
};