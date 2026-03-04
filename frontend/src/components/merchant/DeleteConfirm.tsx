import { AlertTriangle } from "lucide-react";
import Button from "../ui/Button";
import type { Product } from "../../@types";

interface DeleteConfirmProps {
    product: Product;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

export default function DeleteConfirmModal({
    product,
    onConfirm,
    onCancel,
    isLoading
}: DeleteConfirmProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">

                {/* Icon */}
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600"/>
                </div>

                <p className="text-xl font-bold text-gray-900 text-center mb-2">
                    Delete Product?
                </p>

                <p className="text-gray-600 text-center mb-4">
                    Are You sure you want to delete{' '}
                    <span className="font-semibold text-gray-900">
                        "{product.name}"
                    </span>?
                    <br />
                    This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant= "primary"
                        fullWidth
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    )
}