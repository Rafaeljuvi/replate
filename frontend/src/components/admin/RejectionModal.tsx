import { XCircle, X } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    storeName: string;
    merchantName: string;
    isLoading: boolean;
}

export default function RejectionModal ({
    isOpen,
    onClose,
    onConfirm,
    storeName,
    merchantName,
    isLoading
}: RejectionModalProps) {
    const [reason, setReason]= useState('')
    const [error, setError] = useState('')

    if(!isOpen) return null;

    const handleSubmit = () => {
        if(!reason.trim()) {
            setError('Please provide a reason for rejection')
            return;
        }
        if(reason.trim().length < 10) {
            setError('Reason must be at least 10 characters')
            return;
        }
        setError('')
        onConfirm(reason.trim())
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    const commonReasons = [
    'QRIS image quality is too low or unclear',
    'ID card image is not readable',
    'Bank account information is incomplete',
    'Store address is invalid or incomplete',
    'Operating hours format is incorrect',
    'Duplicate store application detected'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-start p-6 border-b border-gray-200">
                     <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <XCircle className="w-6 h-6 text-red-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Reject Store</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Provide rejection reason
                            </p>
                        </div>
                     </div>
                     <button
                     onClick={handleClose}
                     disabled={isLoading}
                     className="p-2 hover: bg-gray-100 rounded-lg transition-colors">
                        <  X size={20} className="text-gray-600"/>
                     </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800">
                            You are about to reject this store application.
                        </p>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Store Name</p>
                            <p className="text-sm text-gray-900 font-medium">{storeName}</p>
                        </div>
                        <div>
                           <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Merchant Name</p> 
                           <p className="text-sm text-gray-900 font-medium">
                            {merchantName}
                           </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            Common Reasons (Choose one):
                        </p>
                        <div className="space-y-2">
                            {commonReasons.map((commonReason, index) => (
                                <button key={index}
                                onClick={() => setReason(commonReason)}
                                className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                disabled={isLoading}>
                                    {commonReason}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                        value  ={reason}
                        onChange={(e) => {
                            setReason(e.target.value)
                            setError('');
                        }}
                        placeholder="Explain why this applicant is being rejected"
                        className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-primary focus:border-primary'
                        }`}
                        rows = {4}
                        disabled={isLoading}/>
                        {error && (
                            <p className="text-sm text-red-500 mt-1">{error}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {reason.length}/10 characters minimum
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                        <p className="text-xs text-yellow-800"><strong>Note: </strong> The merchant will receive this reason via email.</p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="border-2 border-red-500 bg-red-500 text-white hover:bg-red-600"
                        >
                            {isLoading ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}