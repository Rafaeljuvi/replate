import { CheckCircle, X } from "lucide-react";
import Button from "../ui/Button";

interface ApprovalModalProps {
    isOpen:boolean;
    onClose: () => void;
    onConfirm: () => void;
    storeName: string;
    merchantName: string;
    isLoading: boolean;
}

export default function ApprovalModal ({
    isOpen,
    onClose,
    onConfirm,
    storeName,
    merchantName,
    isLoading
}: ApprovalModalProps) {
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-start p-6 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Approve Store</h2>
                            <p className="text-sm text-gray-600 mt-1">Confirm store approval</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-600"/>
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-800">
                            You are about to approve this store application. The merchant will receive an email notification.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Store Name</p>
                            <p className="text-sm text-gray-900 font-medium">{storeName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Merchant</p>
                            <p className="text-sm text-gray-900 font-medium">{merchantName}</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                        <p className="text-xs text-yellow-800">
                            <strong>Note: </strong> This action will activate the store and notify the merchant via email.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 p-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={onClose}
                        disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={onConfirm}
                        isLoading={isLoading}>
                            {isLoading? 'Approving...' : 'Approve Store'}
                    </Button>
                </div>
            </div>
        </div>
    );
}