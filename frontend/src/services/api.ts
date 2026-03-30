import axios from 'axios';
import type {
    ApiResponse,
    AuthResponse,
    LoginCredentials,
    RegisterCustomerData,
    RegisterMerchantStep1Data,
    RegisterMerchantStep3Data,
    ForgotPasswordData,
    ResetPasswordData,
    User,
    Store,
    GoogleAuthResponse,
    MerchantStats,
    Product,
    CreateProductData, 
    UpdateProductData,
    UpdateStoreData,
    PublicProduct,
    PublicStore,
    CartData,
    Order,
    OrderItem
} from '../@types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('===== API CONFIGURATION =====');
console.log('VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL);
console.log('API_BASE_URL being used:', API_BASE_URL);
console.log('============================');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type': 'application/json'
    }
});

//Request interceptor(addtoken)
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//response interceptor(handle errors)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
            removeUser();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
}

export const getToken = (): string | null => {
    return localStorage.getItem('token');
}

export const removeToken = (): void => {
    localStorage.removeItem('token');
}

export const setUser = (user:User): void => {
    localStorage.setItem('user', JSON.stringify(user));
}

export const getUser = (): void | null =>{
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

export const removeUser = (): void => {
    localStorage.removeItem('user');
}

export const logout = (): void =>{
    removeToken();
    removeUser();
    window.location.href = '/login';
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const {data} = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return data.data!;
}

export const registerCustomer = async (userData: RegisterCustomerData): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register/user', userData);
    return data.data!;
};

export const registerMerchantStep1 = async (userData: RegisterMerchantStep1Data): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register/store/merchant', userData);
    return data.data!;
  };

  export const registerMerchantStep2 = async (storeData: any) => {
    const { data } = await api.post<ApiResponse>('/auth/register/store/info', storeData);
    return data.data;
  };
  
export const registerMerchantStep3 = async (verificationData: RegisterMerchantStep3Data) => {
const formData = new FormData();
formData.append('bankAccountNumber', verificationData.bankAccountNumber);

    if (verificationData.qrisImage) {
    formData.append('qrisImage', verificationData.qrisImage);
    }

    if (verificationData.idCardImage) {
        formData.append('idCardImage', verificationData.idCardImage);
    }

    const { data } = await api.post<ApiResponse>('/auth/register/store/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
};

export const verifyEmail = async (token: string): Promise<User> => {
    const { data } = await api.post<ApiResponse<{ user: User }>>('/auth/verify-email', { token });
    return data.data!.user;
  };
  
export const resendVerification = async (email: string): Promise<void> => {
await api.post('/auth/resend-verification', { email });
};

export const forgotPassword = async (formData: ForgotPasswordData): Promise<void> => {
await api.post('/auth/forgot-password', formData);
};

export const resetPassword = async (formData: ResetPasswordData): Promise<void> => {
await api.post('/auth/reset-password', formData);
};

export const getProfile = async (): Promise<User> => {
const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
return data.data!.user;
};

//Store Apis
export const getMerchantStore = async(): Promise<Store> =>{
    const {data} = await api.get('/merchant/store');
    return data.data;
}

export const getMerchantStoreStats = async (): Promise<MerchantStats> => {
    const {data} = await api.get<ApiResponse<MerchantStats>>('/merchant/store/stats')
    return data.data!
}

//Update store Data
export const updateStore = async(
    storeData: UpdateStoreData,
    logoFile?: File
) : Promise<Store> => {
    const formData = new FormData();

    if(storeData.store_name !== undefined) formData.append('store_name', storeData.store_name);
    if(storeData.description !== undefined) formData.append('description', storeData.description);
    if(storeData.address !== undefined) formData.append('address', storeData.address)
    if(storeData.city !== undefined) formData.append('city', storeData.city)
    if (storeData.phone !== undefined) formData.append('phone', storeData.phone);
    if (storeData.operating_hours !== undefined) formData.append('operating_hours', storeData.operating_hours);
    if (storeData.bank_account_number !== undefined) formData.append('bank_account_number', storeData.bank_account_number);
    if (logoFile) formData.append('logo', logoFile);

    const { data } = await api.patch<ApiResponse<Store>>(
        '/merchant/store',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}}
    )
    return data.data!;
}

