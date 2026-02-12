import {X, Download} from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'

interface DocumentViewProps {
    isOpen: boolean;
    onClose: () => void;
    storeName: string;
    qrisImageUrl?: string;
    idCardImageUrl?: string;
}

export default function DocumentViewerModal({
    isOpen,
    onClose,
    storeName,
    qrisImageUrl,
    idCardImageUrl
} : DocumentViewProps) {
    const [activeTab, setActiveTab] = useState<'qris' | 'idcard'>('qris');
    console.log('Modal opened with:', {qrisImageUrl, idCardImageUrl, storeName})
    console.log('QRIS URL:', qrisImageUrl);
    console.log('ID Card URL:', idCardImageUrl);

    //convert relative URL ke full URL
    const API_BASE_URL = 'http://localhost:5000';
    const fullQrisUrl = qrisImageUrl ? `${API_BASE_URL}${qrisImageUrl}` : undefined
    const fullIdCardUrl = idCardImageUrl ? `${API_BASE_URL}${idCardImageUrl}` : undefined;

    if(!isOpen) return null;

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click()
        document.body.removeChild(link);
    };

    return(
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'>
                <div className='flex justify-between items-center p-6 border-b border-gray-200'>
                    <div>
                        <h2 className='text-xl font-bold text-gray-900'>Store Documents</h2>
                        <p className='text-sm text-gray-600 mt-1'>{storeName}</p>
                    </div>

                <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                    <X size={24} className='text-gray-600'/>
                </button>
                </div>

                <div className='flex border-b border-gray-200'>
                    <button onClick={() => setActiveTab('qris')} 
                    className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'qris' ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'}`}>
                        QRIS Image
                    </button>

                    <button onClick={() => setActiveTab('idcard')} 
                    className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'idcard' ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:text-gray-700'}`}>
                        ID Card
                    </button>
                </div>

                <div className='p-6 overflow-y-auto max-h-[calc(90vh-180px)]'>
                        {activeTab === 'qris' && (
                            <div>
                                {qrisImageUrl ? (
                                    <div className='space-y-4'>
                                        <div className='flex justify-between items-center'>
                                            <p className='text-sm text-gray-600'>
                                                QRIS Payment code for store transactions
                                            </p>
                                            <Button
                                            variant="outline"
                                            size="small"
                                            leftIcon={<Download size={16} />}
                                            onClick={() => fullQrisUrl && handleDownload(fullQrisUrl, `${storeName}_QRIS.jpg`)}>
                                                Download
                                            </Button>
                                        </div>
                                        <div className='bg-gray-50 rounded-lg p-4 flex justify-center'>
                                            <img src={fullQrisUrl} alt="QRIS Code" 
                                            className='max-w-full max-h-[500px] object-contain rounded-lg shadow-md'/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='text-center py-12'>
                                        <p className='text-gray-500'>No Qris image Uploaded</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'idcard' && (
                            <div>
                                {idCardImageUrl ? (
                                    <div className='space-y-4'>
                                        <div className='flex justify-between items-center'>
                                            <p className='text-sm text-gray-600'>
                                                Merchant Identification card
                                            </p>
                                            <Button
                                                variant='outline'
                                                size='small'
                                                leftIcon={<Download size={16}/>}
                                                onClick={() => fullIdCardUrl && handleDownload(fullIdCardUrl, `${storeName}_IDCard.jpg`)}>
                                                    Download
                                            </Button>
                                        </div>
                                        <div className='bg-gray-50 rounded-lg p-4 flex justify-center'>
                                            <img src={fullIdCardUrl} alt="ID Card"
                                             className='max-w-full max-h-[500px] object-contain rounded-lg shadow-md'/>
                                        </div>
                                    </div>
                                ): (
                                    <div className='text-center py-12'>
                                        <p className='text-gray-500'>No ID Card image uploaded</p>
                                    </div>
                                )}
                            </div>
                        )}
                </div>
                <div className='flex justify-end gap-2 p-6 border-t border-gray-200'>
                    <Button variant='outline' onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
