const pool = require('../config/db')

//Get User's Cart
const getCart = async(req, res) => {
    try {
        const userId = req.user.userId

        const result = await pool.query(
            `SELECT
                ci.cart_item_id,
                ci.cart_id,
                ci.quantity,
                ci.price_at_time,
                ci.price_at_time * ci.quantity as subtotal,
                p.product_id,
                p.name,
                p.description,
                p.image_url,
                p.stock,
                p.discount_percentage,
                p.original_price,
                p.discounted_price,
                p.is_active,
                p.available_from,
                p.available_until,
                s.store_id,
                s.store_name,
                s.logo_url as store_logo
            FROM cart c
            INNER JOIN cart_items ci ON c.cart_id = ci.cart_id
            INNER JOIN products p ON ci.product_id = p.product_id
            INNER JOIN stores s ON ci.store_id = s.store_id
            WHERE c.user_id = $1
            ORDER BY ci.created_at DESC
            `, [userId])

            //Hitung total
            const total = result.rows.reduce((acc, item) => {
                return acc + parseFloat(item.subtotal);
            }, 0);

            res.status(200).json({
                success: true,
                data: {
                    items: result.rows,
                    total_items: result.rows.length,
                    total_price: total
                }
            });

    } catch (error) {
        console.error('Get cart Error:', error)
        res.status(500).json({
            success: false,
            message: 'internal Server error'
        });
    }
}

//Add to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {product_id, quantity = 1} = req.body;

        if(!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Product not found'
            });
        }

        const productResult = await pool.query(`
            SELECT
                p.product_id,
                p.store_id,
                p.name,
                p.stock,
                p.is_active,
                p.discounted_price,
                s.is_active as store_active,
                s.approval_status
            FROM products p
            INNER JOIN stores s ON p.store_id = s.store_id
            WHERE p.product_id = $1
            `, [product_id]);

            if(productResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            const product = productResult.rows[0]

            if(!product.is_active) {
                return res.status(400).json({
                    success: false,
                    message: 'Product is not available'
                });
            }

            if(!product.store_active || product.approval_status !== 'approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Store is not available'
                });
            }

            if(product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items left in stock`
                });
            }

            let cartResult = await pool.query(
                `SELECT cart_id FROM cart WHERE user_id = $1`,
                [userId]
            )

            let cartId;
            if(cartResult.rows.length === 0) {
                const newCart = await pool.query(
                    `INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id`, [userId]
                );
                cartId = newCart.rows[0].cart_id;
            }else {
                cartId = cartResult.rows[0].cart_id;
            }

            const existingItem = await pool.query(
                `SELECT cart_item_id, quantity FROM cart_items
                WHERE cart_id = $1 AND product_id = $2`,
                [cartId, product_id]
            );

            if(existingItem.rows.length > 0) {
                const newQuantity = existingItem.rows[0].quantity + quantity;

                if(newQuantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot add more. Only ${product.stock} items available`
                    });
                }

                await pool.query(
                    `UPDATE cart_items 
                     SET quantity = $1, updated_at = CURRENT_TIMESTAMP
                     WHERE cart_item_id = $2`,
                    [newQuantity, existingItem.rows[0].cart_item_id]
                );
            } else {
                await pool.query(
                    `INSERT INTO cart_items 
                        (cart_id, product_id, store_id, quantity, price_at_time)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [cartId, product_id, product.store_id, quantity, product.discounted_price]
                );
            }

            res.status(200).json({
                success: true,
                message: 'Product added to cart'
            });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

//Update Quantity item in cart
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartItemId } = req.params
        const { quantity } = req.body;

        if(!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            })
        }

        //Cek cart item exist dan milik user Id ini
        const itemResult = await pool.query(
            `
            SELECT
                ci.cart_item_id,
                ci.product_id,
                p.stock,
                p.name
            FROM cart_items ci
            INNER JOIN cart c ON ci.cart_id = c.cart_id
            INNER JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_item_id = $1 AND c.user_id = $2
        `, [cartItemId, userId]);

        if(itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            })
        }

        const item = itemResult.rows[0]

        if(quantity > item.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${item.stock} items available`
            })
        }

        await pool.query(`
                UPDATE cart_items
                SET quantity = $1, updated_at = CURRENT_TIMESTAMP
                WHERE cart_item_id = $2
            `, [quantity, cartItemId]
        )
        
        res.status(200).json({
            success: true,
            message: 'Cart updated'
        })
     
    } catch (error) {
        console.error('Updated cart error:', error);
        res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}

//Remove Cart item
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.userId
        const { cartItemId } = req.params;

        // Cek cart item exist dan milik user ini
        const itemResult = await pool.query(`
            SELECT ci.cart_item_id
            FROM cart_items ci
            INNER JOIN cart c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = $1 AND c.user_id = $2
        `, [cartItemId, userId]);

        if(itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            })
        }

        await pool.query(
            `DELETE FROM cart_items WHERE cart_item_id = $1`,
            [cartItemId]
        )

        res.status(200).json({
            success: true,
            message: 'item removed from cart'
        }
            
        )
    } catch (error) {
        console.error('Remove cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'internal server error'
        });
    }
}

//Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartResult = await pool.query(
            ` SELECT cart_id FROM cart WHERE user_id = $1`
            ,[userId]
        )

        if(cartResult.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Cart is already empty'
            })
        }

        await pool.query(
            `DELETE FROM cart_items WHERE cart_id = $1`,
            [cartResult.rows[0].cart_id]
        )

        res.status(200).json({
            success: true,
            message:'Cart cleared'
        })

    } catch (error) {
       console.error('Clear cart error:', error)
       res.status(500).json({
        success: false,
        message: 'Internal server error'
       }) 
    }
}

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
}