import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, ShoppingCart, ClipboardList, ClipboardCheck } from 'lucide-react';
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

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* Left — Logo */}
                    <div onClick={() => navigate('/dashboard')} className="cursor-pointer">
                        <Logo size="medium" />
                    </div>

                    {/* Right — Icons + Profile */}
                    <div className="flex items-center gap-1">
                        {showRefresh && (
                            <div className="flex items-center gap-2 mr-1">
                                <button
                                    onClick={onRefresh}
                                    disabled={isRefreshing}
                                    title="Refresh"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-600"
                                >
                                    <RefreshCw size={22} className={isRefreshing ? 'animate-spin text-primary' : ''} />
                                </button>

                                <div className={`flex items-center gap-1.5 px-3 py-3 rounded-full text-xs font-medium ${
                                    locationStatus === 'granted' ? 'bg-green-50 text-green-600'
                                    : locationStatus === 'denied' ? 'bg-red-50 text-red-500'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                    <MapPin size={15} />
                                    {locationStatus === 'granted' ? 'Near You'
                                    : locationStatus === 'denied' ? 'Location Off'
                                    : locationStatus === 'loading' ? 'Getting location...'
                                    : ''}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        {/* Active Orders */}
                        <button
                            onClick={() => navigate('/orders/shopping-cart')}
                            title="Shopping Cart"
                            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <ShoppingCart size={22} />
                            {activeOrderCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {activeOrderCount}
                                </span>
                            )}
                        </button>

                        {/* Ongoing Orders */}
                        <button
                            onClick={() => navigate('/orders/ongoing_orders')}
                            title="Ongoing Orders"
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <ClipboardList size={22} />
                        </button>

                        {/* Order History */}
                        <button
                            onClick={() => navigate('/orders/history')}
                            title="Order History"
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <ClipboardCheck size={22} />
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>

                        {/* Profile */}
                        <button
                            onClick={handleLogout}
                            title={user?.name}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <svg viewBox="0 0 24 24" className="w- h-5 text-gray-500 fill-current">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user?.name?.split(' ')[0]}
                            </span>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}