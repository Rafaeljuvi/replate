import { useState, useEffect } from "react";
import { Users, Store, CheckCircle, Clock, XCircle, RefreshCw, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getPendingStores,
  approveStore as approveStoreAPI,
  rejectStore as rejectStoreAPI
} from '../services/api';
import StatsCard from "../components/admin/StatsCards";
import PendingStoreCard from '../components/admin/PendingStoreCard';
import DocumentViewerModal from "../components/admin/DocumentView";
import ApprovalModal from '../components/admin/ApprovalModal';
import RejectionModal from '../components/admin/RejectionModal';
import Button from '../components/ui/Button';
import Logo from "../components/layout/Logo";

interface Stats {
  total_customers: number;
  total_merchants: number;
  total_stores: number;
  pending_stores: number;
  approved_stores: number;
  rejected_stores: number;
}

interface PendingStores {
  store_id: string;
  store_name: string;
  description?: string;
  address: string;
  city: string;
  phone: string;
  operating_hours: string;
  qris_image_url?: string;
  id_card_image_url?: string;
  bank_account_number?: string;
  created_at: string;
  merchant_name: string;
  merchant_email: string;
  merchant_phone: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingStores, setPendingStores] = useState<PendingStores[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const navigate = useNavigate();

  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    store: PendingStores | null;
  }>({ isOpen: false, store: null });

  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    storeId: string;
    storeName: string;
    merchantName: string;
  }>({ isOpen: false, storeId: '', storeName: '', merchantName: '' });

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    storeId: string;
    storeName: string;
    merchantName: string;
  }>({ isOpen: false, storeId: '', storeName: '', merchantName: '' });

  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchPendingStores = async () => {
    try {
      setIsLoadingStores(true);
      const data = await getPendingStores();
      
      // Pastikan data adalah array
      if (Array.isArray(data)) {
        setPendingStores(data);
      } else if (data && Array.isArray(data.stores)) {
        setPendingStores(data.stores);
      } else {
        setPendingStores([]);
        console.error('Invalid pending stores format:', data);
      }
    } catch (error: any) {
      console.error('Error fetching pending stores:', error);
      toast.error('Failed to load pending stores');
      setPendingStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingStores();
  }, []);

  const handleRefresh = () => {
    fetchStats();
    fetchPendingStores();
    toast.success('Data refreshed');
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await approveStoreAPI(approvalModal.storeId);
      toast.success(`${approvalModal.storeName} approved successfully!`);
      setApprovalModal({ isOpen: false, storeId: '', storeName: '', merchantName: '' });

      await fetchStats();
      await fetchPendingStores();
    } catch (error: any) {
      console.error('Error approving store:', error);
      toast.error(error.response?.data?.message || 'Failed to approve store');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setIsProcessing(true);
      await rejectStoreAPI(rejectionModal.storeId, reason);
      toast.success(`${rejectionModal.storeName} rejected`);
      setRejectionModal({ isOpen: false, storeId: '', storeName: '', merchantName: '' });

      await fetchStats();
      await fetchPendingStores();
    } catch (error: any) {
      console.error('Error rejecting store:', error);
      toast.error(error.response?.data?.message || 'Failed to reject store');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="justify-self-start">
              <Logo size="medium" />
            </div>

            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
    
            <div className="flex gap-3 justify-self-end">
              <Button
                variant="outline"
                leftIcon={<RefreshCw size={18} />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              
              <Button
                variant="secondary"
                leftIcon={<LogOut size={18} />}
                onClick={handleLogout}
                className="border-2 border-red-500 bg-white text-red-500 hover:bg-red-500 disabled:bg-white hover:text-white disabled:text-red-500"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Platform Statistics
          </h2>

          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard
                title="Total Customers"
                value={stats.total_customers}
                icon={Users}
                color="blue"
                subtitle="Registered users"
              />
              <StatsCard
                title="Total Merchants"
                value={stats.total_merchants}
                icon={Store}
                color="purple"
                subtitle="All merchant accounts"
              />
              <StatsCard
                title="Total Stores"
                value={stats.total_stores}
                icon={Store}
                color="green"
                subtitle="All registered stores"
              />
              <StatsCard
                title="Pending Approval"
                value={stats.pending_stores}
                icon={Clock}
                color="yellow"
                subtitle="Awaiting review"
              />
              <StatsCard
                title="Approved Stores"
                value={stats.approved_stores}
                icon={CheckCircle}
                color="green"
                subtitle="Active on platform"
              />
              <StatsCard
                title="Rejected"
                value={stats.rejected_stores}
                icon={XCircle}
                color="red"
                subtitle="Applications declined"
              />
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Pending Store Applications
            </h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
              {pendingStores.length} pending
            </span>
          </div>

          {isLoadingStores ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pendingStores.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600">
                There are no pending store applications at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingStores.map((store) => (
                <PendingStoreCard
                  key={store.store_id}
                  store={store}
                  onApprove={(storeId) => {
                    const selectedStore = pendingStores.find(s => s.store_id === storeId);
                    if (selectedStore) {
                      setApprovalModal({
                        isOpen: true,
                        storeId,
                        storeName: selectedStore.store_name,
                        merchantName: selectedStore.merchant_name
                      });
                    }
                  }}
                  onReject={(storeId) => {
                    const selectedStore = pendingStores.find(s => s.store_id === storeId);
                    if (selectedStore) {
                      setRejectionModal({
                        isOpen: true,
                        storeId,
                        storeName: selectedStore.store_name,
                        merchantName: selectedStore.merchant_name
                      });
                    }
                  }}
                  onViewDocuments={(store) => {
                    setDocumentModal({ isOpen: true, store });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentViewerModal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal({ isOpen: false, store: null })}
        storeName={documentModal.store?.store_name || ''}
        qrisImageUrl={documentModal.store?.qris_image_url}
        idCardImageUrl={documentModal.store?.id_card_image_url}
      />

      <ApprovalModal
        isOpen={approvalModal.isOpen}
        onClose={() => setApprovalModal({ isOpen: false, storeId: '', storeName: '', merchantName: '' })}
        onConfirm={handleApprove}
        storeName={approvalModal.storeName}
        merchantName={approvalModal.merchantName}
        isLoading={isProcessing}
      />

      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, storeId: '', storeName: '', merchantName: '' })}
        onConfirm={handleReject}
        storeName={rejectionModal.storeName}
        merchantName={rejectionModal.merchantName}
        isLoading={isProcessing}
      />
    </div>
  );
}