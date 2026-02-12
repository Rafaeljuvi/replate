import { MapPin, Phone, User, Mail, Calendar } from "lucide-react";
import Button from "../ui/Button";

interface PendingStore {
    store_id :string;
    store_name: string;
    description?: string;
    address: string;
    city: string;
    phone: string;
    operating_hours: string;
    qris_image_url?: string;
    id_card_image_url?: string;
    bank_account_number?: string;
    created_at: string;
    merchant_name: string;
    merchant_email: string;
    merchant_phone: string;
}

interface PendingStoreCardProps {
    store: PendingStore;
    onApprove: (storeId: string) => void;
    onReject: (storeId: string) => void;
    onViewDocuments: (store: PendingStore) => void;
}

export default function PendingStoreCard({
    store,
    onApprove,
    onReject,
    onViewDocuments
}: PendingStoreCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{store.store_name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14}/>
                        Submitted: {formatDate(store.created_at)}
                    </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                    Pending
                </span>
            </div>

            {store.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {store.description}
                </p>
            )}

            <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                    <span className="text-gray-700">
                        {store.address}, {store.city}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400 flex-shrink-0"/>
                    <span className="text-gray-700">{store.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400 flex-shrink-0"/>
                    <span className="text-gray-700">{store.operating_hours}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Merchant Info
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <User size={16} className="text-gray-400 flex-shrink-0"/>
                            <span className="text-gray-700 font-medium">
                                {store.merchant_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail size={16} className="text-gray-400 flex-shrink-0"/>
                            <span className="text-gray-700">{store.merchant_email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone size={16} className="text-gray-400 flex-shrink-0"/>
                            <span className="text-gray-700">{store.merchant_phone}</span>
                        </div>
                    </div>
                </div>

                {store.bank_account_number && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Bank Account</p>
                        <p className="text-sm text-blue-900 font-mono">{store.bank_account_number}</p>
                    </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button 
                    variant="outline"
                    size="small"
                    fullWidth
                    onClick={() => onViewDocuments(store)}
                    >
                        View Documents
                    </Button>
                    <Button
                    variant="primary"
                    size="small"
                    fullWidth
                    onClick={() => onApprove(store.store_id)}
                    >
                        Approve
                    </Button>
                    <Button
                    variant="secondary"
                    size="small"
                    fullWidth
                    onClick={() => onReject(store.store_id)}
                    >
                        Reject
                    </Button>
                </div>
            </div>
        </div>
    );
}