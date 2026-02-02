import { useState, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    label: string;
    accept?: string;
    maxSize?: number; //IN MB
    value ?: File | null;
    onChange: (file: File | null) => void;
    error?: string;
    helperText?: string;
    preview?: boolean;
}

export default function FileUpload({
    label,
    accept = 'image/*',
    maxSize = 5,
    value,
    onChange,
    error,
    helperText,
    preview = true
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if(!file){
            onChange(null);
            setPreviewUrl(null);
            return;
        }

        //validate file size
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size exceeds ${maxSize} MB`);
            return;
        }

        //validate file type
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileType = file.type;
        const isValidType = acceptedTypes.some((type) => {
            if(type === 'image/*') return fileType.startsWith('image/');
            return fileType === type;
        });

        if(!isValidType) {
            alert (`Invalid file type. Accepted: ${accept}`);
            return;
        }

        onChange(file);

        //Generate Preview
        if (preview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files [0]) {
            handleFileChange(files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFileChange(files[0]);
        }
    };

    const handleRemove = () => {
        handleFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className='w-full'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                {label}
            </label>

            <div
                onDragOver={handleDragOver}
                onDragLeave = {handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className = {`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                ${
                    isDragging
                    ? 'border-primary bg-primary/5'
                    : error
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }
                `}
            >
                <input
                ref={fileInputRef}
                type='file'
                accept={accept}
                onChange={handleInputChange}
                className='hidden'
                />

            {value && previewUrl ? (
            // Preview
            <div className="relative">
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                <X size={16} />
                </button>
                <p className="mt-3 text-sm text-gray-600 font-medium">{value.name}</p>
                <p className="text-xs text-gray-500">{(value.size / 1024).toFixed(1)} KB</p>
            </div>
            ) : value ? (
            // File info (no preview)
            <div>
                <FileImage size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">{value.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(value.size / 1024).toFixed(1)} KB</p>
                <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                Remove
                </button>
            </div>
            ) : (
            // Upload prompt
            <div>
                <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 font-medium mb-1">
                {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">
                Max {maxSize}MB • {accept}
                </p>
            </div>
            )}
            </div>

        {(helperText || error) && (
            <div className='flex items-start gap-1.5 mt-1.5'>
                {error && <AlertCircle size={14} className='text-red-500 mt-0.5' />}
                <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>{error || helperText}
                </p>
            </div>
        )}
        </div>
    );
}