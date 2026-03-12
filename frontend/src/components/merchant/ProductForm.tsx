import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react';
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import type { CreateProductData, Product } from "../../@types";

interface ProductFormProps {
    product?: Product;
    onSubmit: (data: CreateProductData, imageFile?: File) => void
    onCancel: () => void;
    isLoading: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading}: ProductFormProps) {
    const isEditing = !!product;
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: {errors}
    } = useForm<CreateProductData>({
        defaultValues: product ? {
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            original_price: Number(product.original_price),
            discount_percentage: product.discount_percentage,
            stock: product.stock,
            available_from: product.available_from || '',
            available_until: product.available_until || ''
        } : undefined
    });

    const original_price = watch('original_price')
    const discount_percentage = watch('discount_percentage')

    const discounted_price  = (() => {
        const price = Number(original_price) || 0;;
        const discount = Number(discount_percentage) || 0;
        if (price <= 0) return 0;
        if (discount < 0) return price;
        if (discount > 100) return 0;
        return price - (price * (discount / 100));
    }) ();

    useEffect(() => {
        if (product?.image_url) {
            setImagePreview(`http://localhost:5000${product.image_url}`)
        }
    }, [product])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };

    const handleFormSubmit = (data: CreateProductData) => {
        onSubmit(data, imageFile || undefined);
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                    <X size={24}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Product Image
                        </label>
                    

                    {/* Image Preview */}
                    {imagePreview ? (
                        <div className='relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2'>
                            <img 
                                src={imagePreview} 
                                alt="Preview"
                                className='w-full h-full object-cover' 
                            />
                            <button
                                type='button'
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                }}
                                className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600'
                                >
                                    <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className='w-full h-48 bg-gray-100 rouned-lg flex flex-col items-center justify-center mb-2 border-2 border-dashed border-gray-300'>
                            <ImageIcon size={48} className='text-gray-400 mb-2'/>
                            <p className='text-sm text-gray-500'>No image selected</p>
                        </div>
                    )}

                        <label className='cursor-pointer'>
                            <div className='w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-center hover:bg-gray-200 transition-colors'>
                                <Upload size={16} className='inline mr-2'/>
                                <span className='text-sm font-medium text-gray-700'>
                                    {imagePreview ? 'Change Image' : 'Upload Image'}
                                </span>
                            </div>
                            <input 
                                type='file'
                                accept='image/*'
                                onChange={handleImageChange}
                                className='hidden'
                                />
                        </label>
                        <p className='text-xs text-gray-500 mt-1'>
                            JPG, PNG (Max Size 5MB)
                        </p>
                    </div>

                    <Input
                        label="Product Name"
                        placeholder="e.g., Roti tawar Utuh"
                        error={errors.name?.message}
                        required
                        {
                            ...register('name', {
                                required: 'Product name is required',
                                minLength: {
                                    value: 3,
                                    message: 'Product Name must be 3 or longer'
                                }
                            })
                        }
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                            rows={3}
                            placeholder="Describe your product..."
                            {...register('description')}
                        />
                    </div>

                    <Input
                        label="Category"
                        placeholder="e.g., e.g., Bread, Cake, Pastry"
                        {...register('category')}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label='Original Price(Rp)'
                            type="number"
                            placeholder="25000"
                            error={errors.original_price?.message}
                            required
                            {
                                ...register('original_price', {
                                    required: 'Original Price is required',
                                    min: {
                                        value: 0,
                                        message: 'Price cannot be negative'
                                    },
                                    valueAsNumber: true
                                })
                            }
                        />

                        <Input
                            label="Discount (%)"
                            type="number"
                            placeholder="40"
                            error={errors.discount_percentage?.message}
                            required
                            helperText={`Final Price: Rp ${discounted_price.toLocaleString('id-ID')}`}
                            {...register('discount_percentage', {
                                min:{
                                    value: 0,
                                    message: 'Discount cannot be negative'
                                },
                                max: {
                                    value: 100,
                                    message: 'Discount cannot exceed 100%'
                                },
                                valueAsNumber: true
                            })}
                        />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Final Price:</span>
                            <span className="text-2xl font-bold text-green-900">
                                Rp {discounted_price.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                    
                    <Input 
                        label="Stock (pcs)"
                        type="number"
                        placeholder="10"
                        error={errors.stock?.message}
                        required
                        {...register('stock', {
                            required: 'Stock is required',
                            min: {
                                value: 0,
                                message: 'Stock cannot be negative'
                            },
                            valueAsNumber: true
                        })}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Available From"
                            type="time"
                            helperText="e.g., 15:00"
                            {...register('available_from')}
                        />

                        <Input
                            label="Available Until"
                            type="time"
                            helperText="e.g., 22:00"
                            {...register('available_until')}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isLoading}
                        >
                            {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'} 
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}