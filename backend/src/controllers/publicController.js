const pool = require('../config/db')

//get all active rpoducts
const getPublicProducts = async (req, res) =>{
    try {
        const {lat, lng, radius = 2} = req.query;
        const hasLocation = lat && lng;
        const values = [];
        let paramCount = 1;

        let query = `
            SELECT 
                p.product_id,
                p.store_id,
                p.name,
                p.description,
                p.category,
                p.original_price,
                p.discounted_price,
                p.discount_percentage,
                p.stock,
                p.image_url,
                p.available_from,
                p.available_until,
                p.created_at,
                s.store_name,
                s.average_rating,
                s.operating_hours,
                s.logo_url as store_logo,
                s.latitude as store_lat,
                s.longitude as store_lng
                ${hasLocation ? `,
                ROUND (
                        (6371 * acos(
                            LEAST(1.0,
                                cos(radians($1))
                                * cos(radians(s.latitude))
                                * cos(radians(s.longitude) - radians($2))
                                + sin(radians($1))
                                * sin(radians(s.latitude))
                                )
                            )):: numeric, 1
                            ) as distance_km` : ''}
                FROM products p
                INNER JOIN stores s ON p.store_id = s.store_id
                WHERE p.is_active = true
                    AND p.stock > 0
                    AND s.is_active = true
                    AND s.approval_status = 'approved'
                    AND (
                        p.available_from IS NULL
                        OR p.available_until IS NULL
                        OR (
                            CURRENT_TIME::time >= p.available_from::time
                            AND CURRENT_TIME::time <= p.available_until::time
                            )
                        )
                `;

                if(hasLocation){
                    values.push(
                        parseFloat(lat),
                        parseFloat(lng),
                        parseFloat(lat),
                        parseFloat(lng),
                        parseFloat(radius)
                    );
                    query += `
                    AND (
                        6371 * acos(
                            LEAST(1.0, 
                                cos(radians($3))
                                * cos(radians(s.latitude))
                                * cos(radians(s.longitude) - radians($4))
                                + sin(radians($3))
                                * sin(radians(s.latitude))
                            )    
                        )
                    ) <= $5
                    `;
                    query += `ORDER BY distance_km ASC, p.created_at DESC`;
                } else{
                    query += `ORDER BY p.created_at DESC`;
                }

                const result = await pool.query(query, values);

                res.status(200).json({
                    success: true,
                    data: result.rows,
                    location_filtered : !!hasLocation 
                })

    } catch (error) {
        console.error('Get public products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve products'
        })
    }
}

