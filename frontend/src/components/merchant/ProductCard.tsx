import { Package, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Button from "../ui/Button";
import type { Product } from "../../@types";

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onToggleActive: (product: Product) => void;
}

export default function ProductCard({
    product,
    onEdit,
    onDelete,
    onToggleActive
}: ProductCardProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (time?: string) => {
        if (!time) return '-';
        return time.slice(0, 5);
    };

    const getImageUrl = (imageUrl?: string) => {
        if (!imageUrl) return null;
    
        // Build full URL
        let fullUrl: string;
        if (imageUrl.startsWith('http')) {
            fullUrl = imageUrl;
        } else {
            fullUrl = `http://localhost:5000${imageUrl}`;
        }
    
        // Debug logs AFTER processing
        console.log('🖼️ PRODUCT:', product.name);
        console.log('📁 DB Path:', imageUrl);
        console.log('🌐 Full URL:', fullUrl);
    
        return fullUrl;
    };
    

    const imageUrl = getImageUrl(product.image_url);

    return (
        <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${!product.is_active ? 'opacity-60' : ''}`}>

            {/* Image & Badge */}
            <div className="relative mb-4">
                <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '';
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <Package size={48} className="text-gray-400" />
                    )}
                </div>

                {/* Active/Inactive Badge */}
                <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-400 text-white'
                }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            
            {/* Product Info */}
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                </h3>
                
                {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                    </p>
                )}

                {product.category && (
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md mb-2">
                        {product.category}
                    </span>
                )}
            </div>

            {/* Pricing */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-primary">
                        {formatCurrency(Number(product.discounted_price))}
                    </span>
                    {product.discount_percentage > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                            -{product.discount_percentage}%
                        </span>
                    )}
                </div>
                {product.discount_percentage > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(Number(product.original_price))}
                    </span>
                )}
            </div>

            {/* Stock & Availability */}
            <div className="mb-4 space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock} pcs
                    </span>
                </div>

                {(product.available_from || product.available_until) && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="text-gray-900 font-medium">
                            {formatTime(product.available_from)} - {formatTime(product.available_until)}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions - FIXED: 2 rows */}
            <div className="flex flex-col gap-2 pt-4 border-t">
                {/* Row 1: Edit & Toggle */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="small"
                        fullWidth
                        leftIcon={<Edit2 size={16} />}
                        onClick={() => onEdit(product)}
                    >
                        Edit
                    </Button>

                    <Button
                        variant={product.is_active ? 'secondary' : 'primary'}
                        size="small"
                        fullWidth
                        leftIcon={product.is_active ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                        onClick={() => onToggleActive(product)}
                        className={!product.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        {product.is_active ? 'Disable' : 'Enable'}
                    </Button>
                </div>

                {/* Row 2: Delete */}
                <Button
                    variant="outline"
                    size="small"
                    fullWidth
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => onDelete(product)}
                    className="bg-red-600 text-white border-red-600 hover:bg-red-200 disabled:border-red-600 hover:border-red-200"
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}