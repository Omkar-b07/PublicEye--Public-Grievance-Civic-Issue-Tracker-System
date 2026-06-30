import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onImageChange, selectedImage }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleFile = useCallback((file) => {
        // Only accept images
        if (!file.type.match('image.*')) {
            alert('Please upload an image file.');
            return;
        }
        onImageChange(file);
    }, [onImageChange]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        onImageChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Image</label>

            {selectedImage ? (
                <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                        src={typeof selectedImage === 'string' ? selectedImage : URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="h-64 object-contain w-full"
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-sm transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-colors flex flex-col items-center justify-center h-64 cursor-pointer
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleChange}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                            <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="font-medium text-gray-800 mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">SVG, PNG, JPG or GIF (max. 10MB)</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
