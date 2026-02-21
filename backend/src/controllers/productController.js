const pool = require('../config/db');


const createProduct = async (req, res) => {
    try {
        const merchantId = req.user.userId;
        const {
            name,
            description,
            category,
            original_price,
            discounted_price,
            stock,
            image_url,
            available_from,
            available_until
        } = req.body;

        // Verify user is merchant
        if (req.user.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only.'
            });
        }

        // Validate required fields
        if (!name || !original_price || !discounted_price || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Name, original price, discounted price, and stock are required.'
            });
        }

        // Validate prices
        if (original_price < 0 || discounted_price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Prices cannot be negative.'
            });
        }

        if (discounted_price > original_price) {
            return res.status(400).json({
                success: false,
                message: 'Discounted price cannot be higher than original price.'
            });
        }

        // Validate stock
        if (stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock cannot be negative.'
            });
        }

        // Get merchant's store
        const storeResult = await pool.query(
            'SELECT store_id FROM stores WHERE merchant_id = $1',
            [merchantId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        // Calculate discount percentage
        const discount_percentage = Math.round(
            ((original_price - discounted_price) / original_price) * 100
        );

        // Insert product
        const result = await pool.query(
            `INSERT INTO products (
                store_id,
                name,
                description,
                category,
                original_price,
                discounted_price,
                discount_percentage,
                stock,
                image_url,
                available_from,
                available_until
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                storeId,
                name,
                description || null,
                category || null,
                original_price,
                discounted_price,
                discount_percentage,
                stock,
                image_url || null,
                available_from || null,
                available_until || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const merchantId = req.user.userId;

        // Verify user is merchant
        if (req.user.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only.'
            });
        }

        // Get merchant's store
        const storeResult = await pool.query(
            'SELECT store_id FROM stores WHERE merchant_id = $1',
            [merchantId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        // Get all products for this store
        const result = await pool.query(
            `SELECT * FROM products 
             WHERE store_id = $1 
             ORDER BY created_at DESC`,
            [storeId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const merchantId = req.user.userId;
        const { id: productId } = req.params;

        // Verify user is merchant
        if (req.user.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only.'
            });
        }

        // Get merchant's store
        const storeResult = await pool.query(
            'SELECT store_id FROM stores WHERE merchant_id = $1',
            [merchantId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        // Get product and verify ownership
        const result = await pool.query(
            'SELECT * FROM products WHERE product_id = $1 AND store_id = $2',
            [productId, storeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const merchantId = req.user.userId;
        const { id: productId } = req.params;
        const {
            name,
            description,
            category,
            original_price,
            discounted_price,
            stock,
            image_url,
            available_from,
            available_until
        } = req.body;

        // Verify user is merchant
        if (req.user.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only.'
            });
        }

        // Get merchant's store
        const storeResult = await pool.query(
            'SELECT store_id FROM stores WHERE merchant_id = $1',
            [merchantId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        // Check product exists and owned by merchant
        const productCheck = await pool.query(
            'SELECT * FROM products WHERE product_id = $1 AND store_id = $2',
            [productId, storeId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        const currentProduct = productCheck.rows[0];

        // Validate prices if provided
        const finalOriginalPrice = original_price !== undefined ? original_price : currentProduct.original_price;
        const finalDiscountedPrice = discounted_price !== undefined ? discounted_price : currentProduct.discounted_price;

        if (finalOriginalPrice < 0 || finalDiscountedPrice < 0) {
            return res.status(400).json({
                success: false,
                message: 'Prices cannot be negative.'
            });
        }

        if (finalDiscountedPrice > finalOriginalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Discounted price cannot be higher than original price.'
            });
        }

        // Calculate discount percentage
        const discount_percentage = Math.round(
            ((finalOriginalPrice - finalDiscountedPrice) / finalOriginalPrice) * 100
        );

        // Build update query dynamically
        const fieldsToUpdate = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            fieldsToUpdate.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (description !== undefined) {
            fieldsToUpdate.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (category !== undefined) {
            fieldsToUpdate.push(`category = $${paramCount++}`);
            values.push(category);
        }
        if (original_price !== undefined) {
            fieldsToUpdate.push(`original_price = $${paramCount++}`);
            values.push(original_price);
        }
        if (discounted_price !== undefined) {
            fieldsToUpdate.push(`discounted_price = $${paramCount++}`);
            values.push(discounted_price);
        }
        if (original_price !== undefined || discounted_price !== undefined) {
            fieldsToUpdate.push(`discount_percentage = $${paramCount++}`);
            values.push(discount_percentage);
        }
        if (stock !== undefined) {
            fieldsToUpdate.push(`stock = $${paramCount++}`);
            values.push(stock);
        }
        if (image_url !== undefined) {
            fieldsToUpdate.push(`image_url = $${paramCount++}`);
            values.push(image_url);
        }
        if (available_from !== undefined) {
            fieldsToUpdate.push(`available_from = $${paramCount++}`);
            values.push(available_from);
        }
        if (available_until !== undefined) {
            fieldsToUpdate.push(`available_until = $${paramCount++}`);
            values.push(available_until);
        }

        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update.'
            });
        }

        // Add product_id and store_id for WHERE clause
        values.push(productId, storeId);

        const query = `
            UPDATE products 
            SET ${fieldsToUpdate.join(', ')}
            WHERE product_id = $${paramCount++} AND store_id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const merchantId = req.user.userId;
        const { id: productId } = req.params;

        // Verify user is merchant
        if (req.user.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only.'
            });
        }

        // Get merchant's store
        const storeResult = await pool.query(
            'SELECT store_id FROM stores WHERE merchant_id = $1',
            [merchantId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        // Delete product (verify ownership in WHERE clause)
        const result = await pool.query(
            'DELETE FROM products WHERE product_id = $1 AND store_id = $2 RETURNING *',
            [productId, storeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: {
                deleted_product_id: productId
            }
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const toggleProductActive = async (req, res) => {
    try {
        const merchantId = req.user.userId;
        const { id: productId } = req.params;

        // Verify user is merchant
        if (req.user.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden. Merchant only.'
            });
        }

        // Get merchant's store
        const storeResult = await pool.query(
            'SELECT store_id FROM stores WHERE merchant_id = $1',
            [merchantId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found.'
            });
        }

        const storeId = storeResult.rows[0].store_id;

        // Toggle is_active
        const result = await pool.query(
            `UPDATE products 
             SET is_active = NOT is_active 
             WHERE product_id = $1 AND store_id = $2 
             RETURNING *`,
            [productId, storeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: `Product ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Toggle product active error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleProductActive
};