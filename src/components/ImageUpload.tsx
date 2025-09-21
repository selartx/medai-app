import React, { useState, useRef, useEffect } from 'react';
import { validateImageFile } from '../utils/aiHelper';

interface ImageUploadProps {
    onImageSelect: (imageData: { data: string; mimeType: string; name: string } | null) => void;
    selectedImage: { data: string; mimeType: string; name: string } | null;
}

// Helper function to compress image
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64Data = compressedDataUrl.split(',')[1];
            
            console.log('Image compressed:', {
                original: file.size,
                compressed: base64Data.length,
                reduction: Math.round((1 - base64Data.length / file.size) * 100) + '%'
            });
            
            resolve({
                data: base64Data,
                mimeType: 'image/jpeg'
            });
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, selectedImage }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPasteHint, setShowPasteHint] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Add clipboard paste functionality - works anywhere on the page
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            console.log('🎯 Paste event detected globally');
            
            // Check if we have image data in clipboard
            if (!e.clipboardData) {
                return;
            }

            const items = Array.from(e.clipboardData.items);
            const imageItem = items.find(item => item.type.startsWith('image/'));
            
            if (!imageItem) {
                console.log('📋 No image in clipboard, ignoring');
                return; // No image, let normal paste work
            }

            // We have an image! Check if we should handle it
            const activeElement = document.activeElement;
            const isTypingInTextarea = activeElement instanceof HTMLTextAreaElement;
            
            // If user is typing in textarea and has both text and image, let them choose
            if (isTypingInTextarea && e.clipboardData.getData('text/plain')) {
                console.log('� User has both text and image, letting them paste text');
                return; // User probably wants to paste text, not image
            }
            
            // If there's only an image or user isn't typing, handle the image
            console.log('🖼️ Processing image paste');
            e.preventDefault();
            e.stopPropagation();
            
            const file = imageItem.getAsFile();
            if (file) {
                console.log('📁 Image file found:', file.name, file.type, file.size);
                setShowPasteHint(true);
                setTimeout(() => setShowPasteHint(false), 2000);
                await handleFileSelect(file);
            }
        };

        // Listen globally on document
        console.log('🎧 Adding global paste listener');
        document.addEventListener('paste', handlePaste);

        return () => {
            console.log('🔇 Removing global paste listener');
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    const handleFileSelect = async (file: File) => {
        setUploading(true);
        
        try {
            console.log('Processing file:', file.name, file.type, file.size);
            
            // Validate the file
            const validation = validateImageFile(file);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            // Compress the image to reduce size
            console.log('Compressing image...');
            const compressed = await compressImage(file);
            
            console.log('Compressed base64 data length:', compressed.data.length);
            
            // Check if compressed size is still reasonable (aim for under 500KB base64)
            if (compressed.data.length > 500000) {
                console.log('Still too large, compressing further...');
                const moreCompressed = await compressImage(file, 600, 0.6);
                
                onImageSelect({
                    data: moreCompressed.data,
                    mimeType: moreCompressed.mimeType,
                    name: file.name
                });
            } else {
                onImageSelect({
                    data: compressed.data,
                    mimeType: compressed.mimeType,
                    name: file.name
                });
            }
            
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const removeImage = () => {
        onImageSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mb-2" ref={containerRef} tabIndex={0}>
            {/* Paste Hint - Only show briefly */}
            {showPasteHint && (
                <div className="mb-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded animate-pulse">
                    📋 Processing pasted image...
                </div>
            )}
            
            {selectedImage ? (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                            🏥 <span className="ml-1">{selectedImage.name}</span>
                        </span>
                        <button
                            onClick={removeImage}
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📋</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            Medical image ready for analysis
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        dragOver
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    
                    {uploading ? (
                        <div className="text-gray-500">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-1"></div>
                            <p className="text-sm">Compressing image...</p>
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                            <div className="text-2xl mb-1">🏥</div>
                            <p className="text-sm font-medium mb-1">Upload Medical Image</p>
                            <p className="text-xs">
                                Drag & drop, click, or <span className="font-medium text-blue-600 dark:text-blue-400">paste</span> anywhere
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {selectedImage && (
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    ⚠️ For educational purposes only. Not for actual medical diagnosis.
                </div>
            )}
        </div>
    );
};