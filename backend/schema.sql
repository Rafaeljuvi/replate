-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if exists (untuk clean start)
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'merchant', 'admin')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add google_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Merchant TABLE (untuk Merchant)
CREATE TABLE stores (
    store_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    address TEXT NOT NULL,
    city VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    operating_hours VARCHAR(255),
    bank_account_number VARCHAR(50),
    qris_image_url VARCHAR(500),
    id_card_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambahan untuk stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(user_id);

UPDATE stores
SET approval_status = 'approved', is_active = true
WHERE approval_status IS NULL OR approval_status = '';

CREATE INDEX IF NOT EXISTS idx_stores_approval_status ON stores(approval_status)


-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_merchant ON stores(merchant_id);

--Tambahin average rating dan total rating
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT (0.0);

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- INSERT INTO users (email, password, name, phone, role, is_verified) 
-- VALUES (
--     'admin@bakery.com', 
--     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
--     'Admin', 
--     '081234567890', 
--     'admin', 
--     true
-- );


-- tambahin ini

-- ALTER TABLE stores 
-- ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0;

-- ALTER TABLE stores 
-- ADD COLUMN total_ratings INTEGER DEFAULT 0;


-- tambahin ini buat table baru

-- =============================================
-- PRODUCTS TABLE SCHEMA
-- =============================================

-- Create products table
-- CREATE TABLE IF NOT EXISTS products (
--     -- Primary Key
--     product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
--     -- Foreign Key to stores
--     store_id UUID NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    
--     -- Product Information
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     category VARCHAR(100),
    
--     -- Pricing
--     original_price DECIMAL(10, 2) NOT NULL CHECK (original_price >= 0),
--     discounted_price DECIMAL(10, 2) NOT NULL CHECK (discounted_price >= 0),
--     discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    
--     -- Inventory
--     stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    
--     -- Media
--     image_url VARCHAR(500),
    
--     -- Availability
--     is_active BOOLEAN DEFAULT true,
--     available_from TIME,
--     available_until TIME,
    
--     -- Timestamps
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- =============================================
-- -- INDEXES (for faster queries)
-- -- =============================================

-- -- Index on store_id (frequently used in WHERE clause)
-- CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- -- Index on is_active (for filtering active/inactive products)
-- CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- -- Composite index for common query: active products by store
-- CREATE INDEX IF NOT EXISTS idx_products_store_active ON products(store_id, is_active);

-- -- =============================================
-- -- TRIGGER (auto-update updated_at)
-- -- =============================================

-- -- Function to update updated_at timestamp
-- CREATE OR REPLACE FUNCTION update_products_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Trigger that calls the function before UPDATE
-- CREATE TRIGGER trigger_update_products_updated_at
--     BEFORE UPDATE ON products
--     FOR EACH ROW
--     EXECUTE FUNCTION update_products_updated_at();

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check table structure
-- \d products

-- Check if table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'products';