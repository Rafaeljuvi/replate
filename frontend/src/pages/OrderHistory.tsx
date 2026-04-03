import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Store, CheckCircle, XCircle, ChevronRight, Tag, X, Star } from "lucide-react";
import toast from 'react-hot-toast'
import { getMyOrders, getOrderDetail, createReview, checkOrderReview } from "../services/api";
import type { Order, OrderItem} from "../@types";
import CustomerHeader from "../components/customer/CustomerHeader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<{order: Order; items: OrderItem[]} | null> (null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'completed'| 'cancelled'>('all')
    const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewedOrders, setReviewedOrders] = useState<Set<String>>(new Set());
    const [hoveredStar, sethoveredStar] = useState(0);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const [completed, cancelled] = await Promise.all([
                getMyOrders('completed'),
                getMyOrders('cancelled')
            ])
            const allOrders = [...completed, ...cancelled];
            setOrders(allOrders);

            //Chwck which orders hasn't been reviewed
            const reviewChecks = await Promise.all(
                completed.map(order => checkOrderReview(order.order_id))
            );

            const reviewed = new Set<string>();
            completed.forEach((order, index) => {
                if (reviewChecks[index].hasReview) {
                    reviewed.add(order.order_id);
                }
            })
            setReviewedOrders(reviewed);

        } catch (error: any) {
            toast.error('Failed to load order history')
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
        return Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    }

    const handleViewDetail = async (orderId: string) => {
        setIsLoadingDetail(true);
        try {
            const data = await getOrderDetail(orderId);
            setSelectedOrder(data);
        } catch (error: any) {
            toast.error('Failed to load order detail')
        } finally {
            setIsLoadingDetail(false)
        }
    }

    const handleSubmitReview = async () => {
        if (!reviewingOrder) return;
        if (reviewRating === 0) {
            toast.error('Please provide a rating');
            return;
        }

        setIsSubmittingReview(true);
        try {
            await createReview(reviewingOrder.order_id, reviewRating, reviewComment || undefined)
            toast.success('Review submitted');
            setReviewedOrders(prev => new Set(prev).add(reviewingOrder.order_id));
            setReviewingOrder(null);
            setReviewRating(0);
            setReviewComment('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review')
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'all') return true;
        return order.status === activeFilter
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary">
                <CustomerHeader/>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary">
            <CustomerHeader/>
            <div className="max-w-3xl mx-auto px-4 py-6">

                {/* Header Card */}
                <div className="bg-white rounded-2xl px-6 py-4 shadow-sm mb-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/orders/active')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package size={24} className="text-primary"/>
                            Order History
                        </p>
                        <p className="text-sm text-gray-500 ml-8">
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                        </p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-4">
                    {(['all', 'completed', 'cancelled'] as const).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${
                                activeFilter === filter
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {filter === 'all' ? `All (${orders.length})`
                                : filter === 'completed' ? `Completed(${orders.filter(o => o.status === 'completed'). length})`  
                                : `Cancelled (${orders.filter(o => o.status === 'cancelled').length})`  
                        }
                        </button>
                    ))}
                </div>

                {/* Empty State */}
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Package size={40} className="text-gray-300"/>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">No orders yet</p>
                        <p className="text-sm text-gray-400 mb-6">Your order history will appear here</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                        >
                            Browse food
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
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
                                                <Store size={18} className="text-gray-400"/>
                                            </div>
                                        }
                                        <div>
                                            <p className="font-semibold text-gray-900">{order.store_name}</p>
                                            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                                        order.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {order.status === 'completed'
                                            ? <><CheckCircle size={12}/> Completed</>
                                            : <><XCircle size={12}/> Cancelled</>
                                        }
                                    </span>
                                </div>

                                {/* Order Body */}
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
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                            order.payment_status === 'paid'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-500' 
                                        }`}>
                                            {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {order.payment_method === 'cash' ? 'Cash' : 'Online'}
                                        </span>
                                    </div>

                                    {order.notes && (
                                        <p className="text-xs text-gray-400 mt-2 italic">
                                            Note: {order.notes}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="px-5 pb-4">
                                    <button
                                        onClick={() => handleViewDetail(order.order_id)}
                                        disabled={isLoadingDetail}
                                        className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoadingDetail
                                            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                            : <>View Detail <ChevronRight size={14}/></>
                                        }
                                    </button>

                                    {/* Write review */}
                                    {order.status === 'completed' && (
                                        reviewedOrders.has(order.order_id)
                                            ? <div className="w-full py-2.5 bg-green-50 text-green-600 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-green-100 mt-2">
                                                <Star size={14} className="fill-green-500 text-green-500"/>
                                                Reviewed
                                            </div>
                                            : <button
                                                onClick={() => {
                                                    setReviewingOrder(order);
                                                    setReviewRating(0);
                                                    setReviewComment('');
                                                }}
                                                className="w-full py-2.5 bg-yellow-50 text-yellow-600 text-sm font-semibold rounded-xl hover:bg-yellow-100 transition-colors flex items-center justify-center gap-2  mt-2"
                                            >
                                                <Star size={14}/>
                                                Write Review
                                            </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <h3 className="font-bold text-gray-900">Order Detail</h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">

                            {/* Store */}
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                {selectedOrder.order.store_logo
                                    ? <img
                                        src={selectedOrder.order.store_logo.startsWith('http')
                                            ? selectedOrder.order.store_logo
                                            : `${API_BASE_URL}${selectedOrder.order.store_logo}`}
                                        alt={selectedOrder.order.store_name}
                                        className="w-12 h-12 rounded-xl object-cover"
                                      />
                                    : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <Store size={20} className="text-gray-400" />
                                      </div>
                                }
                                <div>
                                    <p className="font-bold text-gray-900">{selectedOrder.order.store_name}</p>
                                    <p className="text-xs text-gray-400">{selectedOrder.order.address}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                    selectedOrder.order.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                }`}>
                                    {selectedOrder.order.status === 'completed' ? 'Completed' : 'Cancelled'}
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
                                            : 'bg-gray-100 text-gray-500'
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
                                <div className="bg-gray-50 rounded-xl px-4 py-3">
                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700">{selectedOrder.order.notes}</p>
                                </div>
                            )}

                            {/* Items */}
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

                        <div className="px-6 pb-5">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Write a Review</h3>
                            <button
                                onClick={() => {
                                    setReviewingOrder(null);
                                    setReviewRating(0);
                                    setReviewComment('');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">

                            {/* Store Name */}
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Reviewing</p>
                                <p className="font-bold text-gray-900">{reviewingOrder.store_name}</p>
                            </div>

                            {/* Star Rating */}
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-2 text-center">
                                    Your Rating <span className="text-red-400">*</span>
                                </p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => sethoveredStar(star)}
                                            onMouseLeave={() => sethoveredStar(0)}
                                            onClick={() => setReviewRating(star)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-colors ${
                                                    star <= (hoveredStar || reviewRating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {reviewRating > 0 && (
                                    <p className="text-center text-sm font-semibold mt-2 text-yellow-500">
                                        {reviewRating === 1 ? 'Poor' :
                                        reviewRating === 2 ? 'Fair' :
                                        reviewRating === 3 ? 'Good' :
                                        reviewRating === 4 ? 'Very Good' : 'Excellent!'}
                                    </p>
                                )}
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium mb-1 block">
                                    Comment <span className="text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Share your experience..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setReviewingOrder(null);
                                        setReviewRating(0);
                                        setReviewComment('');
                                    }}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={reviewRating === 0 || isSubmittingReview}
                                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingReview
                                        ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        : 'Submit Review'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )  
}