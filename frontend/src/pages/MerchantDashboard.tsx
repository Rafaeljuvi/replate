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
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMerchantStore, getMerchantStoreStats } from '../services/api';
import type { Store, MerchantStats } from '../@types';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';
import StatsCard from '../components/merchant/StatsCard';

export default function MerchantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // =============================================
  // FETCH FUNCTIONS
  // =============================================

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

  // =============================================
  // EFFECTS
  // =============================================

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

  // =============================================
  // MAIN RENDER
  // =============================================

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ==================== HEADER ==================== */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 items-center gap-4">
            
            {/* Left: Logo */}
            <div>
              <Logo size="small" />
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

              <Button
                variant="secondary"
                size="small"
                leftIcon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
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

              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                store.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {store.is_active ? '✅ Active' : '⏸️ Inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics Overview</h3>
          
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
                icon={<CheckCircle size={24} />}
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
            <Button variant="primary" fullWidth disabled>
              📦 Manage Products
            </Button>
            <Button variant="primary" fullWidth disabled>
              🛒 View Orders
            </Button>
            <Button variant="primary" fullWidth disabled>
              ⚙️ Store Settings
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Coming soon! These features will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
}
// export default function MerchantDashboard() {
//     return (
//       // <div className="min-h-screen bg-gray-50">
//       //   <div className="max-w-7xl mx-auto px-4 py-8">
//       //     <h1 className="text-3xl font-bold text-gray-800 mb-2">Merchant Dashboard</h1>
//       //     <p className="text-gray-600">Placeholder - Will be built in Phase 2.8.4</p>
//       //     <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//       //       <p className="text-sm text-yellow-800">
//       //         ✅ Protected Route - Only accessible by merchants (role: 'merchant')
//       //       </p>
//       //       <p className="text-sm text-yellow-800 mt-1">
//       //         ⚠️ Requires approval_status = 'approved'
//       //       </p>
//       //     </div>
//       //   </div>
//       // </div>
//     );
//   }