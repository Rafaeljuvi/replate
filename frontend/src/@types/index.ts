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
    latitude: number;
    longitude: number;
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
    created_at: string;
    updated_at?: string;
}

//Map types
export interface LatLng{
    lat: number;
    lng: number;
}

//tab types
export type AuthTab = 'signin' | 'register';