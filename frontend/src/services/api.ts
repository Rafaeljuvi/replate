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
    MerchantStats
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

export const getMerchantStore = async(): Promise<Store> =>{
    const {data} = await api.get('/merchant/store');
    return data.data;
}

export const getMerchantStoreStats = async (): Promise<MerchantStats> => {
    const {data} = await api.get<ApiResponse<MerchantStats>>('/merchant/store/stats')
    return data.data!
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



export default api;