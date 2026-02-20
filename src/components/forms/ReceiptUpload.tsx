'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReceiptUploadProps {
  cardToken: string;
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError: (error: string) => void;
}

export function ReceiptUpload({ cardToken, onUploadSuccess, onUploadError }: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      onUploadError('حجم الملف يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }
    
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('cardToken', cardToken);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        onUploadSuccess(data.receiptImage);
      } else {
        onUploadError(data.error || 'فشل في رفع الإيصال');
      }
    } catch {
      onUploadError('حدث خطأ أثناء رفع الإيصال');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300',
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          )}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3 p-6">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
              isDragging ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
            )}>
              <Upload className="w-8 h-8" />
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">
                اسحب صورة الإيصال هنا
              </p>
              <p className="text-sm text-gray-500 mt-1">
                أو اضغط لاختيار الملف
              </p>
            </div>
            
            <p className="text-xs text-gray-400">
              PNG, JPG, JPEG (حد أقصى 5MB)
            </p>
          </div>
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="معاينة الإيصال"
            className="w-full h-48 object-contain rounded-2xl border-2 border-gray-200"
          />
          
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-2 left-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full flex items-center gap-1">
            <Check className="w-4 h-4" />
            جاهز للرفع
          </div>
        </div>
      )}
      
      {preview && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5 mr-2" />
              رفع الإيصال
            </>
          )}
        </Button>
      )}
    </div>
  );
}
