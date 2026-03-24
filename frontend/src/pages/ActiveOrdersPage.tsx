import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Package, Store, Clock, ChevronRight,
    CreditCard, CheckCircle, XCircle, Loader, X, Tag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getMyOrders, cancelOrder, getOrderDetail } from "../services/api";
import type { Order, OrderItem } from "../@types";
import CustomerHeader from "../components/customer/CustomerHeader";

declare global {
    interface Window {snap: any;}
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ActiveOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [payingId, setPayingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<{order: Order; items: OrderItem[]} | null>(null)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

    const fetchOrders = async() => {
        try {
            setIsLoading(true);
            const [pending, confirmed, ready] = await Promise.all([
                getMyOrders('pending'),
                getMyOrders('confirmed'),
                getMyOrders('ready')
            ]);
            setOrders([...pending, ...confirmed, ...ready])
        } catch (error: any) {
            toast.error('Failed to load orers')
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
        }).format(amount);
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
                return { label: 'Waiting Confirmation', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12}/>}
            case 'confirmed':
                return { label: 'Being Prepared', color: 'bg-blue-100 text-blue-700', icon: <Loader size={12} className="animate-spin"/>}
            case 'ready':
                return { label: 'Ready for pick up', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12}/>}
            default:
                return { label: status, color: 'bg-gray-100 text-gray-600', icon: null}
        }
    }

    const handleCancelOrder = async () => {
        if (!cancelConfirmId) return;
        setCancellingId(cancelConfirmId);
        setCancelConfirmId(null)
        try {
            await cancelOrder(cancelConfirmId);
            toast.success('Order cancelled');
            await fetchOrders()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel order')
        } finally {
            setCancellingId(null)
        }
    }

    const handleCompletePayment = async (order: Order) => {
        if (!order.snap_token) {
            toast.error('Payment token not found');
            return;
        }
        if (!window.snap) {
            toast.error('Payment system not loaded');
            return;
        }

        setPayingId(order.order_id)

        window.snap.pay(order.snap_token, {
            onSuccess: (_result: any) => {
                toast.success('Payment succesful!')
                setPayingId(null);
                fetchOrders()
            },
            onPending: (_result: any) => {
                toast('Payment pending', {icon: '⏳'})
                setPayingId(null);
            },
            onError: (_result: any) => {
                toast.error('Payment failed');
                setPayingId(null);
            },
            onClose: () => {
                setPayingId(null);
            }
        })
    }

    const handleViewDetail = async (orderId: string) => {
        setIsLoadingDetail(true);
        try {
            const data = await getOrderDetail(orderId);
            setSelectedOrder(data);
        } catch (error: any) {
            toast.error('Failed to load order detail');
        } finally {
            setIsLoadingDetail(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary">
                <CustomerHeader/>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary">
            <CustomerHeader/>
            <div className="max-w-3xl mx-auto px-4 py-6">

                {/* Header card */}
                <div className="bg-white rounded-2xl px-6 py-4 shadow-sm mb-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package size={24} className="text-primary"/>
                            Active Orders
                        </p>
                        <p className="text-sm text-gray-500 ml-8">
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/orders/history')}
                        className="ml-auto flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                    >
                        History
                        <ChevronRight size={16}/>
                    </button>
                </div>

                {/* Empty Active orders */}
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Package size={40} className="text-gray-300"/>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">No active orders</p>
                        <p className="text-sm text-gray-400 mb-6">You don't have any ongoing orders right now</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                        >
                            Browse Food
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const badge = getStatusBadge(order.status);
                            const isPendingPayment = order.payment_method === 'online' &&
                                order.payment_status === 'unpaid' &&
                                order.status === 'pending' &&
                                order.snap_token;

                            return (
                                <div key={order.order_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                                   {/* Order Header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            {order.store_logo
                                                ? <img
                                                    src={order.store_logo.startsWith('http')
                                                        ? order.store_logo
                                                        : `${API_BASE_URL}${order.store_logo}`}
                                                    alt={order.store_name}
                                                    className="w-10 h-10 rounded-xl object-cover"
                                                />
                                                : <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                    <Store size={18} className="text-gray-400" />
                                                </div>
                                            }
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.store_name}</p>
                                                <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${badge.color}`}>
                                            {badge.icon}
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Order body */}
                                    <div className="px-5 py-4">
                                        <div className="flex justify-between text-sm mb-3">
                                            <span className="text-gray-500">
                                                {order.total_items} {Number(order.total_items) === 1 ? 'item' : 'items'}
                                            </span>
                                            <span className="font-bold text-primary">
                                                {formatCurrency(Number(order.total_price))}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                order.payment_status === 'paid'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-500'
                                            }`}>
                                                {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                            <span className="text-xs texg-gray-400">
                                                {order.payment_method === 'cash' ? 'Cash' : 'Online'}
                                            </span>
                                        </div>

                                        {/* Notes */}
                                        {order.notes && (
                                            <p className="text-xs text-gray-400 mt-2 italic">
                                                Note: {order.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="px-5 pb-4 flex gap-2">

                                        {isPendingPayment && (
                                            <button
                                                onClick={() => handleCompletePayment(order)}
                                                disabled={payingId === order.order_id}
                                                className="flex-1 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {payingId === order.order_id
                                                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Loading...</>
                                                    : <><CreditCard size={16}/> Complete Payment</>
                                                }
                                            </button>
                                        )}

                                        {/* View Detail */}
                                        <button
                                            onClick={() => handleViewDetail(order.order_id)}
                                            disabled={isLoadingDetail}
                                            className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isLoadingDetail
                                                ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                                : <>View Detail <ChevronRight size={14}/></>
                                            }
                                        </button>

                                        {/* Cancel Button */}
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => setCancelConfirmId(order.order_id)}
                                                disabled={cancellingId === order.order_id}
                                                className="py-2 px-4 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center"
                                            >
                                                {cancellingId === order.order_id
                                                    ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                    : <XCircle size={16} />
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <p className="font-bold text-gray-900">Order Detail</p>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-500"/>
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">

                            {/* Store info */}
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                {selectedOrder.order.store_logo
                                    ? <img
                                        src={selectedOrder.order.store_logo.startsWith('http')
                                            ? selectedOrder.order.store_logo
                                            : `${API_BASE_URL}${selectedOrder.order.store_logo}`}
                                        alt={selectedOrder.order.store_logo}
                                        className="w-12 h-12 rounded-xl object-cover"
                                    />
                                    : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <Store size={20} className="text-gray-400"/>
                                    </div>
                                }
                                <div>
                                    <p className="font-bold text-gray-900">{selectedOrder.order.store_name}</p>
                                    <p className="text-xs text-gray-400">{selectedOrder.order.address}</p>
                                </div>
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

                            {/* Order Date */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Order Date</span>
                                <span className="text-sm text-gray-700">{formatDate(selectedOrder.order.created_at)}</span>
                            </div>

                            {/* Notes */}
                            {selectedOrder.order.notes && (
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700">{selectedOrder.order.notes}</p>
                                </div>
                            )}

                            {/* Items Orders */}
                            <div>
                                <p className="text-sm font-bold text-gray-700 mb-3">Items Ordered</p>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item: any) => (
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
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-5">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-3 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {cancelConfirmId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                            Cancel Order?
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelConfirmId(null)}
                                className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}