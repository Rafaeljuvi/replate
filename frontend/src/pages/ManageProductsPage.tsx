import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, RefreshCcw, Package, ShoppingBag, Settings } from "lucide-react";
import toast from "react-hot-toast";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive
} from "../services/api";

import type { Product, CreateProductData } from "../@types";
import Button from "../components/ui/Button";
import Logo from "../components/layout/Logo";
import ProductCard from "../components/merchant/ProductCard";
import ProductForm from "../components/merchant/ProductForm";
import DeleteConfirmModal from "../components/merchant/DeleteConfirm";

type ModalType = 'create' | 'edit' | 'delete' | null;

export default function ManageProductsPage() {
    const navigate = useNavigate();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsloading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [ModalType, setModalType] = useState<ModalType>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    //Stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const inactiveProducts = products.filter(p => !p.is_active).length;

    //Fetch Products
    const fetchProducts = async () => {
        try {
            setIsloading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error:any) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
        finally {
            setIsloading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [])

    //REFRESH HANDLER
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchProducts();
        setIsRefreshing(false);
        toast.success('Products refreshed');
    }

    // Create product handler
    const handleCreate = async (data: CreateProductData, imageFile?: File) => {
        try {
            setIsSubmitting(true);
            await createProduct(data, imageFile);  
            toast.success('Product created successfully!');
            setModalType(null);
            await fetchProducts();
        } catch (error: any) {
            console.error('Create product error:', error);
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    //Update product handler
    const handleUpdate = async (data: CreateProductData, imageFile?: File) => {
        if (!selectedProduct) return;
    
        try {
            setIsSubmitting(true);
            await updateProduct(selectedProduct.product_id, data, imageFile); 
            toast.success('Product updated successfully!');
            setModalType(null);
            setSelectedProduct(null);
            await fetchProducts();
        } catch (error: any) {
            console.error('Update product error:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };
    //Delete product handler
    const handleDelete = async () => {
        if (!selectedProduct) return;

        try {
            setIsSubmitting(true);
            await deleteProduct(selectedProduct.product_id)
            toast.success('product deleted succesfully!')
            setModalType(null)
            setSelectedProduct(null)
            await fetchProducts();
        } catch (error: any) {
            console.error('Delete product error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product');
        } finally {
            setIsSubmitting(false);
        }
    }

    //Toggle active status handler
    const handleToggleActive = async (product: Product) => {
        try {
            await toggleProductActive(product.product_id)
            toast.success(`Product ${product.is_active ? 'deactivated':'activated'} succesfully!`)
        } catch (error : any) {
            console.error('Toggle active error:', error);
            toast.error('Failed to toggle product status');
        }
    }

    //Modal Handlers
    const openCreateModal = () => {
        setSelectedProduct(null);
        setModalType('create');
    }

    const openEditModal = (product: Product) => {
        setSelectedProduct(product)
        setModalType('edit')
    }

    const openDeleteModal = (product: Product) => {
        setSelectedProduct(product);
        setModalType('delete');
    }

    const closeModal = () => {
        setModalType(null)
        setSelectedProduct(null)
    }

    //Loading State
    if (isLoading) {
        return(
            <div className="min-h-screen bg-primary flex items-center justify-center ">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div> 
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-primary">
            {/* header */}
            <div className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items center gap-4">
                            <Button
                                variant="ghost"
                                size="small"
                                leftIcon={<ArrowLeft size={18} />}
                                onClick={() => navigate('/merchant/dashboard')}
                            >
                                Back
                            </Button>
                            <Logo size="small"/>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-800"> Manage Products </h1>
                            <p className="text-sm text-gray-600">
                                {products.length} {products.length !== 1 ? 'products' : 'product'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="small"
                                leftIcon={<RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''}/>}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                Refresh
                            </Button>

                            <Button
                                variant="primary"
                                size="small"
                                leftIcon={<Plus size={18}/>}
                                onClick={openCreateModal}
                            >
                                Add Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
                <div className="flex flex-col lg:flex-row gap-4">

                    <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Statistics
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Total products */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Package size={20} className="text-white"/>
                                        </div>
                                        <div className="text-3xl font-bold text-blue-900">
                                            {totalProducts}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-blue-700">Total Products</p>
                                </div>

                                {/* Active Products */}
                                <div className="bg-primary rounded-lg p-4 text-white">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary text-xl font-bold">
                                            ✓
                                        </div>
                                        <div className="text-3xl font-bold text-gray-100">
                                            {activeProducts}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-white">
                                        Active Products
                                    </p>
                                </div>

                                {/* Inactive Products */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                                            x
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {inactiveProducts}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Inactive products
                                    </p>
                                </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="bg-white rounded-g shadow">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Quick Actions
                                    </h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <Button
                                        variant="primary"
                                        size="medium"
                                        fullWidth
                                        leftIcon={<Plus size={18}/>}
                                        onClick={openCreateModal}
                                        className="justify-start"
                                    >
                                        Add New Product
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="medium"
                                        fullWidth
                                        leftIcon={<RefreshCcw size={18}/>}
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        className="justify-start"
                                    >
                                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                    </Button>

                                    <div className="border-t border-gray-200 my-2"></div>

                                    <Button
                                        variant="ghost"
                                        size="medium"
                                        fullWidth
                                        leftIcon={<ShoppingBag size={18}/>}
                                        disabled
                                        className="justify-start hover:bg-gray-50"
                                    >   
                                        View Orders
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="medium"
                                        fullWidth
                                        leftIcon={<Settings size={18} />}
                                        disabled
                                        className="justify-start hover:bg-gray-50"
                                        >
                                        Store Settings
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    <div className="flex-1">
                    {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 border-2 border-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus size={48} onClick={openCreateModal} className="text-gray-400"/>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Yet</h3>
                        <p className="text-gray-600 mb-6">
                            Start by adding your first product to showcase your offerings!
                        </p>
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={18}/>}
                            onClick={openCreateModal}
                        >
                            Add Your First Product
                        </Button>
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.product_id}
                                product={product}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                                onToggleActive={handleToggleActive}/>
                        ))}
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {/* Create/Edit Modal */}
            {(ModalType === 'create' || ModalType === 'edit') && (
                <ProductForm
                    product={selectedProduct || undefined}
                    onSubmit={ModalType === 'create' ? handleCreate : handleUpdate}
                    onCancel={closeModal}
                    isLoading={isSubmitting}
                />
            )}

            {/* Delete Confirmation Modal */}
            {ModalType ==='delete' && selectedProduct && (
                <DeleteConfirmModal
                    product={selectedProduct}
                    onConfirm={handleDelete}
                    onCancel={closeModal}
                    isLoading={isSubmitting}/>
            )}
        </div>
    )
}