export const googleAuth = async(credential: string, mode: 'signin' | 'register') : Promise<GoogleAuthResponse> =>{
    const {data} = await api.post<ApiResponse<GoogleAuthResponse>>('/Auth/google', {credential, mode});
    return data.data!;
}

// Admin Apis
export const getAdminStats = async () => {
    const {data} = await api.get('/admin/stats')
    return data.data;
}

export const getPendingStores = async () => {
    const { data }= await api.get('/admin/stores/pending')
    return data.data
}

export const getAllStores = async (status?: 'pending' | 'approved' | 'rejected') => {
    const params = status ? `?status=${status}` : '';
    const { data } = await api.get(`/admin/stores${params}`);
    return data.data;
}

export const approveStore = async (storeId: string) => {
    const { data } = await api.patch(`/admin/stores/${storeId}/approve`);
    return data.data;
};

export const rejectStore = async (storeId: string, adminNotes: string) => {
    const {data} = await api.patch(`/admin/stores/${storeId}/reject`, {adminNotes})
    return data.data
}

// Product APIs

export const createProduct = async (
    productData: CreateProductData, 
    imageFile?: File
): Promise<Product> => {
    const formData = new FormData();
    
    formData.append('name', productData.name);
    formData.append('original_price', productData.original_price.toString());
    formData.append('discount_percentage', productData.discount_percentage.toString());
    formData.append('stock', productData.stock.toString());
    
    if (productData.description) formData.append('description', productData.description);
    if (productData.category) formData.append('category', productData.category);
    if (productData.available_from) formData.append('available_from', productData.available_from);
    if (productData.available_until) formData.append('available_until', productData.available_until);
    if (imageFile) formData.append('image', imageFile);
    
    const { data } = await api.post<ApiResponse<Product>>(
        '/merchant/products', 
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    
    return data.data!;
};

export const getProducts = async (): Promise<Product[]> => {
    const { data } = await api.get<ApiResponse<Product[]>>('/merchant/products');
    return data.data!;
}

export const getProductbyId = async (productId: string): Promise<Product> => {
    const { data } = await api.get<ApiResponse<Product>>(`/merchant/products/${productId}`);
    return data.data!;
}

export const updateProduct = async (
    productId: string,
    productData: UpdateProductData,
    imageFile?: File
): Promise<Product> => {
    const formData = new FormData();
    
    // Append only provided fields
    if (productData.name) formData.append('name', productData.name);
    if (productData.original_price !== undefined) {
        formData.append('original_price', productData.original_price.toString());
    }
    if (productData.discount_percentage !== undefined) {
        formData.append('discount_percentage', productData.discount_percentage.toString());
    }
    if (productData.stock !== undefined) {
        formData.append('stock', productData.stock.toString());
    }
    if (productData.description !== undefined) formData.append('description', productData.description);
    if (productData.category !== undefined) formData.append('category', productData.category);
    if (productData.available_from !== undefined) formData.append('available_from', productData.available_from);
    if (productData.available_until !== undefined) formData.append('available_until', productData.available_until);
    if (imageFile) formData.append('image', imageFile);
    
    const { data } = await api.patch<ApiResponse<Product>>(
        `/merchant/products/${productId}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    
    return data.data!;
};

export const deleteProduct = async (productId: string) : Promise<void> => {
    await api.delete(`/merchant/products/${productId}`);
}

export const toggleProductActive = async (productId: string) : Promise<Product> => {
    const { data } = await api.patch<ApiResponse<Product>>( `/merchant/products/${productId}/toggle`);
    return data.data!;
}

//Public Apis (customer)
export const getPublicProducts = async (
    lat?: number,
    lng?: number,
    radius: number = 2
): Promise<PublicProduct[]> => {
    const params = new URLSearchParams();
    if(lat !== undefined && lng !== undefined){
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
        params.append('radius', radius.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get<ApiResponse<PublicProduct[]>>(`/public/products${query}`);
    return data.data!;
}

export const getPublicProductById = async (productId: string, lat?: number, lng?: number) : Promise<PublicProduct> => {
    const params = new URLSearchParams();
    if(lat !== undefined && lng !== undefined) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
    }
    const query = params.toString()? `?${params.toString()}` : '';
    const { data } = await api.get<ApiResponse<PublicProduct>>(`/public/products/${productId}${query}`);
    return data.data!
}

export const getPublicStores = async (lat?: number, lng?: number):
Promise<PublicStore[]> => {
    const params = new URLSearchParams();
    if(lat !== undefined && lng !== undefined){
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get<ApiResponse<PublicStore[]>>(`/public/stores${query}`);
    return data.data!;
}

export const getPublicStoreById = async (
    storeId: string,
    lat?: number,
    lng?: number
): Promise<{store: PublicStore; products: PublicProduct[]}> => {
    const params = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get<ApiResponse<{store: PublicStore; products: PublicProduct[]}>>(`/public/stores/${storeId}${query}`)
    return data.data!;
}

//Cart APIs
export const getCart = async(): Promise<CartData> =>{
    const {data} = await api.get<ApiResponse<CartData>>('/cart')
    return data.data!
}

export const addToCart = async(productId: string, quantity: number = 1): Promise<void> => {
    await api.post('/cart/items', {product_id: productId, quantity});
}

export const updateCartItem = async (cartItemId: string, quantity:number): Promise<void> => {
    await api.patch(`/cart/items/${cartItemId}`, {quantity})
}

export const removeCartItem = async(cartItemId: string): Promise<void> => {
    await api.delete(`/cart/items/${cartItemId}`)
}

export const clearCart = async(): Promise<void> => {
    await api.delete('/cart')
}

//Orders APIs
export const createOrder = async (notes?: string, paymentMethod?: string): Promise<any[]> => {
    const { data } = await api.post<ApiResponse<{ orders: any[] }>>('/orders', {
        notes,
        payment_method: paymentMethod
    });
    return data.data!.orders;
};

export const getMyOrders = async (status?: string): Promise<Order[]> => {
    const query = status ? `?status=${status}` : '';
    const {data} = await api.get<ApiResponse<Order[]>>(`/orders${query}`);
    return data.data!
}

export const getOrderDetail = async(orderId: string): Promise<{order: Order; items: OrderItem[]}> => {
    const {data} = await api.get<ApiResponse<{order: Order; items: OrderItem[]}>>(`/orders/${orderId}`)
    return data.data!
}

export const cancelOrder = async (orderId: string): Promise<void> => {
    await api.patch(`/orders/${orderId}/cancel`)
}

//Merchant side of order APIs
export const getStoreOrders = async (status?: string): Promise<Order[]> => {
    const query = status ? `?status=${status}` : '';
    const { data } = await api.get<ApiResponse<Order[]>>(`/orders/store/list${query}`);
    return data.data!;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
    await api.patch(`/orders/store/${orderId}/status`, { status });
}

export const getStoreOrderDetail = async (orderId: string): Promise<{ order: Order; items: OrderItem[] }> => {
    const { data } = await api.get<ApiResponse<{ order: Order; items: OrderItem[] }>>(`/orders/store/${orderId}/detail`);
    return data.data!;
};

export const updateProfile = async (
    name: string,
    phone: string
) : Promise<User> => {
    const {data} = await api.patch<ApiResponse<{user: User}>>('/auth/profile', {name, phone});
    return data.data!.user
}

export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    try {
        const response = await api.patch('/auth/change-password', { currentPassword, newPassword });
        console.log('response:', response); // ← tambahkan
    } catch (error: any) {
        throw error; 
    }
};


export default api;