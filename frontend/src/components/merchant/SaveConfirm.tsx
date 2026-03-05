import { AlertTriangle, X } from "lucide-react";
import Button from "../ui/Button";

interface SaveConfirmModalProps {
    isOpen: boolean;
    pendingAction: 'back' | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function SaveConfirmModal({
    isOpen,
    pendingAction,
    onConfirm,
    onCancel
}: SaveConfirmModalProps){
    if(!isOpen) return null;
    console.log('SaveConfirmModal render, isOpen:', isOpen);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="text-yellow-500" size={24} />
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                <p className="text-lg font-bold text-gray-500 text-center mb-6">
                    Unsaved Changes
                </p>
                <p className="text-sm text-gray-500 text-center mb-6">
                    You have unsaved changes. Are you sure you want to{' '}
                    <span className="font-semibold text-gray-700">
                        {pendingAction === 'back' ? 'leave this page' : ''}
                    </span>
                    ? Your changes will be lost.
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={onCancel}
                    >
                        Keep editing
                    </Button>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600 border-red-500"
                    >
                        {pendingAction === 'back' ? 'Leave': ''}
                    </Button>
                </div>
            </div>
        </div>
    )
}