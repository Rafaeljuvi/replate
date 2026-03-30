import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, Shield, LogOut, ArrowLeft, Edit2, Save, X, Eye, EyeOff
} from 'lucide-react'
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import CustomerHeader from "../components/customer/CustomerHeader";
import { updateProfile, changePassword, setUser as saveUser } from '../services/api'

export default function ProfilePage() {
    const navigate = useNavigate();
    const {user, logout, setUser} = useAuth();

    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showBackConfirm, setShowBackConfirm] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword]= useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('')

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    })

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleBack = () => {
        if (isEditingProfile || isChangingPassword) {
            setShowBackConfirm(true);
        } else {
            navigate('/dashboard')
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out succesfully')
    }

    const handleSaveProfile = async () => {
       if (!profileForm.name.trim() || !profileForm.phone.trim()){
        toast.error('Name and phone cannot be empty');
        return;
       }

       setIsSavingProfile(true);
       try {
        const updatedUser = await updateProfile(profileForm.name, profileForm.phone);
        setUser(updatedUser); 
        saveUser(updatedUser);
        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
        setIsSavingProfile(false);
    }
    }

    const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
        toast.error('Current password is required');
        return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    if (passwordForm.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
    }

    setIsSavingPassword(true);
    try {
        await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
        const message = error.response?.data?.message || 'Failed to change password';
        if (message.includes('incorrect')) {
            setPasswordError('Current password is incorrect');
        } else {
            toast.error(message);
        }
    } finally {
        setIsSavingPassword(false);
    }
};

    const getInitails = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="min-h-screen bg-secondary">
            <CustomerHeader activeOrderCount={0}/>
            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* header Card */}
                <div className="bg-white rounded-2xl px-6 py-4 shadow-sm mb-6 flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >   
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <User size={24} className="text-primary"/>
                            My Profile
                        </h1>
                        <p className="text-sm text-gray-500 ml-8">Manage your account settings</p>
                    </div>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">

                    <div className="bg-gradient-to-br from-primary to-green-400 px-6 py-8 flex flex-col items-center relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 shadow-lg">
                                <span className="text-2xl font-bold text-primary">
                                    {getInitails(user?.name || 'U')}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                            <span className="mt-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-xs font-medium">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-6 py-5">
                        {!isEditingProfile ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <User size={16} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Full Name</p>
                                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <Mail size={16} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Email</p>
                                            <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <Phone size={16} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Phone</p>
                                            <p className="text-sm font-semibold text-gray-800">{user?.phone || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                                            <Shield size={16} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Account Status</p>
                                            <p className="text-sm font-semibold text-green-600"> Verified</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="mt-5 w-full py-2.5 border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={16}/>
                                        Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name</label>
                                        <input 
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium mb-1 block">Phone</label>
                                        <input 
                                            type="text"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium mb-1 block">Email</label>
                                        <input 
                                            type="text"
                                            value={user?.email}
                                            disabled
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => setIsEditingProfile(false)}
                                        disabled={isSavingProfile}
                                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"                                    
                                    >
                                        <X size={15}/>
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={15}/>
                                        Save Changes
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Change password */}
                <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
                    <div className="px-6 py-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Shield size={18} className="text-primary"/>
                                Security
                            </h3>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    disabled={isSavingPassword}
                                    className="text-xs text-primary font-semibold hover:underline"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {!isChangingPassword ? (
                            <p className="text-sm text-gray-500">
                                Keep your account secure with a string password
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => {
                                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                                                setPasswordError(''); 
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            {passwordError}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            setPasswordError('')
                                        }}
                                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X size={15} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={15} />
                                        Save Password
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5">
                        <h3 className="font-bold text-gray-800 mb-1">Logout</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Sign out of your account on this device
                        </p>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-50 text-red-500 font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
                        >
                            <LogOut size={18}/>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {showBackConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowLeft size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                            Discard Changes?
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            You have unsaved changes. Are you sure you want to go back?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBackConfirm(false)}
                                className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={() => {
                                    setShowBackConfirm(false);
                                    setIsEditingProfile(false);
                                    setIsChangingPassword(false);
                                    navigate('/dashboard');
                                }}
                                className="flex-1 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-primary transition-colors"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}