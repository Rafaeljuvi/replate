import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    Clock,MapPin, Star, Phone, ShoppingCart, Store, Tag, Package
} from 'lucide-react'
import toast from "react-hot-toast";
import { getPublicProductById, addToCart } from "../services/api";
import type { PublicProduct } from "../@types";
import CustomerHeader from '../components/customer/CustomerHeader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ProductDetailPage() {
    const { id } = useParams<{id: string}>();
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

    const [product, setProduct] = useState<PublicProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const fetchProducts = async() => {
        if(!id) return;
        try {
            setIsLoading(true);
            const data = await getPublicProductById(id, lat, lng)
            setProduct(data);
        } catch (error: any) {
            toast.error('Product not found');
            navigate('/home');
        } finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {fetchProducts()}, [id])

    const getImageUrl = (imageUrl?:string) => {
        if(!imageUrl) return null;
        if(imageUrl.startsWith('http')) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatTime = (time?: string) => {
        if (!time) return null;
        return time.slice(0,5);
    }

    const handleAddToCart = async () => {
        if(!product) return;
        try {
            await addToCart(product.product_id, quantity);
            toast.success(`${quantity}x ${product.name} added to cart!`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2  border-white"></div>
                    <p className="text-gray-500 text-sm">Loading product...</p>
                </div>
            </div>
        )
    };

    if(!product) return null;

    const savings = product.original_price - product.discounted_price

    return (
        <div className="min-h-screen bg-primary">
            {/* Header */}
            <CustomerHeader activeOrderCount={0} />
            
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left column */}
                    <div className="flex-1 space-y-4">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm aspect-video relative">
                            {getImageUrl(product.image_url)
                            ? <img
                                src={getImageUrl(product.image_url)!}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            : <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <Tag size={48} className="text-gray-200"/>
                            </div>
                            }
                            {product.distance_km !== undefined && (
                                <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <MapPin size={12}/>
                                    {product.distance_km} km away
                                </div>
                            )}
                        </div>

                        {/* product info card */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            {product.category && (
                                <span className="text-xs text-primary font-semibold uppercase tracking-wide">
                                    {product.category}
                                </span>
                            )}
                            <h2 className="text-2xl font-bold text-gray-900 mt-1 mb-3">
                                {product.name}
                            </h2>

                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-3xl font-bold text-primary">
                                    {formatCurrency(product.discounted_price)}
                                </span>
                                {product.discount_percentage > 0 && (
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-400 line-through">
                                            {formatCurrency(product.original_price)}
                                        </span>
                                        <span className="text-xs text-green-600 font-semibold">
                                            Save {formatCurrency(savings)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {product.description && (
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    {product.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                                    product.stock <= 5
                                    ? 'bg-red-100 text-red-600'
                                    : product.stock <= 10
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-green-100 text-green-600'
                                }`}>
                                    <Package size={11}/>
                                    {product.stock} left in stock
                                </span>

                                {product.available_from && product.available_until && (
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                                        <Clock size={11}/>
                                        {formatTime(product.available_from)} - {formatTime(product.available_until)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Store info Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Store size={16} className="text-primary"/>
                                Store Information
                            </h3>

                            <div className="flex items-start gap-3 mb-4">
                                {getImageUrl(product.store_logo)
                                    ? <img
                                        src={getImageUrl(product.store_logo)!}
                                        alt={product.store_name}
                                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                                    />
                                    : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Store size={20} className="text-gray-400"/>
                                    </div>
                                }
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900">{product.store_name}</h4>
                                    {product.average_rating !== undefined && Number(product.average_rating) > 0 && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400"/>
                                            <span className="text-xs text-gray-600 font-medium">
                                                {Number(product.average_rating).toFixed(1)}
                                            </span>
                                            {product.total_ratings && (
                                                <span className="text-xs text-gray-400">
                                                    ({product.total_ratings} reviews)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {product.address && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <MapPin size={13} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Address</p>
                                            <p className="text-sm text-gray-700">
                                                {product.address}{product.city ? `, ${product.city}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {product.distance_km !== undefined && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin size={13} className="text-primary"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Distance</p>
                                            <p className="text-sm font-semibold text-primary">
                                                {product.distance_km} km from you
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {product.operating_hours && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Clock size={13} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Operating hours</p>
                                            <p className="text-sm text-gray-700">{product.operating_hours}</p>
                                        </div>
                                    </div>
                                )}

                                {product.store_phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone size={13} className="text-gray-400"/>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Phone
                                            </p>
                                            <p className="text-sm text-gray-700">{product.store_phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>     
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
                            <h3 className="text-sm font-bold text-gray-700 mb-4">Order Summary</h3>
                            
                            {/* Set Quantity */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Quantity</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg"
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-bold text-gray-900 w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-lg"
                                    >
                                        +
                                    </button>
                                    <span className="text-xs text-gray-400 ml-1">
                                        max {product.stock}
                                    </span>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Price</span>
                                    <span className="text-gray-700">{formatCurrency(product.discounted_price)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Quantity</span>
                                    <span className="text-gray-700">x{quantity}</span>
                                </div>
                                {savings > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>You save</span>
                                        <span className="font-semibold">-{formatCurrency(savings * quantity)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-2 flex justify-between">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-primary text-lg">
                                        {formatCurrency(product.discounted_price * quantity)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-gray-50 hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18}/>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}