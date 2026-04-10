import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  Package, 
  CheckCircle, 
  ShoppingBag, 
  Clock,
  DollarSign,
  Star,
  Store,
  Users,
  ClipboardCheck,
  TrendingUp, 
  Calendar,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMerchantStore, getMerchantStoreStats, getDailyStats, getTopSellingProducts } from '../services/api';
import type { Store as storeInfo, MerchantStats, DailyStats, TopSellingProducts } from '../@types';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';
import StatsCard from '../components/merchant/StatsCard';


export default function MerchantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<storeInfo | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProducts | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]) 
  const [topProductsPeriod, setTopProductsPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  const fetchStore = async () => {
    try {
      setIsLoadingStore(true);
      const data = await getMerchantStore();
      setStore(data);
    } catch (error: any) {
      console.error('Error fetching store:', error);
      toast.error('Failed to load store info');
    } finally {
      setIsLoadingStore(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await getMerchantStoreStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStore(), fetchStats()]);
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const fetchDailyStats = async (date: string) => {
    setIsLoadingDaily(true);
    try {
      const data = await getDailyStats(date);
      setDailyStats(data);
    } catch (error) {
      toast.error('Failed to load daily stats')
    } finally {
      setIsLoadingDaily(false);
    }
  }

  const fetchTopProducts = async(period: 'weekly' | 'monthly') => {
    setIsLoadingTop(true);
    try {
      const data = await getTopSellingProducts(period);
      setTopProducts(data);
    } catch (error) {
      toast.error('Failed to load top products')
    } finally {
      setIsLoadingTop(false);
    }
  }
    
  useEffect(() => {
    fetchStore();
    fetchStats();
    fetchDailyStats(selectedDate);
    fetchTopProducts(topProductsPeriod);
  }, []);

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatRating = (rating: number | string | undefined) => {
    const numRating = Number(rating) || 0;
    return numRating.toFixed(1);
  };

  // =============================================
  // LOADING STATE
  // =============================================

  if (isLoadingStore || isLoadingStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      
      {/* ==================== HEADER ==================== */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            
            {/* Left: Logo */}
            <div>
              <Logo size="small"/>
            </div>

            {/* Center: Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Merchant Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>

            {/* Right: Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="small"
                leftIcon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Store Info Section */}
        {store && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className='flex items-start gap-4'>

                <div className='w-16 h-16 rounded-full border=2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0'>
                  {store.logo_url 
                    ? <img
                        src={`${API_BASE_URL}${store.logo_url}`}
                        alt='Store logo'
                        className='w-full h-full object-cover'
                        />
                      : <Store size={28} className='text-gray-400'/>}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {store.store_name}
                  </h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold text-gray-900">
                      {formatRating(store.average_rating || 0)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({store.total_ratings || 0} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    📍 {store.address}, {store.city}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    📞 {store.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    🕒 {store.operating_hours}
                  </p>
                </div>
              </div>
             

              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                store.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {store.is_active ? ' Active' : ' Inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mb-6">
          <p className="text-lg font-bold text-white mb-4">Statistics Overview</p>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Total Products */}
              <StatsCard
                title="Total Products"
                value={stats.total_products}
                icon={<Package size={24} />}
                color="blue"
                subtitle="All products"
              />

              {/* Active Products */}
              <StatsCard
                title="Active Products"
                value={stats.active_products}
                icon={<CheckCircle size={24} />}
                color="green"
                subtitle="Available for sale"
              />

              {/* Total Orders */}
              <StatsCard
                title="Total Orders"
                value={stats.total_orders}
                icon={<ShoppingBag size={24} />}
                color="purple"
                subtitle="All time"
              />

              {/* Pending Orders */}
              <StatsCard
                title="Pending Orders"
                value={stats.pending_orders}
                icon={<Clock size={24} />}
                color="yellow"
                subtitle="Awaiting action"
              />

              {/* Completed Orders */}
              <StatsCard
                title="Completed Orders"
                value={stats.completed_orders}
                icon={<ClipboardCheck size={24} />}
                color="green"
                subtitle="Successfully fulfilled"
              />

              {/* Total Revenue */}
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats.total_revenue)}
                icon={<DollarSign size={24} />}
                color="green"
                subtitle="All time earnings"
              />

              {/* Average Rating */}
              <StatsCard
                title="Average Rating"
                value={formatRating(stats.average_rating)}
                icon={<Star size={24} />}
                color="yellow"
                subtitle="Out of 5.0"
              />

              {/* Total Ratings */}
              <StatsCard
                title="Total Reviews"
                value={stats.total_ratings}
                icon={<Users size={24} />}
                color="blue"
                subtitle="Customer reviews"
              />
            </div>
          )}
        </div>

        {/* Daily Stats Section */}
        <div className='bg-white rounded-2xl p-6 shadow-sm mb-6'>
          <div className='flex items-center justify-between mb-5'>
            <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
              <Calendar size={20} className='text-primary'/>
              Daily Statistics
            </h2>
            <input 
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchDailyStats(e.target.value);
              }}
              className='px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary'
             />
          </div>

          {isLoadingDaily ? (
            <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : (
            <div className='grid grid-cols-3 gap-4'>
              <div className='bg-blue-50 rounded-xl p-4 border border-blue-100'>
                <div className='w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3'>
                  <ShoppingBag size={18} className='text-blue-600'/>
                </div>
                <p className='text-xs text-blue-600 font-medium'>Orders</p>
                <p className='text-2xl font-bold text-blue-700 mt-1'>
                  {dailyStats?.total_orders || 0}
                </p>
                <p className='text-xs text-blue-400 mt-0.5'>Completed today</p>
              </div>

              <div className='bg-purple-50 rounded-xl p-4 border border-purple-100'>
                <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3'>
                  <Tag size={18} className='text-purple-600'/>
                </div>
                <p className='text-xs text-purple-600 font-medium'>Items Sold</p>
                <p className='text-2xl font-bold text-purple-700 mt-1'>
                  {dailyStats?.total_items_sold || 0}
                </p>
                <p className='text-xs text-purple-400 mt-0.5'>Units sold today</p>
              </div>

              <div className='bg-green-50 rounded-xl p-4 border border-green-100'>
                <div className='w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3'>
                  <TrendingUp size={18} className='text-green-600'/>
                </div>
                <p className='text-xs text-green-600 font-medium'>Revenue</p>
                <p className='text-xl font-bold text-green-700 mt-1'>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(Number(dailyStats?.total_revenue || 0))}
                </p>
                <p className='text-xs text-green-400 mt-0.5'>Earned today</p>
              </div>
            </div>
          )}
        </div>

        {/* Top selling products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Top Selling Products
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setTopProductsPeriod('weekly');
                            fetchTopProducts('weekly');
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            topProductsPeriod === 'weekly'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => {
                            setTopProductsPeriod('monthly');
                            fetchTopProducts('monthly');
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                            topProductsPeriod === 'monthly'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {isLoadingTop ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : !topProducts?.products.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <TrendingUp size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">No sales data yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {topProductsPeriod === 'weekly' ? 'This week' : 'This month'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {topProducts.products.map((product, index) => (
                        <div key={product.product_id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            {/* Rank */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                index === 2 ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-50 text-gray-400'
                            }`}>
                                {index + 1}
                            </div>

                            {/* Image */}
                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                {product.image_url
                                    ? <img
                                        src={product.image_url.startsWith('http')
                                            ? product.image_url
                                            : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${product.image_url}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    : <div className="w-full h-full flex items-center justify-center">
                                        <Tag size={16} className="text-gray-300" />
                                      </div>
                                }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {product.total_sold} units sold
                                </p>
                            </div>

                            {/* Revenue */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-primary">
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0
                                    }).format(Number(product.total_revenue))}
                                </p>
                                <p className="text-xs text-gray-400">{product.total_orders} orders</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary" fullWidth onClick={() => navigate('/merchant/products')}>
              Manage Products
            </Button>
            <Button variant="primary" fullWidth onClick={() => navigate('/merchant/orders')}>
              View Orders
            </Button>
            <Button variant="primary" fullWidth onClick={() => navigate('/merchant/settings')}>
              Store Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}