//User types
export interface User {
    user_id: string;
    email: string;
    name: string;
    role: 'user' | 'merchant' | 'admin';
    is_verified: boolean;
    created_at: string;
    updated_at?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCustomerData {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export interface RegisterMerchantStep1Data{
    name: string;
    email: string;
    phone: string;
    password: string
    confirmPassword: string;
}

export interface RegisterMerchantStep2Data{
    storeName: string;
    description: string;
    address: string;
    city: string;
    location: { lat: number; lng: number };
    phone: string;
    operatingHours: string;
}

export interface RegisterMerchantStep3Data{
    bankAccountNumber: string;
    qrisImage?: File;
    idCardImage?: File;
}

export interface ForgotPasswordData{
    email: string;
}

export interface ResetPasswordData{
    token: string;
    newPassword: string;
    confirmPassword: string;
}


//API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface AuthResponse {
    user: User;
    token: string;
    emailSent?: boolean;
}

//Store types
export interface Store{
    store_id: string;
    merchant_id: string;
    store_name: string;
    description?: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    phone: string;
    operating_hours: string;
    logo_url?: string;
    banner_url?: string;
    bank_account_number?: string;
    qris_image_url?: string;
    id_card_image_url?: string;
    is_active: boolean;
    approval_status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    approved_at?: string;
    approved_by?: string;
    created_at: string;
    updated_at?: string;
    average_rating?: number;    
    total_ratings?: number; 
}

//Map types
export interface LatLng{
    lat: number;
    lng: number;
}

//tab types
export type AuthTab = 'signin' | 'register';

//google login
export interface GoogleAuthResponse {
    user: User;
    token: string;
    isNewUser: boolean;
}

export interface MerchantStats {
    total_products: number;
    active_products: number;
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_revenue: number;
    average_rating: number;
    total_ratings: number;
}

// =============================================
// PRODUCT TYPES
// =============================================

export interface Product {
    product_id: string;
    store_id: string;
    name: string;
    description?: string;
    category?: string;
    original_price: number;
    discounted_price: number;
    discount_percentage: number;
    stock: number;
    image_url?: string;
    is_active: boolean;
    available_from?: string;
    available_until?: string;
    created_at: string;
    updated_at?: string;
}

export interface CreateProductData {
    name: string;
    description?: string;
    category?: string;
    original_price: number;
    discount_percentage: number;
    stock: number;
    image_url?: string;
    available_from?: string;
    available_until?: string;
}

export interface UpdateProductData {
    name?: string;
    description?: string;
    category?: string;
    original_price?: number;
    discount_percentage?: number;
    stock?: number;
    image_url?: string;
    available_from?: string;
    available_until?: string;
  }

// =============================================
// Data store
// =============================================  

export interface UpdateStoreData {
    store_name?: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    operating_hours?: string;
    bank_account_number?: string;
}

//Public type (Customer)
export interface PublicProduct {
    product_id: string;
    store_id: string;
    name: string;
    description?: string;
    category?: string;
    original_price: number;
    discounted_price: number;
    discount_percentage: number;
    stock: number;
    image_url?: string;
    available_from?: string;
    available_until?: string;
    created_at: string;
    store_name: string;
    store_logo?: string;
    average_rating?: number;
    operating_hours?: string;
    store_lat?: number;
    store_lng?: number;
    distance_km?: number;
    total_ratings?: number;
    address?: string;
    city?: string;
    store_phone?: string;
    latitude?: number;
    longitude?: number;
    is_available_now?: boolean;
}

export interface PublicStore {
    store_id: string;
    store_name: string;
    description?: string;
    logo_url?: string;
    address: string;
    city: string;
    operating_hours?: string;
    average_rating?: number;
    total_ratings?: number;
    latitude: number;
    longitude: number;
    active_products: number;
    distance_km?: number
    phone?: string
}

export interface CartItem {
    cart_item_id: string;
    cart_id: string;
    quantity: number;
    price_at_time: number;
    subtotal: number;
    product_id: string;
    name: string;
    description?: string;
    image_url?: string;
    stock: number;
    discount_percentage: number;
    original_price: number;
    discounted_price: number;
    is_active: boolean;
    available_from?: string;
    available_until?: string;
    store_id: string;
    store_name: string;
    store_logo?: string;
}

export interface CartData {
    items: CartItem[];
    total_items: number;
    total_price: number
}

export interface Order {
    snap_token: any;
    order_id: string;
    status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
    total_price: number;
    notes?: string;
    payment_method?: string;
    payment_status: 'unpaid' | 'paid' | 'refunded';
    created_at: string;
    updated_at: string;
    store_id?: string;
    store_name?: string;
    store_logo?: string;
    address?: string;
    store_phone?: string;
    total_items?: number;
    total_quantity?: number;
    customer_name?: string;
    customer_phone?: string;
}

export interface OrderItem {
    order_item_id: string;
    quantity: number;
    price_at_time: number;
    subtotal: number;
    product_id: string;
    name: string;
    image_url?: string;
    category?: string;
}