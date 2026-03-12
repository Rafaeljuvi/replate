import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, X, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getPublicProducts } from '../services/api';
import type { PublicProduct } from '../@types';
import CustomerProductCard from '../components/customer/CustomerProductCard';
import CustomerHeader from '../components/customer/CustomerHeader';

const CATEGORIES = ['All', 'Bread', 'Pastry', 'Cake', 'Cookies', 'Muffins', 'Croissants', 'Bagels', 'Tarts', 'Other'];

export default function CustomerHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<PublicProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userLat, setUserLat] = useState<number | undefined>();
    const [userLng, setUserLng] = useState<number | undefined>();
    const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'idle'>('idle');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchProducts = async (lat?: number, lng?: number) => {
        try {
            setIsLoading(true);
            const data = await getPublicProducts(lat, lng);
            setProducts(data);
            setFilteredProducts(data);
        } catch (error: any) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const getUserLocation = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('denied');
            fetchProducts();
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('User coords:', latitude, longitude);
                setUserLat(latitude);
                setUserLng(longitude);
                setLocationStatus('granted');
                fetchProducts(latitude, longitude);
            },
            () => {
                setLocationStatus('denied');
                fetchProducts();
                toast('Showing all products — location access granted', { icon: '📍' });
            }
        );
    };

    useEffect(() => { getUserLocation(); }, []);

    useEffect(() => {
        let result = [...products];
        if (searchQuery.trim()) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCategory !== 'All') {
            result = result.filter(p =>
                p.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
        setFilteredProducts(result);
    }, [searchQuery, selectedCategory, products]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchProducts(userLat, userLng);
        setIsRefreshing(false);
        toast.success('Products refreshed');
    };

    return (
        <div className="min-h-screen bg-secondary">
            {/* Header */}
            <CustomerHeader
            locationStatus={locationStatus}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            showRefresh={true}
            activeOrderCount={0}
            />
                    
            {/* Main */}
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* Search Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-secondary">Good food deserves a second chance</h2>
                            <p className="text-sm text-gray-400">Get quality bakery products at a discounted price before the store closes.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find bakes worth rescuing..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Quick Tags */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-gray-400">Popular:</span>
                        {['Roti', 'Kue', 'Croissant', 'Donut'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSearchQuery(tag)}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-primary hover:text-white text-gray-600 rounded-full transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
                        <div className="sticky top-24 flex flex-col gap-4">

                            <div className="bg-gradient-to-br from-primary to-green-400 rounded-2xl p-5 text-white overflow-hidden relative">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
                                <div className="absolute -bottom-6 -right-2 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
                                <div className="relative z-10">
                                    <h2 className="text-xl font-bold leading-tight mb-1">
                                        Hi, {user?.name?.split(' ')[0]}!
                                    </h2>
                                    <p className="text-green-100 text-xs mb-4">
                                        Ready to rescue some food today?
                                    </p>
                                    <div className="bg-white bg-opacity-20 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="text-green-100 flex-shrink-0" />
                                            <p className="text-green-100 text-xs">
                                                {locationStatus === 'granted'
                                                    ? 'Showing food within 2km'
                                                    : 'Showing all available food'
                                                }
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs"><Clock size={11}/></span>
                                            <p className="text-green-100 text-xs">Updated just now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => navigate('/orders/active')}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
                                    >
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-semibold text-gray-700">Ongoing Orders</p>
                                            <p className="text-xs text-gray-400">Track your active orders</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => navigate('/orders/history')}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
                                    >
                                        <div className="flex-1 text-left">
                                            <p className="text-sm font-semibold text-gray-700">Order History</p>
                                            <p className="text-xs text-gray-400">View past orders</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ===== MAIN CONTENT =====*/}
                    <div className="flex-1 min-w-0">

                        {/* Mobile Greeting */}
                        <div className="lg:hidden bg-gradient-to-r from-primary to-green-400 rounded-2xl p-5 text-white mb-6">
                            <h1 className="text-xl font-bold">Hi, {user?.name?.split(' ')[0]}!</h1>
                            <p className="text-green-100 text-sm mt-1">
                                {locationStatus === 'granted'
                                    ? 'Showing food within 2km of you'
                                    : 'Discover discounted food around you'
                                }
                            </p>
                        </div>

                        {/* Products Found + Category Filter */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="bg-white rounded-xl px-4 py-2 shadow-sm flex items-center gap-2 flex-shrink-0">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                <p className="text-sm font-medium text-gray-700">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                                    {locationStatus === 'granted' ? ' near you' : ''}
                                </p>
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                            selectedCategory === cat
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loading */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-gray-500 text-sm">
                                    {locationStatus === 'loading' ? 'Getting your location...' : 'Loading products...'}
                                </p>
                            </div>

                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    {searchQuery
                                        ? `No results for "${searchQuery}"`
                                        : locationStatus === 'granted'
                                        ? 'No food available within 2km of your location'
                                        : 'No products available right now'
                                    }
                                </p>
                                {(searchQuery || selectedCategory !== 'All') && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                        className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredProducts.map((product) => (
                                    <CustomerProductCard
                                        key={product.product_id}
                                        product={product}
                                        userLat={userLat}
                                        userLng={userLng}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}