//Get single product
const getPublicProductById = async(req, res) =>{
    try {
        const {id: productId} = req.params;
        const { lat,lng } = req.query;
        const hasLocation = lat && lng;

        const result = await pool.query(`
            SELECT 
                p.product_id,
                p.store_id,
                p.name,
                p.description,
                p.category,
                p.original_price,
                p.discounted_price,
                p.discount_percentage,
                p.stock,
                p.image_url,
                p.available_from,
                p.available_until,
                p.created_at,
                s.store_name,
                s.logo_url as store_logo,
                s.average_rating,
                s.total_ratings,
                s.operating_hours,
                s.address,
                s.city,
                s.phone as store_phone,
                s.latitude,
                s.longitude
                ${hasLocation ? `,
                ROUND(
                    (6371 * acos(
                        LEAST(1.0,
                            cos(radians($2))
                            * cos(radians(s.latitude))
                            * cos(radians(s.longitude) - radians($3))
                            + sin(radians($2))
                            * sin(radians(s.latitude))
                        )
                    ))::numeric, 1
                ) as distance_km
                ` : ''}
             FROM products p
             INNER JOIN stores s ON p.store_id = s.store_id
             WHERE p.product_id = $1
               AND p.is_active = true
               AND s.is_active = true
               AND s.approval_status = 'approved'`,
            hasLocation
                ? [productId, parseFloat(lat), parseFloat(lng)]
                : [productId]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        res.status(200).json({
            success:true,
            data: result.rows[0]
        })

    } catch (error) {
        console.error('get public product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// Get all active stores
const getPublicStores = async (req, res) => {
    try {
        const {lat, lng} = req.query;
        const hasLocation = lat && lng;

        const query = `
            SELECT 
                s.store_id,
                s.store_name,
                s.description,
                s.logo_url,
                s.address,
                s.city,
                s.operating_hours,
                s.average_rating,
                s.total_ratings,
                s.latitude,
                s.longitude,
                COUNT(p.product_id) FILTER (WHERE p.is_active = true) as active_products
                ${hasLocation ? `,
                    ROUND(
                        (6371 * acos(
                            LEAST(1.0,
                                cos(radians($1))
                                * cos(radians(s.latitude))
                                * cos(radians(s.longitude) - radians($2))
                                + sin(radians($1))
                                * sin(radians(s.latitude))
                            )
                        ))::numeric, 1
                        ) as distance_km`: ''}
                FROM stores s
                LEFT JOIN products p ON p.store_id = s.store_id
                WHERE s.is_active = true
                AND s.approval_status = 'approved'
                GROUP BY s.store_id
                ORDER BY ${hasLocation ? 'distance_km ASC' : 's.average_rating DESC NULLS LAST'}
                `

                const result = await pool.query(
                    query,
                    hasLocation ? [parseFloat(lat), parseFloat(lng)] : []
                );

                res.status(200).json({
                    success: true,
                    data: result.rows,
                    location_filtered: !!hasLocation
                });

    } catch (error) {
        console.error('get public sotes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

//get single store with producs
const getPublicStoreById = async (req, res) => {
    try {
        const {id: storeId} = req.params;
        const { lat,lng } = req.query;
        const hasLocation = lat && lng;
        
        const storeResult = await pool.query(`
            SELECT
                store_id,
                store_name,
                description,
                logo_url,
                address,
                city,
                operating_hours,
                average_rating,
                total_ratings,
                latitude,
                longitude,
                phone,
                (
                    SELECT COUNT(*) 
                    FROM products 
                    WHERE store_id = $1 
                    AND is_active = true 
                    AND stock > 0
                ) as active_products
                ${hasLocation ? `,
                    ROUND(
                        (6371 * acos(
                            LEAST(1.0,
                                cos(radians($2))
                                * cos(radians(latitude))
                                * cos(radians(longitude) - radians($3))
                                + sin(radians($2))
                                * sin(radians(latitude))
                            )
                        ))::numeric, 1
                    ) as distance_km` : ''}
            FROM stores
            WHERE store_id = $1
            AND is_active = true
            AND approval_status = 'approved'`,
            hasLocation
                ? [storeId, parseFloat(lat), parseFloat(lng)]
                : [storeId]
            );

        if(storeResult.rows.length === 0) {
            return res.status(404).json({
                success:false,
                message: 'Store not found'
            });
        }

        const productResult = await pool.query(
            `SELECT
                p.product_id,
                p.name,
                p.description,
                p.category,
                p.original_price,
                p.discounted_price,
                p.discount_percentage,
                p.stock,
                p.image_url,
                p.available_from,
                p.available_until,
                p.is_active,
                s.store_name,
                s.logo_url as store_logo,
                s.average_rating,
                CASE 
                    WHEN p.available_from IS NULL OR p.available_until IS NULL THEN true
                    WHEN CURRENT_TIME::time >= p.available_from::time 
                        AND CURRENT_TIME::time <= p.available_until::time THEN true
                    ELSE false
                END as is_available_now
            FROM products p
            INNER JOIN stores s ON p.store_id = s.store_id
            WHERE p.store_id = $1
            AND p.is_active = true
            ORDER BY is_available_now DESC, p.created_at DESC`, [storeId]
        )

        res.status(200).json({
            success: true,
            data: {
                store: storeResult.rows[0],
                products: productResult.rows
            }
        });

    } catch (error) {
        console.error('Get public store error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getPublicProducts,
    getPublicProductById,
    getPublicStores,
    getPublicStoreById
}