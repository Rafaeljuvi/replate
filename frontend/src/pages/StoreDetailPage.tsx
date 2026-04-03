import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Star, Phone, Store, Package, ChevronLeft, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicStoreById, getStoreReviews } from '../services/api';
import type { PublicStore, PublicProduct, StoreReviews } from '../@types';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerProductCard from '../components/customer/CustomerProductCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function StoreDetailPage() {
    const { id: storeId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

    const [store, setStore] = useState<PublicStore | null>(null);
    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const availableProducts = products.filter(p => p.is_available_now !== false);
    const [sortBy, setSortBy] = useState<'default' | 'discount_asc' | 'discount_desc'>('default')
    const [reviews, setReviews] = useState<StoreReviews | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storeData, reviewsData] = await Promise.all([
                    getPublicStoreById(storeId!, lat, lng),
                    getStoreReviews(storeId!)
                ]);
                setStore(storeData.store);
                setProducts(storeData.products);
                setReviews(reviewsData);
            } catch (error: any) {
                toast.error('Failed to load store');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [storeId])


    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`;
    };

    const sortedProducts = [...products].sort((a,b) => {
        switch(sortBy) {
            case 'discount_desc':
                return b.discount_percentage - a.discount_percentage
            case 'discount_asc':
                return a.discount_percentage - b.discount_percentage
            default:
                if (a.is_available_now === false && b.is_available_now !== false) return 1;
                if (a.is_available_now !== false && b.is_available_now === false) return -1;
                return 0;
        }
    })


    if (isLoading) {
        return (
            <div className="min-h-screen bg-secondary">
                <CustomerHeader />
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-gray-500 text-sm">Loading store...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!store) return null;

    return (
        <div className="min-h-screen bg-secondary">
            <CustomerHeader />

            {/* Store Hero Banner */}
            <div className="max-w-7xl mx-auto mt-4">
                <div className="bg-gradient-to-br from-primary to-green-400 text-white max p-6 rounded-xl">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-green-100 hover:text-white text-sm mb-4 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back to Browse
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Store Logo */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white bg-opacity-20 flex-shrink-0 flex items-center justify-center shadow-lg">
                            {getImageUrl(store.logo_url)
                                ? <img
                                    src={getImageUrl(store.logo_url)!}
                                    alt={store.store_name}
                                    className="w-full h-full object-cover"
                                  />
                                : <Store size={28} className="text-white" />
                            }
                        </div>

                        {/* Store Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold mb-1">{store.store_name}</h1>

                            {/* Rating */}
                            {store.average_rating !== undefined && Number(store.average_rating) > 0 && (
                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={12}
                                            className={star <= Math.round(Number(store.average_rating))
                                                ? 'text-yellow-300 fill-yellow-300'
                                                : 'text-green-300'
                                            }
                                        />
                                    ))}
                                    <span className="text-green-100 text-xs font-medium ml-1">
                                        {Number(store.average_rating).toFixed(1)}
                                    </span>
                                    {store.total_ratings && (
                                        <span className="text-green-200 text-xs">
                                            ({store.total_ratings} reviews)
                                        </span>
                                    )}
                                </div>
                            )}

                            {store.description && (
                                <p className="text-green-100 text-xs leading-relaxed mb-2 truncate">
                                    {store.description}
                                </p>
                            )}

                            {/* Store Meta Badges */}
                            <div className="flex flex-wrap gap-2">
                                {store.distance_km !== undefined && (
                                    <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2.5 py-1 rounded-full">
                                        <MapPin size={10} />
                                        <span className="text-xs">{store.distance_km} km</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2.5 py-1 rounded-full">
                                    <Package size={10} />
                                    <span className="text-xs">{Number(store.active_products)} products</span>
                                </div>
                                {store.operating_hours && (
                                    <div className="flex items-center gap-1 bg-white bg-opacity-20 px-2.5 py-1 rounded-full">
                                        <Clock size={10} />
                                        <span className="text-xs">{store.operating_hours}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ========= SIDEBAR ========*/}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-4">

                            {/* Store Details Card */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <Store size={14} className="text-primary" />
                                    Store Details
                                </h3>
                                <div className="space-y-3">

                                    {store.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MapPin size={13} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Address</p>
                                                <p className="text-sm text-gray-700">
                                                    {store.address}{store.city ? `, ${store.city}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {store.distance_km !== undefined && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <MapPin size={13} className="text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Distance</p>
                                                <p className="text-sm font-semibold text-primary">
                                                    {store.distance_km} km from you
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {store.operating_hours && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Clock size={13} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Operating Hours</p>
                                                <p className="text-sm text-gray-700">{store.operating_hours}</p>
                                            </div>
                                        </div>
                                    )}

                                    {store.phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Phone size={13} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Phone</p>
                                                <p className="text-sm text-gray-700">{store.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rating summary card */}
                            {reviews && reviews.total > 0 && (
                                <div className='bg-white rounded-2xl p-5 shadow-sm'>
                                    <h3 className='text-sm font-bold text-gray-700 mb-4 flex items-center gap-2'>
                                        <Star size={16} className='text-yellow-400 fill-yellow-400'/>
                                        Rating Summary
                                    </h3>

                                    {/* Average Rating */}
                                    <div className='flex items-center gap-3 mb-4'>
                                        <span className='text-4xl font-bold text-gray-900'>
                                            {Number(store?.average_rating).toFixed(1)}
                                        </span>
                                        <div>
                                            <div className='flex gap-1'>
                                                {[1,2,3,4,5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={star <= Math.round(Number(store?.average_rating))
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-200 fill-gray-200'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <p className='text-xs text-gray-400 mt-1'>{reviews.total} reviews</p>
                                        </div>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className='space-y-2'>
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const count = reviews.distribution[star] || 0;
                                            const percentage = reviews.total > 0? (count / reviews.total) * 100 : 0;
                                            return (
                                                <div key={star} className='flex items-center gap-2'>
                                                    <span className='text-xs text-gray-500 w-3'>{star}</span>
                                                    <Star size={10} className='text-yellow-400 fill-yellow-400 flex-shrink-0'/>
                                                    <div className='flex-1 h-2 bg-gray-100 rounded-full overflow-hidden'>
                                                        <div 
                                                            className='h-full bg-yellow-400 rounded-full transition-all'
                                                            style={{width: `${percentage}%`}}
                                                        />
                                                    </div>
                                                    <span className='text-xs text-gray-400 w-4 text-right'>{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ========= MAIN CONTENT ======== */}
                    <div className="flex-1 min-w-0">

                        {/* Products Found + Sort */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white rounded-xl px-4 py-2 shadow-sm inline-flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                <p className="text-sm font-medium text-gray-700">
                                    {availableProducts.length} {availableProducts.length === 1 ? 'product' : 'products'} available
                                    {products.length > availableProducts.length && (
                                        <span className="text-gray-400 ml-1">
                                            · {products.length - availableProducts.length} unavailable
                                        </span>
                                    )}
                                </p>
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                            >
                                <option value="default">Default</option>
                                <option value="discount_desc">Discount: High to Low</option>
                                <option value="discount_asc">Discount: Low to High</option>
                            </select>
                        </div>

                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Package size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No products available
                                </h3>
                                <p className="text-sm text-gray-400">
                                    This store has no active products right now
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {sortedProducts.map((product) => (
                                    <CustomerProductCard
                                        key={product.product_id}
                                        product={product}
                                        userLat={lat}
                                        userLng={lng}
                                        showUnavailable={true}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Reviews Section */}
                        {reviews && reviews.total > 0 && (
                            <div className='mt-8'>
                                <div className='bg-white max-w-sm rounded-full flex items-center'>
                                    <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 ml-8 mt-3'>
                                        <MessageSquare size={20} className='text-primary'/>
                                        Customer Reviews
                                        <span className='text-sm font-normal text-gray-400'>({reviews.total})</span>
                                    </h3>
                                </div>
                                

                                <div className='space-y-3 mt-2'>
                                    {reviews.reviews.map((review) => (
                                        <div key={review.review_id} className='bg-white rounded-2xl p-5 shadow-sm'>
                                            <div className='flex items-start justify-between mb-3'>
                                                <div className='flex items-center gap-3'>
                                                    {/* Avatar */}
                                                    <div className='w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center flex-shrink-0'>
                                                        <span className='text-sm font-bold text-primary'>
                                                            {review.customer_name?.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className='text-sm font-semibold text-gray-900'>{review.customer_name}</p>
                                                        <div className="flex gap-0.5 mt-0.5">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    size={12}
                                                                    className={star <= review.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-200 fill-gray-200'
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className='text-xs text-gray-400'>
                                                    {new Intl.DateTimeFormat('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }).format(new Date(review.created_at))}
                                                </span>
                                            </div>

                                            {review.comment && (
                                                <p className='text-sm text-gray-600 leading-relaxed'>
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reviews && reviews.total === 0 && (
                            <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Star size={28} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-semibold text-gray-600">No reviews yet</p>
                                <p className="text-xs text-gray-400 mt-1">Be the first to review this store!</p>
                            </div>
                        )}
                    </div>   
                </div>
            </div>
        </div>
    );
}