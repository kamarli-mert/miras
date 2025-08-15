"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, X, Camera, FileImage, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  uploadedImage: string | null;
  isLoading?: boolean;
}

export function ImageUpload({ 
  onImageUpload, 
  onImageRemove, 
  uploadedImage, 
  isLoading = false 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Dosya türünü kontrol et
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Geçersiz Dosya Türü",
        description: "Lütfen JPG, PNG, BMP veya WEBP formatında resim yükleyin.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Dosya boyutunu kontrol et (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Dosya Çok Büyük",
        description: "Lütfen 10MB'dan küçük bir resim yükleyin.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    onImageUpload(file);
    toast({
      title: "Resim Yüklendi",
      description: "Resim başarıyla yüklendi. Analiz için hazır.",
      duration: 2000,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Resim Kaldırıldı",
      description: "Yüklenen resim kaldırıldı.",
      duration: 2000,
    });
  };

  return (
    <Card className="border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-cyan-950/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Resim Yükle
        </CardTitle>
        <CardDescription className="text-cyan-700 dark:text-cyan-300">
          Osmanlıca metin içeren resim yükleyin ve yapay zeka ile Türkçeye çevirin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedImage ? (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragOver 
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                : 'border-cyan-300 dark:border-cyan-700 hover:border-cyan-500'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/bmp,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isLoading}
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-cyan-400 dark:text-cyan-500" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-cyan-900 dark:text-cyan-100">
                  Resim Yükleyin
                </p>
                <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">
                  Sürükleyip bırakın veya tıklayarak seçin
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300">
                  JPG
                </Badge>
                <Badge variant="outline" className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300">
                  PNG
                </Badge>
                <Badge variant="outline" className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300">
                  BMP
                </Badge>
                <Badge variant="outline" className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300">
                  WEBP
                </Badge>
              </div>
              
              <p className="text-xs text-cyan-500 dark:text-cyan-400">
                Maksimum dosya boyutu: 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Yüklenen resim"
                className="w-full max-h-64 object-contain rounded-lg border border-cyan-200 dark:border-cyan-800"
              />
              <Button
                onClick={handleRemoveImage}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-cyan-700 dark:text-cyan-300">
                  Resim yüklendi
                </span>
              </div>
              
              <Button
                onClick={handleClick}
                variant="outline"
                size="sm"
                className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"
                disabled={isLoading}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Değiştir
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}