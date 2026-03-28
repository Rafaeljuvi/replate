import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Package, Clock, CheckCircle, XCircle, ChevronRight, Tag, X, Loader, Phone, User, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getStoreOrders, updateOrderStatus, getStoreOrderDetail } from "../services/api";
import type { Order, OrderItem } from "../@types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

export default function ManageOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'>('all')
    const [selectedOrder, setSelectedOrder] = useState<{order: Order; items: OrderItem[]} | null>(null)
    const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [cancelConfirmOrder, setCancelConfirmOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await getStoreOrders();
            setOrders(data)
        } catch (error: any) {
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {fetchOrders(); }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString))
    }

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> };
            case 'confirmed':
                return { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: <Loader size={12} className="animate-spin" /> };
            case 'ready':
                return { label: 'Ready', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> };
            case 'completed':
                return { label: 'Completed', color: 'bg-gray-100 text-gray-600', icon: <CheckCircle size={12} /> };
            case 'cancelled':
                return { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: <XCircle size={12} /> };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-600', icon: null };
        }
    };

    const getNextStatus = (currentStatus: Order['status']): string | null => {
        const flow: Record<string, string> = {
            'pending': 'confirmed',
            'confirmed': 'ready',
            'ready': 'completed'
        };
        return flow[currentStatus] || null;
    }

    const getNextStatusLabel = (currentStatus: Order['status']): string => {
        const labels: Record<string, string> = {
            'pending': 'confirm Order',
            'confirmed': 'Mark as Ready',
            'ready': 'Completed Order'
        }
        return labels[currentStatus] || ''
    }

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId)
        try {
            await updateOrderStatus(orderId, newStatus)
            toast.success(`Order ${newStatus}!`);
            await fetchOrders();
            if (selectedOrder?.order.order_id === orderId) {
                setSelectedOrder(null)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update order');
        } finally {
            setUpdatingId(null)
        }
    }

    const handleCancelConfirm = async () => {
        if(!cancelConfirmOrder) return;
        await handleUpdateStatus(cancelConfirmOrder.order_id, 'cancelled')
        setCancelConfirmOrder(null)
    };

    const handleViewDetail = async (orderId: string) => {
        setLoadingDetailId(orderId);
        try {
            const data = await getStoreOrderDetail(orderId)
            setSelectedOrder(data);
        } catch (error: any) {
            toast.error('Failed to load order detail')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredOrders = orders.filter(order => {
        if(activeFilter === 'all') return true;
        return order.status === activeFilter;
    })

    const getFilterCount = (status: string) => {
        if(status === 'all') return orders.length;
        return orders.filter(o => o.status === status).length
    }

    if(isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <div className="max-w-6xl mx-auto px-4 py-6">
                
                {/* Header Card */}
                <div className="bg-white rounded-2xl px-6 py-6 shadow-sm mb-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/merchant/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package size={24} className="text-primary"/>
                            Manage Orders
                        </p>
                        <p className="text-sm text-gray-500 ml-8">
                            {orders.length} total orders
                        </p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
                    >
                        <RefreshCw size={15}/>
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 mb-6 gap-4">
                    {[
                         { status: 'pending', label: 'Pending', color: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
                         { status: 'confirmed', label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border border-blue-100' },
                         { status: 'ready', label: 'Ready', color: 'bg-green-50 text-green-700 border border-green-100' },
                         { status: 'completed', label: 'Completed', color: 'bg-gray-50 text-gray-700 border border-gray-200' },
                    ].map((stat) => (
                        <div key={stat.status} className={`rounded-xl p-4 ${stat.color}`}>
                            <p className="text-2xl font-bold">{getFilterCount(stat.status)}</p>
                            <p className="text-xs font-medium mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {(['all', 'pending','confirmed', 'cancelled'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                activeFilter === filter
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {filter === 'all' ? `All (${getFilterCount('all')})` : `${filter} (${getFilterCount(filter)})`}
                        </button>
                    ))}
                </div>

                {/* Empty State */}
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bgwhite rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Package size={40} className="text-gray-300"/>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">No orders found</p>
                        <p className="text-sm text-gray-400">
                            {activeFilter === 'all' ? 'No orders yet' : `No${activeFilter} orders`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const badge = getStatusBadge(order.status)
                            const nextStatus = getNextStatus(order.status);
                            const nextLabel = getNextStatusLabel(order.status);
                            const canCancel = order.status === 'pending' || order.status === 'confirmed'

                            return (
                                <div key={order.order_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                                    {/* Order header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary bg-opacity-10 flex items-center justify-center">
                                                <Package size={18} className="text-primary"/>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    #{order.order_id.slice(0, 8).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${badge.color}`}>
                                            {badge.icon}
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Customer info */}
                                    <div className="px-5 pt-4 pb-2 flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400"/>
                                            <span className="text-sm text-gray-700 font-medium">{order.customer_name}</span>
                                        </div>
                                        {order.customer_phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400"/>
                                                <span className="text-sm text-gray-500">{order.customer_phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Body */}
                                    <div className="px-5 py-3">
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="text-gray-500">
                                                {order.total_items} {Number(order.total_items) === 1 ? 'item' : 'items'}
                                            </span>
                                            <span className="font-bold text-primary">
                                                {formatCurrency(Number(order.total_price))}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                order.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-500'
                                            }`}>
                                                {order.payment_status === 'paid' ? ' Paid' : 'Unpaid'}
                                            </span>
                                            <span className="text-xs text-gray-400 capitalize">
                                                {order.payment_method === 'cash' ? 'Cash' : 'Online'}
                                            </span>
                                        </div>

                                        {order.notes && (
                                            <div className="mt-3 bg-yellow-50 rounded-xl px-3 py-2">
                                                <p className="text-xs text-yellow-700">
                                                    {order.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="px-5 pb-4 flex gap-2">
                                        {nextStatus && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.order_id, nextStatus)}
                                                disabled={updatingId === order.order_id}
                                                className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {updatingId === order.order_id
                                                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white">Updating...</div></>
                                                    : <><CheckCircle size={16}/> {nextLabel}</>
                                                }
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleViewDetail(order.order_id)}
                                            disabled={loadingDetailId === order.order_id}
                                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loadingDetailId === order.order_id
                                                ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                                : <>Detail <ChevronRight size={14}/></>
                                            }
                                        </button>

                                        {canCancel && (
                                            <button
                                                onClick={() => setCancelConfirmOrder(order)}
                                                disabled={updatingId === order.order_id}
                                                className="py-2.5 px-4 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center"
                                            >
                                                <XCircle size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Order detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <p className="font-bold text-gray-900">
                                Order #{selectedOrder.order.order_id.slice(0, 8).toUpperCase()}
                            </p>
                            <button
                                onClick={() => {setSelectedOrder(null); 
                                                setLoadingDetailId(null)}}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-500"/>
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            {/* Customer */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-bold text-gray-500 tracking-wide">Customer</p>
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-gray-400"/>
                                    <p className="text-sm font-semibold text-gray-900">{selectedOrder.order.customer_name}</p>
                                </div>
                                {selectedOrder.order.customer_phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400"/>
                                        <p className="text-sm text-gray-600">{selectedOrder.order.customer_phone}</p>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusBadge(selectedOrder.order.status).color}`}>
                                    {getStatusBadge(selectedOrder.order.status).icon}
                                    {getStatusBadge(selectedOrder.order.status).label}
                                </span>
                            </div>

                            {/* Payment */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Payment</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">
                                        {selectedOrder.order.payment_method === 'cash' ? 'Cash' : 'Online'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        selectedOrder.order.payment_status === 'paid'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-500'
                                    }`}>
                                        {selectedOrder.order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Order Date</span>
                                <span className="text-sm text-gray-700">{formatDate(selectedOrder.order.created_at)}</span>
                            </div>

                            {/* Notes */}
                            {selectedOrder.order.notes && (
                                <div className="bg-yellow-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-yellow-600 font-semibold mb-1">Notes from customer</p>
                                    <p className="text-sm text-yellow-800">{selectedOrder.order.notes}</p>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-3">Items Ordered</p>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.order_item_id} className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                {item.image_url
                                                    ? <img
                                                        src={item.image_url.startsWith('http')
                                                            ? item.image_url
                                                            : `${API_BASE_URL}${item.image_url}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                      />
                                                    : <div className="w-full h-full flex items-center justify-center">
                                                        <Tag size={16} className="text-gray-300" />
                                                      </div>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {formatCurrency(item.price_at_time)} x {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                                                {formatCurrency(item.subtotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-100 pt-3 flex justify-between">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-primary text-lg">
                                    {formatCurrency(Number(selectedOrder.order.total_price))}
                                </span>
                            </div>
                            
                            {/* Update Status dari modal */}
                            {getNextStatus(selectedOrder.order.status) && (
                                <button
                                    onClick={() => handleUpdateStatus(
                                        selectedOrder.order.order_id,
                                        getNextStatus(selectedOrder.order.status)!
                                    )}
                                    disabled={updatingId === selectedOrder.order.order_id}
                                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    {updatingId === selectedOrder.order.order_id
                                        ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Updating...</>
                                        : <><CheckCircle size={16} /> {getNextStatusLabel(selectedOrder.order.status)}</>
                                    }
                                </button>
                            )}

                            {(selectedOrder.order.status === 'pending' || selectedOrder.order.status === 'confirmed') && (
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null)
                                        setCancelConfirmOrder(selectedOrder.order)
                                    }}
                                    className="w-full py-3 border border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16}/>
                                    Cancel Order
                                </button>
                            )}
                        </div>

                        <div className="px-6 pb-5">
                            <button
                                onClick={() => {setSelectedOrder(null);
                                                 setLoadingDetailId(null);}}
                                
                                className="w-full py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel confirmation modal */}
            {cancelConfirmOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-whote rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={24} className="text-red-500"/>
                        </div>
                        <p className="text-lg font-bold text-gray-900 text-center mb-2">
                            Cancel Order?
                        </p>
                        <p className="text-sm text-gray-500 text-center mb-2">
                            Order #{cancelConfirmOrder.order_id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Stock will be returned automatically. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelConfirmOrder(null)}
                                className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Keep order
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={updatingId === cancelConfirmOrder.order_id}
                                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                            >
                                {updatingId === cancelConfirmOrder.order_id
                                    ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    : 'Cancel Order'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
