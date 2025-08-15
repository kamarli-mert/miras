"use client";

import { useState } from "react";
import Link from "next/link";

interface OCRResult {
  success: boolean;
  originalImage: string;
  extractedText: string;
  translatedText: string;
  ocrConfidence: number;
  translationConfidence: number;
  methodUsed: string;
  processingTime: number;
  aiModel: string;
  layerInfo?: {
    layer1: string;
    layer2: string;
    layer3: string;
  };
  timestamp: string;
}

export default function ImageTranslationPage() {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleOcrTranslate = async () => {
    if (!selectedImage) return;
    
    setIsOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const response = await fetch('/api/ocr-translate', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        setOcrResult(data);
      } else {
        setOcrResult({
          success: false,
          originalImage: "image_provided",
          extractedText: "OCR başarısız",
          translatedText: "Çeviri yapılamadı",
          ocrConfidence: 0,
          translationConfidence: 0,
          methodUsed: "error",
          processingTime: 0,
          aiModel: "Error",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setOcrResult({
        success: false,
        originalImage: "image_provided",
        extractedText: "OCR sırasında hata oluştu",
        translatedText: "Çeviri yapılamadı",
        ocrConfidence: 0,
        translationConfidence: 0,
        methodUsed: "error",
        processingTime: 0,
        aiModel: "Error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleClearOcr = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOcrResult(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Resim önizlemesi oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "multi_layer_translation":
        return "bg-blue-100 text-blue-800";
      case "fallback_character_mapping":
        return "bg-yellow-100 text-yellow-800";
      case "pre_translated_example":
        return "bg-green-100 text-green-800";
      case "hybrid_ocr_translation":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLayerStatus = (layer: string | undefined) => {
    if (!layer) return "text-gray-600";
    if (layer === "failed") return "text-red-600";
    if (layer.includes("mapping") || layer.includes(".txt")) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">MİRAS</h1>
              <img src="/miras.png" alt="Padişah" className="w-12 h-16 object-contain" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sistem:</span>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                  OCR + AI
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-indigo-100">
              <span className="text-3xl">📷</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">OCR Resim Çeviri</h2>
            <p className="text-lg text-gray-600">Osmanlıca metin içeren resimleri yükleyin ve otomatik çeviri yapın</p>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-900">
                Osmanlıca Metin İçeren Resim
              </label>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <div>
                    <img 
                      src={imagePreview} 
                      alt="Seçilen resim" 
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-md mb-2"
                    />
                    <p className="text-gray-600 mb-2">
                      {selectedImage?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Başka resim seçmek için tıklayın
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 mb-2">
                      Resim seçmek için tıklayın
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, JPEG dosyaları desteklenir
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={handleOcrTranslate}
              disabled={!selectedImage || isOcrLoading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg"
            >
              {isOcrLoading ? "İşleniyor..." : "OCR & Çevir"}
            </button>
            <button
              onClick={handleClearOcr}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            >
              Temizle
            </button>
          </div>

          {/* OCR Output Section */}
          {ocrResult && (
            <div className="space-y-6">
              {/* Extracted Text */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Çıkarılan Osmanlıca Metin
                </label>
                <div className="min-h-[80px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-900 leading-relaxed">
                    {ocrResult.extractedText}
                  </p>
                </div>
              </div>

              {/* Translation Result */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-900">
                    Türkçe Çeviri
                  </label>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(ocrResult.methodUsed)}`}>
                      {ocrResult.methodUsed === "multi_layer_translation" ? "Çok Katmanlı" : 
                       ocrResult.methodUsed === "hybrid_ocr_translation" ? "Hibrit OCR + AI" : 
                       ocrResult.methodUsed === "fallback_character_mapping" ? "Karakter Çeviri" : "Temel"}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(ocrResult.translationConfidence)}`}>
                      %{Math.round(ocrResult.translationConfidence * 100)} Güven
                    </span>
                  </div>
                </div>
                <div className="min-h-[120px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-900 leading-relaxed">
                    {ocrResult.translatedText}
                  </p>
                </div>
              </div>

              {/* OCR Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">OCR Detayları</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">OCR Güven:</span>
                      <span className={`font-medium ${getConfidenceColor(ocrResult.ocrConfidence)}`}>
                        %{Math.round(ocrResult.ocrConfidence * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Çeviri Güven:</span>
                      <span className={`font-medium ${getConfidenceColor(ocrResult.translationConfidence)}`}>
                        %{Math.round(ocrResult.translationConfidence * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Süre:</span>
                      <span className="font-medium">{(ocrResult.processingTime * 1000).toFixed(1)}ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Katman Bilgileri</h4>
                  <div className="text-sm text-gray-600">
                    {ocrResult.layerInfo ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>1. Katman:</span>
                          <span className={`font-medium ${getLayerStatus(ocrResult.layerInfo.layer1)}`}>
                            {ocrResult.layerInfo.layer1 === "failed" ? "Başarısız" : "Aktif"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Katman:</span>
                          <span className={`font-medium ${getLayerStatus(ocrResult.layerInfo.layer2)}`}>
                            {ocrResult.layerInfo.layer2 === "failed" ? "Başarısız" : "Aktif"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>3. Katman:</span>
                          <span className={`font-medium ${getLayerStatus(ocrResult.layerInfo.layer3)}`}>
                            {ocrResult.layerInfo.layer3 === "failed" ? "Başarısız" : "Aktif"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Katman bilgisi mevcut değil</span>
                    )}
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Sistem Bilgisi</h4>
                  <div className="text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Durum:</span>
                        <span className="font-medium text-green-600">Aktif</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sistem:</span>
                        <span className="font-medium">OCR + Çok Katmanlı</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zaman:</span>
                        <span className="font-medium">{new Date(ocrResult.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!ocrResult && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-900">
                  OCR Sonucu
                </label>
              </div>
              <div className="min-h-[120px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-400 italic">
                  OCR ve çeviri sonucu burada görünecektir...
                </p>
              </div>
            </div>
          )}

          {/* OCR ve AI/ML Özellikleri */}
          <div className="mt-12 space-y-4">
            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mr-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900">OCR (Optik Karakter Tanıma)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-green-800 mb-3">Desteklenen Formatlar</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">JPG, PNG, GIF, WebP</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Maksimum Boyut: 10MB</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Osmanlıca metin tanıma + Çeviri</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Yüksek çözünürlük desteği</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-green-800 mb-3">OCR Özellikleri</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Gelişmiş ön işleme</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Çoklu eşik analizi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Akıllı morfoloji</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">•</span>
                      <span className="text-green-900">Karakter segmentasyonu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mr-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-900">AI/ML Özellikleri</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">Karakter Tanıma</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">TensorFlow CNN Modeli</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Eğitim Verisi: 100,000+ Osmanlıca karakter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Doğruluk: %87.76 karakter tanıma</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">66 farklı karakter sınıfı</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Pozisyonel Analiz (Başta/Orta/Sonda)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">Gelişmiş Özellikler</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Gelişmiş ön işleme algoritmaları</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Çoklu eşik analizi (Multi-threshold)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Akıllı morfoloji işleme</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Karakter segmentasyonu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-purple-900">Tesseract OCR entegrasyonu</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <div className="text-sm text-purple-800">
                      <strong>Model Durumu:</strong> trained_fixed_model.h5 - Eğitilmiş ve optimize edilmiş
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      <strong>Son Güncelleme:</strong> 87.76% doğruluk oranı ile test edildi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around py-4">
                             <Link href="/" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">Yol Haritası</span>
              </Link>
              <Link href="/text-translation" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-medium">Metin Çeviri</span>
              </Link>
              <Link href="/image-translation" className="flex flex-col items-center space-y-1 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium">Görsel Çeviri</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
