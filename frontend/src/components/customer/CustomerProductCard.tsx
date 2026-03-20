import { useNavigate } from "react-router-dom";
import { Star, Clock, MapPin, Tag, Store } from "lucide-react";
import type { PublicProduct } from "../../@types";

interface CustomerProductCardProps {
    product: PublicProduct;
    userLat?: number;
    userLng?: number;
    showUnavailable?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CustomerProductCard({product, userLat, userLng, showUnavailable = false}: CustomerProductCardProps) {
    const navigate = useNavigate();
    const isUnavailable = showUnavailable && product.is_available_now === false;

    const handleClick = () => {
        if(isUnavailable) return;
        if(userLat && userLng) {
            navigate(`/products/${product.product_id}?lat=${userLat}&lng=${userLng}`);
        } else {
            navigate(`/products/${product.product_id}`);
        }
    }

    const getImageUrl = (imageUrl?: string) => {
        if(!imageUrl) return null;
        if(imageUrl.startsWith('http')) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`;
    }

    const formatCurrency = (amount: number) =>{
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    }

    const formatTime = (time?: string) => {
        if(!time) return null
        return time.slice(0,5);
    }

    return(
        <div 
            onClick={handleClick}
            className={`bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative
                ${isUnavailable
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-lg cursor-pointer group'
                }`}>
                    {isUnavailable && (
                        <div className="absolute inset-0 z-10 flex items-end justify-center pb-4">
                            <div className="bg-gray-800 bg-opacity-80 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <Clock size={11}/>
                                Not Available Now
                            </div>
                        </div>
                    )}           
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {getImageUrl(product.image_url)
                        ? <img
                            src={getImageUrl(product.image_url)!}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {e.currentTarget.style.display = 'none'}}
                        />
                        : <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Tag size={40} className="text-gray-300"/>
                        </div>
                    }

                    {/* Discount badge */}
                    {product.discount_percentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{product.discount_percentage}%
                        </div>
                    )}

                    {/* Distance Badge */}
                    {product.distance_km !== undefined && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <MapPin size={10}/>
                            {product.distance_km} km
                        </div>
                    )}
                </div>

                {/* Product Name */}
                <div className="p-4">
                    {product.category && (
                        <p className="inline-block text-xs text-primary font-semibold bg-green-50 px-2.5 py-1 rounded-full mb-2">
                            {product.category}
                        </p>
                    )}

                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-primary">
                            {formatCurrency(product.discounted_price)}
                        </span>
                        {product.discount_percentage > 0 &&(
                            <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(product.original_price)}
                            </span>
                        )}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                        {/* Store info */}
                        <div className="flex items-center gap-2">
                            {getImageUrl(product.store_logo)
                                ? <img
                                    src={getImageUrl(product.store_logo)!}
                                    alt={product.store_name}
                                    className="w-5 h-5 rounded-full object-cover"
                                />
                                : <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Store size={12} className="text-gray-400"/>
                                </div>
                            }
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const query = userLat && userLng
                                        ? `?lat=${userLat}&lng=${userLng}`
                                        : '';
                                    navigate(`/stores/${product.store_id}${query}`);
                                }}
                                className="text-xs text-gray-600 font-medium truncate hover:text-primary hover:underline cursor-pointer transition-colors"
                            >
                                {product.store_name}
                            </span>
                        </div>

                        {/* Rating */}
                        {product.average_rating !== undefined && Number(product.average_rating) > 0 && (
                            <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-400 fill-yellow-400"/>
                                <span className="text-xs text-gray-600 font-medium">
                                    {Number(product.average_rating).toFixed(1)}
                                </span>
                            </div>
                        )}

                        {/* Available Hours */}
                        {product.available_from && product.available_until && (
                            <div className="flex items-center gap-1">
                                <Clock size={12} className="text-gray-400"/>
                                <span className="text-xs text-gray-500">
                                    {formatTime(product.available_from)} - {formatTime(product.available_until)}
                                </span>
                            </div>
                        )}

                        {/* Stock */}
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                product.stock <= 5 
                                ? 'bg-red-100 text-red-600'
                                : product.stock <= 10
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-green-100 text-green-600'
                            }`}>
                                {product.stock <= 5
                                    ? `${product.stock} left`
                                    : `${product.stock} left`
                                }
                            </span>
                        </div>
                    </div>
                </div>
        </div>
    )
}