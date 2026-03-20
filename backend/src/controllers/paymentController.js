const pool = require('../config/db');
const crypto = require('crypto');

const handleWebhook = async (req, res) => {
    try {
        const notification = req.body;
        console.log('Midtrans webhook:', notification);

        const {
            order_id,
            transaction_status,
            fraud_status,
            signature_key,
            gross_amount,
            status_code
        } = notification;

        // Verifikasi signature
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const expectedSignature = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex');

        if (signature_key !== expectedSignature) {
            console.error('Invalid signature');
            return res.status(403).json({ message: 'Invalid signature' });
        }

        const realOrderId = order_id.replace('REPLATE-', '');

        let paymentStatus = 'unpaid';
        let orderStatus = null;

        if (transaction_status === 'capture') {
            if (fraud_status === 'accept') {
                paymentStatus = 'paid';
                orderStatus = 'confirmed';
            }
        } else if (transaction_status === 'settlement') {
            paymentStatus = 'paid';
            orderStatus = 'confirmed';
        } else if (
            transaction_status === 'cancel' ||
            transaction_status === 'deny' ||
            transaction_status === 'expire'
        ) {
            paymentStatus = 'unpaid';
            orderStatus = 'cancelled';

            // Kembalikan stok
            const itemsResult = await pool.query(
                `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
                [realOrderId]
            );
            for (const item of itemsResult.rows) {
                await pool.query(`
                    UPDATE products
                    SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
                    WHERE product_id = $2
                `, [item.quantity, item.product_id]);
            }
        } else if (transaction_status === 'pending') {
            paymentStatus = 'unpaid';
        } else if (transaction_status === 'refund') {
            paymentStatus = 'refunded';
        }

        if (orderStatus) {
            await pool.query(`
                UPDATE orders
                SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP
                WHERE order_id = $3
            `, [paymentStatus, orderStatus, realOrderId]);
        } else {
            await pool.query(`
                UPDATE orders
                SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE order_id = $2
            `, [paymentStatus, realOrderId]);
        }

        res.status(200).json({ message: 'OK' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params

        const orderResult = await pool.query(`
            SELECT order_id, status, payment_status, snap_token, snap_redirect_url, total_price
            FROM orders
            WHERE  order_id = $1, AND user_id = $2
        `, [orderId, userId]);

        if(orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        res.status(200).json({
            success: true,
            data: orderResult.rows[0]
        })
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = {handleWebhook, getPaymentStatus}