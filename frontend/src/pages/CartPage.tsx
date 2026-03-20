import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Store } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, updateCartItem, removeCartItem, clearCart } from "../services/api";
import type { CartData, CartItem } from "../@types";
import CustomerHeader from "../components/customer/CustomerHeader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartData | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const fetchCart = async() => {
        try {
            setIsLoading(true)
            const data = await getCart()
            setCart(data)
        } catch (error: any) {
            toast.error('Failed to load cart')
        } finally{
            setIsLoading(false)
        }
    }

    useEffect(() => {fetchCart();}, []);

    const getImageUrl = (imageUrl?: string) =>{
        if(!imageUrl) return null;
        if(imageUrl.startsWith('http')) return imageUrl
        return `${API_BASE_URL}${imageUrl}`
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    const handleUpdateQuantity = async (item:CartItem, newQuantity: number) => {
        if(newQuantity < 1 || newQuantity > item.stock) return;
        setUpdatingItems(prev => new Set(prev).add(item.cart_item_id));
        try {
            await updateCartItem(item.cart_item_id, newQuantity);
            await fetchCart()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Faild to update cart')
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev)
                next.delete(item.cart_item_id)
                return next;
            })
        }
    }

    const handleRemoveItem = async (cartItemId: string, name: string) => {
        try {
            await removeCartItem(cartItemId);
            toast.success(`${name} removed from cart`)
            await fetchCart()
        } catch (error: any) {
            toast.error('Failed to remove item')
        }
    }

    const handleClearCart = async () => {
        try {
            await clearCart()
            toast.success('Cart cleared')
            setShowClearConfirm(false);
            await fetchCart()
        } catch (error: any) {
            toast.error('Failed to clear cart')
        }
    }

    //Group items by store
    const groupedItems = cart?.items.reduce((groups, item) => {
        const key = item.store_id
        if(!groups[key]) {
            groups[key] = {store_name: item.store_name, store_logo: item.store_logo, items: []};
        }
        groups[key].items.push(item);
        return groups;
    }, {} as Record<string, {store_name: string; store_logo?: string; items: CartItem[]} >)

    if(isLoading) {
        return (
            <div className="min-h-screen bg-secondary">
                <CustomerHeader/>
                <div className="flex item-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary">
            <CustomerHeader activeOrderCount={0}/>
            <div className="max-w-4xl mx-auto px-4 py-6">

                {/* header */}
                <div className="bg-white rounded-2xl px-6 py-6 shadow-sm mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                My Shopping Cart
                            </h1>
                            <p className="text-sm text-gray-500">
                                {cart?.total_items || 0} {cart?.total_items === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>
                    </div>
                    {cart && cart.items.length > 0 && (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 font-semibold text-sm rounded-xl transition-colors border border-red-100"
                        >
                            <Trash2 size={15} />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Empty Cart */}
                {!cart || cart.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <ShoppingCart size={40} className="text-gray-300"/>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</p>
                        <p className="text-sm text-gray-400 mb-6">Find amazing discounted food near you</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                            Browse Food
                        </button>
                    </div>
                ): (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            {Object.entries(groupedItems!).map(([storeId, group]) => (
                                <div key={storeId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                                        {getImageUrl(group.store_logo) 
                                            ? <img src={getImageUrl(group.store_logo)!} alt={group.store_name} className="w-8 h-8 rounded-lg object-cover"/>
                                            : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Store size={16} className="text-gray-400"/>
                                            </div>
                                        }
                                        <span
                                            onClick={() => navigate(`/stores/${storeId}`)}
                                            className="font-semibold text-gray-800 hover:text-primary cursor-pointer transition-colors"
                                        >
                                            {group.store_name}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    {group.items.map((item) => (
                                        <div key={item.cart_item_id} className="flex gap-4 p-5 border-b border-gray-50 last:border-0">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                {getImageUrl(item.image_url)
                                                    ? <img src={getImageUrl(item.image_url)!} alt={item.name} className="w-full h-full object-cover"/>
                                                    : <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingCart size={24} className="text-gray-300"/>
                                                    </div>
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-primary font-bold mt-0.5">
                                                    {formatCurrency(item.price_at_time)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Stock: {item.stock} left
                                                </p>
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex flex-col items-end justify-between">
                                                <button
                                                   onClick={() => handleRemoveItem(item.cart_item_id, item.name)} 
                                                   className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>

                                                <div className="flex 
                                                items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                        disabled = {item.quantity <= 1 || updatingItems.has(item.cart_item_id)}
                                                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled: opacity-40 transition-colors"
                                                    >
                                                        <Minus size={12}/>
                                                    </button>
                                                    <span className="text-sm font-bold w-6 text-center">
                                                        {updatingItems.has(item.cart_item_id)
                                                        ? <span className="animate-pulse">...</span>
                                                        : item.quantity
                                                        }
                                                    </span>
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock || updatingItems.has(item.cart_item_id)}
                                                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                                    >
                                                        <Plus size={12}/>
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(item.price_at_time * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="lg:w-80 flex-shrink-0">
                            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
                                <p className="font-bold text-gray-900 mb-4">
                                    Order Summary
                                </p>
                                <div className="space-y-2 mb-4">
                                    {cart.items.map((item) => (
                                        <div key={item.cart_item_id} className="flex justify-between text-sm">
                                            <span className="text-gray-500 truncate flex-1 mr-2">
                                                {item.name} x{item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 pt-3 mb-4">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-primary text-lg">
                                            {formatCurrency(cart.total_price)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-gray-200 hover:text-primary transition-colors"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={() => navigate('/home')}
                                    className="w-full py-3 text-gray-500 font-medium mt-2 hover:text-gray-700 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} className="text-red-500"/>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                            Clear cart?
                        </h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            All items will be removed from your cart. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearCart}
                                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}