import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, ShoppingBag, Store, CreditCard, Banknote, ChevronRight,
    Tag, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getCart, createOrder } from "../services/api";
import type { CartData } from "../@types";
import CustomerHeader from "../components/customer/CustomerHeader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'

declare global {
    interface Window{
        snap: any
    }
}

export default function CheckoutPage() {
    const navigate = useNavigate();

    const [cart, setCart] = useState<CartData | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | null> (null)
    const [notes, setNotes] = useState('')

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const data = await getCart()
            setCart(data);
            if (data.items.length === 0) {
                toast.error('Your cart is empty');
                navigate('/cart')
            }
        } catch (error: any) {
            toast.error('Failed to load cart')
            navigate('/cart')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {fetchCart();}, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    const getImageUrl = (imageUrl?: string) => {
        if(!imageUrl) return null;
        if(imageUrl?.startsWith('http')) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`
    }

    const groupItems = cart?.items.reduce((groups, item) => {
        const key = item.store_id;
        if(!groups[key]) {
            groups[key] = {store_name: item.store_name, store_logo: item.store_logo, items: []};
        }
        groups[key].items.push(item);
        return groups;
    }, {} as Record<string, {store_name: string; store_logo?: string; items: typeof cart.items}>)

    const handlePlaceOrder = async () => {
        if(!paymentMethod) {
            toast.error('Please select a payment method')
            return
        }

        setIsPlacingOrder(true);

        try {
            const orders = await createOrder(notes || undefined, paymentMethod)

            if (paymentMethod === 'cash') {
                toast.success('Order placed succesfully!')
                navigate('/orders/active');
                return
            }

            //Online payment - menampilkan midtrans snap popup
            if( paymentMethod === 'online') {
                const snapToken = orders[0]?.snap_token;

                if(!snapToken) {
                    toast.error('Failed to get payment token');
                    return
                }
                
                if(!window.snap) {
                    toast.error('Payment system not loaded. Please refresh page.')
                    return
                }

                window.snap.pay(snapToken, {
                    onSuccess: (_result: any) => {
                        toast.success('Payment succesfully!')
                        navigate('/orders/active')
                    },
                    onPending: (_result: any) => {
                        toast('Payment pending - complete ypur payment', {icon: '⏳'})
                        navigate('/orders/active')
                    },
                    onError: (_result: any) => {
                        toast.error('Payment failed. PLease try again.')
                    },
                    onClose: () => {
                        toast('Payment cancelled. Your order is saved', {icon: '❌'})
                        navigate('/orders/active')
                    }
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
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
        );
    }

    if(!cart) return null;
    const totalSavings = cart.items.reduce((acc, item) => {
        const originalTotal = item.original_price * item.quantity;
        const discountedTotal = item.price_at_time * item.quantity;
        return acc + (originalTotal - discountedTotal)
    }, 0)

    return (
        <div className="min-h-screen bg-secondary">
            <CustomerHeader activeOrderCount={0}/>

            <div className="max-w-4xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="bg-white rounded-2xl px-6 py-4 shadow-sm mb-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/cart')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag size={24} className="text-primary"/>
                            Checkout
                        </h1>
                        <p className="text-sm text-gray-500 ml-8">
                            Review your order before placing
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* left column */}
                    <div className="flex-1 space-y-4">
                    {Object.entries(groupItems!).map(([storeId, group]) => (
                            <div key={storeId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {/* Store Header */}
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                                    {getImageUrl(group.store_logo)
                                        ? <img src={getImageUrl(group.store_logo)!} alt={group.store_name} className="w-8 h-8 rounded-lg object-cover" />
                                        : <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                            <Store size={16} className="text-gray-400" />
                                          </div>
                                    }
                                    <span className="font-semibold text-gray-800">{group.store_name}</span>
                                    <ChevronRight size={16} className="text-gray-400 ml-auto" />
                                </div>

                                {/* Items */}
                                {group.items.map((item) => (
                                    <div key={item.cart_item_id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                            {getImageUrl(item.image_url)
                                                ? <img src={getImageUrl(item.image_url)!} alt={item.name} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center">
                                                    <Tag size={20} className="text-gray-300" />
                                                  </div>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatCurrency(item.price_at_time)} x {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold text-gray-900 flex-shrink-0">
                                            {formatCurrency(item.price_at_time * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Notes */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-primary"/>
                                Notes for Merchant
                                <span className="text-xs text-gray-400 font-normal">(optional)</span>
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Tolong dikemas dengan rapih"
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />    
                        </div>

                        {/* payment method */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <p className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CreditCard size={16} className="text-primary"/>
                                Payment Method
                            </p>    
                            <div className="space-y-3">

                                {/* Cash */}
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                        paymentMethod === 'cash'
                                            ? 'border-primary bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        paymentMethod === 'cash' ?'bg-primary' : 'bg-gray-100'
                                    }`}>
                                        <Banknote size={20} className={paymentMethod === 'cash' ? 'text-white' : 'text-gray-400'}/>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={`font-semibold ${paymentMethod === 'cash' ? 'text-primary' : 'text-gray-800'}`}>
                                            Pay on Store
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Pay with cash when you pick up your order
                                        </p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'
                                    }`}>
                                        {paymentMethod === 'cash' && (
                                            <div className="w-2 h-2 rounded-full bg-primary"/>
                                        )}
                                    </div>
                                </button>
                                
                                {/* online */}
                                <button
                                    onClick={() => setPaymentMethod('online')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                        paymentMethod === 'online' ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    paymentMethod === 'online' ? 'bg-primary' : 'bg-gray-100'
                                   }`}>
                                        <CreditCard size={20} className={paymentMethod === 'online' ? 'text-white' : 'text-gray-400'}/>
                                   </div>
                                   <div className="flex-1 text-left">
                                        <p className={`font-semibold ${paymentMethod === 'online' ? 'text-primary' : 'text-gray-800'}`}>
                                            QRIS, GoPay, OVO, ShopeePay, Virtual Account
                                        </p>
                                   </div>
                                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    paymentMethod === 'online' ? 'border-primary' : 'border-gray-300'
                                   }`}>
                                        {paymentMethod === 'online' && (
                                            <div className="w-2 h-2 rounded-full bg-primary"/>
                                        )}
                                   </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
                            <p className="font-bold text-gray-900 mb-4">Order Summary</p>

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                                {cart.items.map((item) => (
                                    <div key={item.cart_item_id} className="flex justify-between text-sm">
                                        <span className="text-gray-500 truncate flex-1 mr-2">
                                            {item.name} x{item.quantity}
                                        </span>
                                        <span className="text-gray-700 flex-shrink-0">
                                            {formatCurrency(item.price_at_time * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Savings */}
                            {totalSavings > 0 && (
                                <div className="bg-green-50 rounded-xl px-4 py-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600">You save</span>
                                        <span className="text-green-600 font-bold">
                                            {formatCurrency(totalSavings)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Total Price */}
                            <div className="border-t border-gray-100 pt-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-primary text-lg">
                                        {formatCurrency(cart.total_price)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment method info */}
                            {paymentMethod && (
                                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-sm text-gray-600">
                                    {paymentMethod === 'cash'
                                    ? 'Pay when you pick up at store'
                                    : 'You will be redirected to payment'
                                }
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={!paymentMethod || isPlacingOrder}
                                className={`w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2  ${
                                    !paymentMethod
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-gray-100 hover:text-primary'
                                }`}
                            >
                                {isPlacingOrder
                                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</>
                                    : paymentMethod === 'online'
                                    ? 'Pay Now'
                                    : 'Place Order'
                                }
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full py-3 text-gray-500 text-sm font-medium mt-2 hover:text-gray-700 transition-colors"
                            >
                                Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}