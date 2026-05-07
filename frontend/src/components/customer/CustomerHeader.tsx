import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, ShoppingCart, ClipboardList, ClipboardCheck, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../layout/Logo';
import toast from 'react-hot-toast';

interface CustomerHeaderProps {
    locationStatus?: 'loading' | 'granted' | 'denied' | 'idle';
    onRefresh?: () => void;
    isRefreshing?: boolean;
    activeOrderCount?: number;
    showRefresh?: boolean;
}

export default function CustomerHeader({
    locationStatus = 'idle',
    onRefresh,
    isRefreshing = false,
    activeOrderCount = 0,
    showRefresh = false,
}: CustomerHeaderProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* Left — Logo */}
                    <div onClick={() => navigate('/dashboard')} className="cursor-pointer flex-shrink-0">
                        <div className="hidden sm:block">
                            <Logo size="medium" />
                        </div>
                        <div className="block sm:hidden">
                            <Logo size="small" />
                        </div>
                    </div>

                    {/* Desktop Right — Icons */}
                    <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                        {showRefresh && (
                            <div className="flex items-center gap-2 mr-1">
                                <button
                                    onClick={onRefresh}
                                    disabled={isRefreshing}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-600"
                                >
                                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-primary' : ''} />
                                </button>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                    locationStatus === 'granted' ? 'bg-green-50 text-green-600'
                                    : locationStatus === 'denied' ? 'bg-red-50 text-red-500'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                    <MapPin size={13} />
                                    {locationStatus === 'granted' ? 'Near You'
                                    : locationStatus === 'denied' ? 'Location Off'
                                    : locationStatus === 'loading' ? 'Locating...'
                                    : ''}
                                </div>
                            </div>
                        )}

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        <button onClick={() => navigate('/cart')} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
                            <ShoppingCart size={20} />
                            {activeOrderCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {activeOrderCount}
                                </span>
                            )}
                        </button>

                        <button onClick={() => navigate('/orders/active')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
                            <ClipboardList size={20} />
                        </button>

                        <button onClick={() => navigate('/orders/history')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
                            <ClipboardCheck size={20} />
                        </button>

                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <User size={16} className="text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {user?.name?.split(' ')[0]}
                            </span>
                        </button>
                    </div>

                    {/* Mobile Right — Cart + Hamburger */}
                    <div className="flex sm:hidden items-center gap-2">
                        {/* Cart tetap visible di mobile */}
                        <button onClick={() => navigate('/cart')} className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
                            <ShoppingCart size={20} />
                            {activeOrderCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {activeOrderCount}
                                </span>
                            )}
                        </button>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="sm:hidden bg-white border-t border-gray-100 shadow-lg">
                    <div className="px-4 py-3 space-y-1">

                        {/* User Info */}
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                                <User size={18} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                        </div>

                        {/* Location Status */}
                        {showRefresh && (
                            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${
                                locationStatus === 'granted' ? 'bg-green-50'
                                : locationStatus === 'denied' ? 'bg-red-50'
                                : 'bg-gray-50'
                            }`}>
                                <div className={`flex items-center gap-2 text-sm font-medium ${
                                    locationStatus === 'granted' ? 'text-green-600'
                                    : locationStatus === 'denied' ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}>
                                    <MapPin size={16} />
                                    {locationStatus === 'granted' ? 'Showing food near you'
                                    : locationStatus === 'denied' ? 'Location access off'
                                    : 'Getting location...'}
                                </div>
                                <button
                                    onClick={() => { onRefresh?.(); setMenuOpen(false); }}
                                    disabled={isRefreshing}
                                    className="text-primary"
                                >
                                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        )}

                        {/* Menu Items */}
                        {[
                            { label: 'Active Orders', icon: <ClipboardList size={18} />, path: '/orders/active' },
                            { label: 'Order History', icon: <ClipboardCheck size={18} />, path: '/orders/history' },
                            { label: 'My Profile', icon: <User size={18} />, path: '/profile' },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="text-gray-400">{item.icon}</span>
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            </button>
                        ))}

                        {/* Logout */}
                        <button
                            onClick={() => { handleLogout(); setMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left mt-1 border-t border-gray-100 pt-3"
                        >
                            <span className="text-red-400">
                                <X size={18} />
                            </span>
                            <span className="text-sm font-medium text-red-500">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}