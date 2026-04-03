const pool = require('../config/db');

const createReview = async(req, res) => {
    try {
        const userId = req.user.userId;
        const {orderId, rating, comment} = req.body;

        if(!orderId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and rating are rquired'
            })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            })
        }

        //Cek if order exist
        const orderResult = await pool.query(`
                SELECT order_id, store_id, status
                FROM orders
                WHERE order_id = $1 AND user_id = $2
        `, [orderId, userId])

        if(orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        const order = orderResult.rows[0];

        if (order.status!== 'completed'){
            return res.status(400).json({
                success: false,
                message: 'Cannot review an order that is not completed'
            })
        }

        const existingReview = await pool.query(
            `SELECT review_id FROM reviews WHERE order_id = $1`,
            [orderId]
        )

        if (existingReview.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this order'
            })
        }

        //Insert review
        const reviewResult = await pool.query(`
            INSERT INTO reviews (order_id, customer_id, store_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [orderId, userId, order.store_id, rating, comment || null])
        
        //Update average rating and total ratings
        await pool.query(`
            UPDATE stores
            SET
                total_ratings = total_ratings + 1,
                average_rating = (
                    SELECT ROUND(AVG(rating)::numeric, 1)
                    FROM reviews
                    WHERE store_id = $1
                ),
                updated_at = CURRENT_TIMESTAMP
            WHERE store_id = $1
        `, [order.store_id])

        res.status(201).json({
            success: true,
            message: 'Review submitted succesfully',
            data: {review: reviewResult.rows[0]}
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

//get store reviews (public)
const getStoreReviews = async (req, res) => {
    try {
        const {storeId} = req.params;
        const result = await pool.query(`
            SELECT
                r.review_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS customer_name
            FROM reviews r
            INNER JOIN users u ON r.customer_id = u.user_id
            WHERE r.store_id = $1
            ORDER BY r.created_at DESC
        `, [storeId])

        //count rating distribution
        const distributionResult = await pool.query(`
            SELECT
                rating,
                COUNT(*) as count
            FROM reviews
            WHERE store_id = $1
            GROUP BY rating
            ORDER BY rating DESC
        `, [storeId])

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        distributionResult.rows.forEach((row) => {
            distribution[row.rating] = parseInt(row.count);
        });

        res.status(200).json({
            success: true,
            data: {
                reviews: result.rows,
                total: result.rows.length,
                distribution
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

//get My reviews
const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const result = await pool.query(`
            SELECT
                r.review_id,
                r.rating,
                r.comment,
                r.created_at,
                r.order_id,
                s.store_name,
                s.logo as store_logo
            FROM reviews r
            INNER JOIN stores s ON r.store_id = s.store_id
            WHERE r.customer_id = $1
            ORDER BY r.created_at DESC
        `, [userId])

        res.status(200).json({
            success: true,
            data: result.rows
        });

        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

const checkOrderReview = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(`
            SELECT review_id, rating, comment
            FROM reviews
            WHERE order_id = $1 AND customer_id = $2
        `, [orderId, userId]);

        res.status(200).json({
            success: true,
            data: {
                hasReview: result.rows.length > 0,
                review: result.rows[0] || null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createReview,
    getStoreReviews,
    getMyReviews,
    checkOrderReview
};