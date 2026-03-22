const pool = require ('../config/db')
const { snap } = require('../config/midtrans');

//CREATE order
//Customer checktout from cart jadi order
const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { notes, payment_method } = req.body;

        // Validasi payment_method
        if (!payment_method || !['cash', 'online'].includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'payment_method must be "cash" or "online"'
            });
        }

        // Ambil data user
        const userResult = await pool.query(
            `SELECT user_id, name, email, phone FROM users WHERE user_id = $1`, [userId]
        );
        const user = userResult.rows[0];

        // Ambil semua item di cart
        const cartResult = await pool.query(`
            SELECT
                ci.cart_item_id,
                ci.product_id,
                ci.store_id,
                ci.quantity,
                ci.price_at_time,
                ci.price_at_time * ci.quantity as subtotal,
                p.name,
                p.stock,
                p.is_active,
                s.is_active as store_active,
                s.approval_status
            FROM cart c
            INNER JOIN cart_items ci ON c.cart_id = ci.cart_id
            INNER JOIN products p ON ci.product_id = p.product_id
            INNER JOIN stores s ON ci.store_id = s.store_id
            WHERE c.user_id = $1
        `, [userId]);

        if (cartResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validasi semua produk
        for (const item of cartResult.rows) {
            if (!item.is_active) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${item.name}" is no longer available`
                });
            }
            if (!item.store_active || item.approval_status !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: `Store for "${item.name}" is no longer available`
                });
            }
            if (item.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for "${item.name}". Only ${item.stock} left`
                });
            }
        }

        // Group items by store
        const storeGroups = {};
        for (const item of cartResult.rows) {
            if (!storeGroups[item.store_id]) {
                storeGroups[item.store_id] = [];
            }
            storeGroups[item.store_id].push(item);
        }

        const createdOrders = [];

        for (const storeId of Object.keys(storeGroups)) {
            const items = storeGroups[storeId];
            const totalPrice = items.reduce((acc, item) => {
                return acc + parseFloat(item.subtotal);
            }, 0);

            // Insert order
            const orderResult = await pool.query(`
                INSERT INTO orders 
                    (user_id, store_id, total_price, notes, payment_method, payment_status)
                VALUES ($1, $2, $3, $4, $5, 'unpaid')
                RETURNING *
            `, [userId, storeId, totalPrice, notes || null, payment_method]);

            const order = orderResult.rows[0];

            // Insert order items + kurangi stok
            for (const item of items) {
                await pool.query(`
                    INSERT INTO order_items
                        (order_id, product_id, quantity, price_at_time, subtotal)
                    VALUES ($1, $2, $3, $4, $5)
                `, [order.order_id, item.product_id, item.quantity, item.price_at_time, item.subtotal]);

                await pool.query(`
                    UPDATE products
                    SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
                    WHERE product_id = $2
                `, [item.quantity, item.product_id]);
            }

            //Cash on stores
            if (payment_method === 'cash') {
                createdOrders.push({
                    ...order,
                    snap_token: null,
                    snap_redirect_url: null
                });
            }

            //Online payment
            if (payment_method === 'online') {
                const midtransOrderId = `REPLATE-${order.order_id}`;

                const itemDetails = items.map(item => ({
                    id: item.product_id,
                    price: Math.round(parseFloat(item.price_at_time)),
                    quantity: item.quantity,
                    name: item.name.substring(0, 50)
                }));

                const parameter = {
                    transaction_details: {
                        order_id: midtransOrderId,
                        gross_amount: Math.round(totalPrice)
                    },
                    item_details: itemDetails,
                    customer_details: {
                        first_name: user.name,
                        email: user.email,
                        phone: user.phone || ''
                    },
                    callbacks: {
                        finish: `${process.env.FRONTEND_URL}/orders/active`
                    }
                };

                const midtransTransaction = await snap.createTransaction(parameter);

                await pool.query(`
                    UPDATE orders
                    SET snap_token = $1, snap_redirect_url = $2, updated_at = CURRENT_TIMESTAMP
                    WHERE order_id = $3
                `, [midtransTransaction.token, midtransTransaction.redirect_url, order.order_id]);

                createdOrders.push({
                    ...order,
                    snap_token: midtransTransaction.token,
                    snap_redirect_url: midtransTransaction.redirect_url
                });
            }
        }

        // Kosongkan cart
        const cartIdResult = await pool.query(
            `SELECT cart_id FROM cart WHERE user_id = $1`, [userId]
        );
        if (cartIdResult.rows.length > 0) {
            await pool.query(
                `DELETE FROM cart_items WHERE cart_id = $1`,
                [cartIdResult.rows[0].cart_id]
            );
        }

        res.status(201).json({
            success: true,
            message: `${createdOrders.length} order(s) created successfully`,
            data: { orders: createdOrders }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

//Get all orders milik customer
const getMyOrders = async(req, res) => {
    try {
        const userId = req.user.userId;
        const {status} = req.query;

        let query = `
            SELECT
                o.order_id,
                o.status,
                o.total_price,
                o.notes,
                o.payment_method,
                o.payment_status,
                o.snap_token,
                o.snap_redirect_url,
                o.created_at,
                o.updated_at,
                s.store_id,
                s.store_name,
                s.logo_url as store_logo,
                s.address,
                COUNT(oi.order_item_id) as total_items
            FROM orders o
            INNER JOIN stores s ON o.store_id = s.store_id
            INNER JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.user_id = $1
        `;

        const params = [userId];

        if (status) {
            query += ` AND o.status = $2`
            params.push(status)
        }

        query += ` GROUP BY o.order_id, s.store_id ORDER BY o.created_at DESC`;

        const result = await pool.query(query, params)

        res.status(200).json({
            success: true,
            data: result.rows
        })
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message:'Internal server error'
        });
    }
}

//Get order detail
const getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.userId
        const {orderId} = req.params

        //Ambil order
        const orderResult = await pool.query (`
                SELECT
                    o.order_id,
                    o.status,
                    o.total_price,
                    o.notes,
                    o.payment_method,
                    o.payment_status,
                    o.created_at,
                    o.updated_at,
                    s.store_id,
                    s.store_name,
                    s.logo_url as store_logo,
                    s.address,
                    s.phone as store_phone
                FROM orders o
                INNER JOIN stores s ON o.store_id = s.store_id
                WHERE o.order_id = $1 AND o.user_id = $2
        `, [orderId, userId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const itemsResult = await pool.query(`
            SELECT
                oi.order_item_id,
                oi.quantity,
                oi.price_at_time,
                oi.subtotal,
                p.product_id,
                p.image_url,
                p.name,
                p.category
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = $1
        `, [orderId])

        res.status(200).json({
            success: true,
            data: {
                order: orderResult.rows[0],
                items: itemsResult.rows
            }
        })
        
    } catch (error) {
        console.error('get order detail error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
};

//cancel order
//Bisa cancel kalau status masih pending
const cancelOrder = async(req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;

        const orderResult = await pool.query(`
            SELECT order_id, status FROM orders
            WHERE order_id = $1 AND user_id = $2
        `, [orderId, userId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:'Order not found'
            })
        }

        const order = orderResult.rows[0]

        if(order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message:`Cannot cancel order with status "${order.status}"`
            })
        }

        const itemsResult = await pool.query(`
            SELECT product_id, quantity FROM order_items
            WHERE order_id = $1
        `, [orderId]);

        for (const item of itemsResult.rows) {
            await pool.query(`
               UPDATE products
               SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
               WHERE product_id = $2 
            `, [item.quantity, item.product_id]);
        }

        //update status order
        await pool.query(`
            UPDATE orders
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
        `, [orderId])

        res.status(200).json({
            success: true,
            message: 'order cancelled succesfully'
        })
    } catch (error) {
        console.error('Cancel order error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

//get store orders(merchant)
//ambil semua order yg msk ke toko
const getStoreOrders = async(req, res) => {
    try {
        const userId = req.user.userId
        const {status} = req.query;

        //Ambil store_id merchant
        const storeResult = await pool.query(
            `SELECT store_id FROM stores WHERE merchant_id = $1`, [userId]
        )

        if( storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            })
        }

        const storeId = storeResult.rows[0].store_id;

        let query = `
            SELECT
                o.order_id,
                o.status,
                o.total_price,
                o.notes,
                o.payment_method,
                o.payment_status,
                o.created_at,
                o.updated_at,
                u.name as customer_name,
                u.phone as customer_phone,
                COUNT(oi.order_item_id) as total_items
            FROM orders o
            INNER JOIN users u on o.user_id = u.user_id
            INNER JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.store_id = $1
        `;

        const params = [storeId]

        if(status) {
            query += ` AND o.status = $2`
            params.push(status);
        }

        query += ` GROUP BY o.order_id, u.user_id ORDER BY o.created_at DESC`;

        const result = await pool.query(query, params)

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('get store orders error:', error);
        res.status(500).json({
            success: false,
            message:'internal server error'
        });
    }
}

// UPDATE ORDER STATUS (merchant)
const updateOrderStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = ['confirmed', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Pastikan order ini milik toko merchant ini
        const storeResult = await pool.query(
            `SELECT store_id FROM stores WHERE merchant_id = $1`, [userId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        const orderResult = await pool.query(`
            SELECT order_id, status FROM orders
            WHERE order_id = $1 AND store_id = $2
        `, [orderId, storeId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const currentStatus = orderResult.rows[0].status;

        // Validasi urutan status
        const statusFlow = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['ready', 'cancelled'],
            'ready': ['completed'],
            'completed': [],
            'cancelled': []
        };

        if (!statusFlow[currentStatus].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from "${currentStatus}" to "${status}"`
            });
        }

        // Kalau merchant cancel, kembalikan stock
        if (status === 'cancelled') {
            const itemsResult = await pool.query(`
                SELECT product_id, quantity FROM order_items
                WHERE order_id = $1
            `, [orderId]);

            for (const item of itemsResult.rows) {
                await pool.query(`
                    UPDATE products
                    SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
                    WHERE product_id = $2
                `, [item.quantity, item.product_id]);
            }
        }

        await pool.query(`
            UPDATE orders
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
        `, [status, orderId]);

        res.status(200).json({
            success: true,
            message: `Order status updated to "${status}"`
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder,
    getStoreOrders,
    updateOrderStatus
};