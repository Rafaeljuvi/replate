import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  LogOut, 
  Package, 
  CheckCircle, 
  ShoppingBag, 
  Clock,
  DollarSign,
  Star,
  Store,
  Users,
  ClipboardCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMerchantStore, getMerchantStoreStats } from '../services/api';
import type { Store as storeInfo, MerchantStats } from '../@types';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';
import StatsCard from '../components/merchant/StatsCard';


export default function MerchantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<storeInfo | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    fetchStore();
    fetchStats();
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

        {/* Quick Actions (Placeholder) */}
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