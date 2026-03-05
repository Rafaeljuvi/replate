import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {useForm, Controller} from "react-hook-form";
import {
    ArrowLeft, Store, MapPin, Phone, CreditCard, Camera, Save, LogOut, CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {getMerchantStore, updateStore} from '../services/api';
import type { Store as StoreType, UpdateStoreData } from "../@types";
import Logo from "../components/layout/Logo";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import OperatingHoursInput from "../components/ui/OperatingHourseInput";
import SaveConfirmModal from "../components/merchant/SaveConfirm";

interface StoreSettingsFormData {
    store_name: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    operating_hours: string;
    bank_account_number: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function StoreSettingsPage(){
    const navigate = useNavigate();
    const {logout} = useAuth();
    
    const[store, setStore] = useState<StoreType | null>(null);
    const[isLoading, setIsloading] = useState(true);
    const[isSubmitting, setIsSubmitting] = useState(false);
    const[logoFile, setLogoFile] = useState<File | null>(null);
    const[logoPreview, setLogoPreview] = useState<string | null>(null);
    const[hasChanges, setHasChanges] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const isFirstLoad = useRef(true);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'back' | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: {errors}
    } = useForm<StoreSettingsFormData>()

    //Detect any form changes
    const watchedValues = watch();
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        if (store) setHasChanges(true);
    }, [watchedValues]);


    const fetchStore = async () => {
    try {
        setIsloading(true);
        const data = await getMerchantStore();
        setStore(data);
        isFirstLoad.current = true;  
        reset({
            store_name: data.store_name,
            description: data.description || '',
            address: data.address,
            city: data.city,
            phone: data.phone,
            operating_hours: data.operating_hours || '',
            bank_account_number: data.bank_account_number || ''
        });
        if(data.logo_url) {
            setLogoPreview(`${API_BASE_URL}${data.logo_url}`);
        } else {
            setLogoPreview(null);
        }
        setHasChanges(false);
    } catch (error: any) {
        toast.error('Failed to load store settings');
    } finally {
        setIsloading(false);
    }
};

    useEffect(() => { fetchStore();}, []);
    
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
        setHasChanges(true);
    };

    const onSubmit = async (data: StoreSettingsFormData) =>{
        try {
            setIsSubmitting(true);
            const updateData: UpdateStoreData ={
                store_name: data.store_name,
                description: data.description,
                address: data.address,
                city: data.city,
                phone: data.phone,
                operating_hours: data.operating_hours,
                bank_account_number: data.bank_account_number
            };
            await updateStore(updateData, logoFile || undefined);
            toast.success('Store settings saved!')
            setHasChanges(false);
            setLogoFile(null);
            await fetchStore();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save store settings');
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out succesfully')
        navigate('/login');
    }

    const handleBack = () => {
        if(hasChanges) {
            setPendingAction('back');
            setShowUnsavedModal(true);
        } else{
            navigate('/merchant/dashboard');
        }
    }

    const handleConfirmLeave = () =>{
        setShowUnsavedModal(false)
        pendingAction === 'back' && navigate('/merchant/dashboard');
        setPendingAction(null);
    };

    return (
        <div className="min-h-screen bg-primary">
            <div className="bg-white shadow-lg">
                <div className="max-w-5xl mx-auto px-4 py-4 lg:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="small"
                                leftIcon={<ArrowLeft size={18}/>}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                            <Logo size="small"/>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-gray-800">Store Settings</p>
                            <p className="text-xs text-gray-500">Manage your store information</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="small"
                            leftIcon={<LogOut size={16}/>}
                            onClick={handleLogout}
                            className="bg-red-500 text-white  hover:bg-red-50 hover:text-red-500 border border-red-500"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 lg:px-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Logo & status */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Logo Card */}
                            <div className="bg-white rounded-xl shadow p-6">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                                    Store Logo
                                </p>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-28 h-28 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover:border-primary transition-colors relative group"
                                    onClick={() => logoInputRef.current?.click()}>
                                        {logoPreview 
                                            ? <img src={logoPreview} alt='Store Logo' className="w-full h-full object-cover"/>
                                            : <Store size={40} className="text-gray-400"/>
                                        }
                                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={20} className="text-white"/>
                                        </div>
                                    </div>

                                    <input 
                                        ref={logoInputRef}
                                        type="file" 
                                        accept="image/jpeg,image/jpg,image/png"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="small"
                                        leftIcon={<Camera size={16}/>}
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                    </Button>
                                    <p className="text-xs text-gray-400 text-center">JPG or PNG, max 5MB</p>
                                </div>
                            </div>

                            {/* Store Status  */}
                            {store && (
                                <div className="bg-white rounded-xl shadow p-6">
                                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Store Status</h2>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Visibility</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {store.is_active ? '🟢 Active' : '⏸️ Inactive'}
                                            </span>
                                        </div>
                                        {store.approved_at && (
                                            <div className="pt-2 border-t border-gray-100">
                                                <p className="text-xs text-gray-400">
                                                    Approved: {new Date(store.approved_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-white rounded-xl shadow p-6 hidden lg:block">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth 
                                    isLoading={isSubmitting}
                                    leftIcon={<Save size={18}/>}
                                    disabled={!hasChanges || isSubmitting}
                                >
                                    {isSubmitting? 'Saving...' : 'Save Changes'}
                                </Button>
                                {!hasChanges && (
                                    <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                                        <CheckCircle size={12} className="text-green-500"/> All changes saved
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow p-6">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Store size={16}/> Basic Information
                                </p>
                                <div className="space-y-4">
                                    <Input
                                        label="Store Name"
                                        placeholder="Your Store Name"
                                        error={errors.store_name?.message}
                                        {...register('store_name', {
                                            required: 'Store name is required',
                                            minLength: {value: 3, message: 'Minimum 3 characters'}
                                        })}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea 
                                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-primary resize-none ${errors.description ? 'border-red-500': 'border-gray-300'}`}
                                            rows={4}
                                            placeholder="Describe your store..."
                                            {...register('description', {
                                                maxLength: {value: 200, message: 'Max 200 characters'}
                                            })}
                                        />
                                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracing-wide mb-4 flex items-center gap-2">
                                    <MapPin size={16}/> Location
                                </h2>
                                <div className="space-y-4">
                                    <Input
                                        label="Address"
                                        placeholder="Full street address"
                                        error={errors.address?.message}
                                        {...register('address', {
                                            required: 'Address is required',
                                            minLength: {value: 10, message: 'Enter complete address'}
                                        })}
                                    />
                                    <Input
                                        label="city"
                                        placeholder="e.g. Jakarta"
                                        error={errors.city?.message}
                                        {...register('city', {required: 'City is required'})}
                                    />
                                    {store && (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-xs fonr-medium text-gray-500 mb-1">Map Coordinates (view only)</p>
                                            <p className="text-sm text-gray-600 font-mono">
                                                {Number(store.latitude).toFixed(6)}, {Number(store.longitude).toFixed(6)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">To change location, contact support.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow p-6">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Phone size={16}/> Contact & Hours
                                </h2>
                                <div className="space-y-4">
                                    <Input
                                        label="Store phone"
                                        type="tel"
                                        placeholder="e.g. +62 812-3456-7890"
                                        leftIcon={<Phone size={16}/>}
                                        error={errors.phone?.message}
                                        {...register('phone', {
                                            required: 'Phone is required',
                                            pattern: {value: /^(08|628|\+628)[0-9]{8,11}$/, message: 'Invalid phone number format'}
                                        })}
                                    />
                                    <Controller 
                                        name="operating_hours"
                                        control={control}
                                        rules={{required: 'Operating hours are required'}}
                                        render={({field}) => (
                                            <OperatingHoursInput
                                                label="Operating Hours"
                                                error={errors.operating_hours?.message}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <CreditCard size={16}/> Payment Information
                                </p>
                                <Input
                                    label="Bank Account Number"
                                    placeholder="e.g. 1234567890"
                                    leftIcon={<CreditCard size={16}/>}
                                    error={errors.bank_account_number?.message}
                                    {...register('bank_account_number')}
                                />
                                <p className="text-xs text-gray-400 mt-2">Please check your payment Information before submitting.</p>
                            </div>

                            <div className="lg:hidden">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    isLoading={isSubmitting}
                                    leftIcon={<Save size={18}/>}
                                    disabled={!hasChanges || isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <SaveConfirmModal
                isOpen={showUnsavedModal}
                pendingAction={pendingAction}
                onConfirm={handleConfirmLeave}
                onCancel={() => {
                    setShowUnsavedModal(false)
                    setPendingAction(null);
                }}
            />
        </div>
    )

}

