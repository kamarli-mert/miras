"use client";

import { useState } from "react";
import Link from "next/link";

interface TranslationResult {
  success: boolean;
  originalText: string;
  translatedText: string;
  confidence: number;
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

export default function TextTranslationPage() {
  const [ottomanText, setOttomanText] = useState("");
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exampleTexts = [
    {
      ottoman: "دفتردار حضرتلری خَزینَدن مُقَطَعَلَر ایچین حَرْجَمَه یَپَجَافِلَر",
      turkish: "Defterdar hazretleri hazineden mukataalar için harcama yapacaklar"
    },
    {
      ottoman: "السلام عليكم",
      turkish: "Selam aleyküm"
    },
    {
      ottoman: " الله ياردِم اَتسن، اشلرينز كولاي اولسون",
      turkish: "Allah yardım etsin, işleriniz kolay olsun."
    },
    {
      ottoman: "گونش بُگون چوق اركن دوغدو و هوا اسندى",
      turkish: "Güneş bugün çok erken doğdu ve hava ısındı."
    },
    {
      ottoman: "سنى چوق سَويوروم، قلبيم هپ سنى‌يله",
      turkish: "Hayırlı sabahlar, gününüz bereketli olsun."
    },
    {
      ottoman: "گجه يلدزلر پارليور، كوك‌يُزى چوق كوزَل كورونيو‌ر",
      turkish: "Gece yıldızlar parlıyor, gökyüzü çok güzel görünüyor."
    },
    {
      ottoman: "همن كليوروم، صادجه اشيمى بترَيَيم",
      turkish: "Şükürler olsun, bugün işlerim yolunda gitti."
    },
  ];

  const handleTranslate = async () => {
    if (!ottomanText.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/text-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: ottomanText }),
      });
      
      const data = await response.json();
      if (data.success) {
        setTranslationResult(data);
      } else {
        setTranslationResult({
          success: false,
          originalText: ottomanText,
          translatedText: "Çeviri yapılamadı",
          confidence: 0,
          methodUsed: "error",
          processingTime: 0,
          aiModel: "Error",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setTranslationResult({
        success: false,
        originalText: ottomanText,
        translatedText: "Çeviri sırasında hata oluştu",
        confidence: 0,
        methodUsed: "error",
        processingTime: 0,
        aiModel: "Error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setOttomanText("");
    setTranslationResult(null);
  };

  const loadExample = (example: { ottoman: string; turkish: string }) => {
    setOttomanText(example.ottoman);
    setTranslationResult({
      success: true,
      originalText: example.ottoman,
      translatedText: example.turkish,
      confidence: 0.95,
      methodUsed: "pre_translated_example",
      processingTime: 0.001,
      aiModel: "Multi-Layer Translation System",
      layerInfo: {
        layer1: "ottoman_turkish_mapping.txt",
        layer2: "oe_tr.txt",
        layer3: "character_mapping"
      },
      timestamp: new Date().toISOString()
    });
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
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  Çok Katmanlı AI
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-blue-100">
              <span className="text-3xl">📝</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Osmanlıca Metin Çevirisi</h2>
            <p className="text-lg text-gray-600">Çok katmanlı yapay zeka ile Osmanlıca metinleri Türkçeye çevirin</p>
          </div>

          {/* Example Texts */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Örnek Metinler</h3>
            <div className="flex flex-wrap gap-2">
              {exampleTexts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(example)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                >
                  {example.ottoman.length > 15 ? `${example.ottoman.substring(0, 15)}...` : example.ottoman}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Herhangi bir örnek metne tıklayarak seçebilir ve "Çevir" butonuyla Türkçe çevirisini görebilirsiniz.
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-900">
                Osmanlıca Metin
              </label>
              <span className="text-xs text-gray-500">
                {ottomanText.length} karakter
              </span>
            </div>
            <textarea
              placeholder="Osmanlıca metninizi buraya yazın..."
              value={ottomanText}
              onChange={(e) => setOttomanText(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mb-8">
            <button
              onClick={handleTranslate}
              disabled={!ottomanText.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg"
            >
              {isLoading ? "Çevriliyor..." : "Çevir"}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            >
              Temizle
            </button>
          </div>

          {/* Output Section */}
          {translationResult && (
            <div className="space-y-6">
              {/* Translation Result */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-900">
                    Türkçe Çeviri
                  </label>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(translationResult.methodUsed)}`}>
                      {translationResult.methodUsed === "multi_layer_translation" ? "Çok Katmanlı" : 
                       translationResult.methodUsed === "hybrid_ocr_translation" ? "Hibrit OCR + AI" : 
                       translationResult.methodUsed === "fallback_character_mapping" ? "Karakter Çeviri" : "Temel"}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(translationResult.confidence)}`}>
                      %{Math.round(translationResult.confidence * 100)} Güven
                    </span>
                  </div>
                </div>
                <div className="min-h-[120px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-900 leading-relaxed">
                    {translationResult.translatedText}
                  </p>
                </div>
              </div>

              {/* Translation Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Çeviri Detayları</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yöntem:</span>
                      <span className="font-medium">{translationResult.methodUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Güven:</span>
                      <span className={`font-medium ${getConfidenceColor(translationResult.confidence)}`}>
                        %{Math.round(translationResult.confidence * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Süre:</span>
                      <span className="font-medium">{(translationResult.processingTime * 1000).toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{translationResult.aiModel}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Katman Bilgileri</h4>
                  <div className="text-sm text-gray-600">
                    {translationResult.layerInfo ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>1. Katman:</span>
                          <span className={`font-medium ${getLayerStatus(translationResult.layerInfo.layer1)}`}>
                            {translationResult.layerInfo.layer1 === "failed" ? "Başarısız" : "Aktif"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>2. Katman:</span>
                          <span className={`font-medium ${getLayerStatus(translationResult.layerInfo.layer2)}`}>
                            {translationResult.layerInfo.layer2 === "failed" ? "Başarısız" : "Aktif"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>3. Katman:</span>
                          <span className={`font-medium ${getLayerStatus(translationResult.layerInfo.layer3)}`}>
                            {translationResult.layerInfo.layer3 === "failed" ? "Başarısız" : "Aktif"}
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
                        <span className="font-medium">Çok Katmanlı</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zaman:</span>
                        <span className="font-medium">{new Date(translationResult.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

                     {/* Empty State */}
           {!translationResult && (
             <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-medium text-gray-900">
                   Türkçe Çeviri
                 </label>
               </div>
               <div className="min-h-[120px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                 <p className="text-gray-400 italic">
                   Çeviri sonucu burada görünecektir...
                 </p>
               </div>
             </div>
           )}

           {/* Gelişmiş Çok Katmanlı Çeviri Sistemi */}
           <div className="mt-12">
             <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border-2 border-blue-200">
               <div className="flex items-center mb-4">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mr-4">
                   <span className="text-2xl">🚀</span>
                 </div>
                 <h3 className="text-2xl font-bold text-blue-900">Gelişmiş Çok Katmanlı Çeviri Sistemi</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Katmanlar */}
                 <div className="space-y-4">
                   <h4 className="text-lg font-semibold text-blue-800 mb-3">Sistem Katmanları</h4>
                   
                   <div className="space-y-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                       <div>
                         <div className="font-medium text-blue-900">Ottoman-Turkish Mapping</div>
                         <div className="text-sm text-blue-700">12,790 kelime</div>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                       <div>
                         <div className="font-medium text-blue-900">OE-TR Mapping</div>
                         <div className="text-sm text-blue-700">60,916 kelime</div>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                       <div>
                         <div className="font-medium text-blue-900">Pozisyonel Farkındalıkla Çeviri</div>
                         <div className="text-sm text-blue-700">Akıllı konum analizi</div>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                       <div>
                         <div className="font-medium text-blue-900">Karakter Karakter Çeviri</div>
                         <div className="text-sm text-blue-700">Temel karakter dönüşümü</div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Özellikler */}
                 <div>
                   <h4 className="text-lg font-semibold text-blue-800 mb-3">Sistem Özellikleri</h4>
                   <div className="space-y-2">
                     <div className="flex items-center space-x-2">
                       <span className="text-blue-600">•</span>
                       <span className="text-blue-900">Harflerin pozisyonel değişimleri</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-blue-600">•</span>
                       <span className="text-blue-900">Özel kelime tanıma</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-blue-600">•</span>
                       <span className="text-blue-900">Akıllı eşleştirme</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-blue-600">•</span>
                       <span className="text-blue-900">Çok katmanlı doğrulama</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-blue-600">•</span>
                       <span className="text-blue-900">Yüksek doğruluk oranı</span>
                     </div>
                   </div>
                   
                   <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                     <div className="text-sm text-blue-800">
                       <strong>Toplam Kelime Veritabanı:</strong> 73,706 kelime
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
              <Link href="/text-translation" className="flex flex-col items-center space-y-1 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-medium">Metin Çeviri</span>
              </Link>
              <Link href="/image-translation" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
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
