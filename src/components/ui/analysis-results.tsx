"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Eye, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  Download,
  RefreshCw,
  BarChart3,
  Languages,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  ottomanText?: string;
  turkishTranslation?: string;
  characters?: Array<{
    character: string;
    confidence: number;
    probability?: number;
  }>;
  confidence: number;
  topPrediction?: string;
  totalAnalyzed: number;
  timestamp: string;
  fallback?: boolean;
  note?: string;
}

interface AnalysisResultsProps {
  results: AnalysisResult | null;
  isLoading: boolean;
  onAnalyzeAgain: () => void;
}

export function AnalysisResults({ results, isLoading, onAnalyzeAgain }: AnalysisResultsProps) {
  const { toast } = useToast();

  const handleCopyResults = async () => {
    if (!results) return;

    const text = `Osmanlıca Resim Çeviri Sonuçları

Tespit Edilen Osmanlıca Metin: ${results.ottomanText || 'Tespit edilemedi'}
Türkçe Çeviri: ${results.turkishTranslation || 'Çeviri yapılamadı'}
Güven Seviyesi: ${(results.confidence * 100).toFixed(1)}%
Analiz Edilen Karakter: ${results.totalAnalyzed}

Analiz Tarihi: ${new Date(results.timestamp).toLocaleString('tr-TR')}
${results.note ? `\nNot: ${results.note}` : ''}`;

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopyalandı",
        description: "Çeviri sonuçları panoya kopyalandı.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız oldu.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleCopyTranslation = async () => {
    if (!results?.turkishTranslation) return;

    try {
      await navigator.clipboard.writeText(results.turkishTranslation);
      toast({
        title: "Çeviri Kopyalandı",
        description: "Türkçe çeviri panoya kopyalandı.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız oldu.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownloadReport = () => {
    if (!results) return;

    const report = `Osmanlıca Resim Çeviri Raporu
====================================

Analiz Tarihi: ${new Date(results.timestamp).toLocaleString('tr-TR')}
Analiz Yöntemi: ${results.fallback ? 'Yapay Zeka Çevirisi' : 'AI Modeli'}

ÖZET SONUÇLAR
---------------
Tespit Edilen Osmanlıca Metin: ${results.ottomanText || 'Tespit edilemedi'}
Türkçe Çeviri: ${results.turkishTranslation || 'Çeviri yapılamadı'}
Genel Güven Seviyesi: ${(results.confidence * 100).toFixed(1)}%
Analiz Edilen Karakter Sayısı: ${results.totalAnalyzed}

DETAYLI BİLGİLER
----------------
${results.ottomanText ? `Orijinal Metin: ${results.ottomanText}` : 'Orijinal metin tespit edilemedi'}
${results.turkishTranslation ? `Çeviri: ${results.turkishTranslation}` : 'Çeviri yapılamadı'}

PERFORMANS METRİKLERİ
--------------------
- Güven Seviyesi: ${(results.confidence * 100).toFixed(1)}%
- Analiz Edilen Karakter: ${results.totalAnalyzed}
- Çeviri Durumu: ${results.turkishTranslation ? 'Başarılı' : 'Başarısız'}

${results.note ? `\nNOT: ${results.note}` : ''}
${results.fallback ? '\nBİLGİ: Bu sonuç yapay zeka çevirisi ile elde edilmiştir.' : ''}

Rapor oluşturulma tarihi: ${new Date().toLocaleString('tr-TR')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osmanlica_ceviri_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Rapor İndirildi",
      description: "Çeviri raporu başarıyla indirildi.",
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <Card className="border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-cyan-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Çeviri Yapılıyor...
          </CardTitle>
          <CardDescription className="text-cyan-700 dark:text-cyan-300">
            Yapay zeka resminizdeki Osmanlıca metni Türkçeye çeviriyor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cyan-700 dark:text-cyan-300">İşleniyor...</span>
              <span className="text-sm text-cyan-700 dark:text-cyan-300">%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Resim ön işleniyor...
            </div>
            <div className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Metin tespit ediliyor...
            </div>
            <div className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Türkçeye çevriliyor...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-cyan-950/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Çeviri Sonuçları
          </CardTitle>
          <CardDescription className="text-cyan-700 dark:text-cyan-300">
            Yukarıya bir resim yükleyerek çeviri yapabilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Languages className="h-16 w-16 text-cyan-400 dark:text-cyan-500 mx-auto mb-4" />
            <p className="text-cyan-600 dark:text-cyan-400">
              Henüz çeviri yapılmadı
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-cyan-200 dark:border-cyan-800 bg-white/80 dark:bg-cyan-950/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Çeviri Sonuçları
        </CardTitle>
        <CardDescription className="text-cyan-700 dark:text-cyan-300">
          Yapay zeka tarafından yapılan Osmanlıca-Türkçe çeviri
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="text-lg font-bold text-cyan-900 dark:text-cyan-100">
              {results.ottomanText ? 'Var' : 'Yok'}
            </div>
            <div className="text-sm text-cyan-600 dark:text-cyan-400">
              Osmanlıca Metin
            </div>
          </div>
          
          <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
              {(results.confidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-cyan-600 dark:text-cyan-400">
              Güven Seviyesi
            </div>
          </div>
          
          <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
              {results.totalAnalyzed}
            </div>
            <div className="text-sm text-cyan-600 dark:text-cyan-400">
              Karakter
            </div>
          </div>
        </div>

        {/* Fallback Uyarısı */}
        {results.fallback && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Yapay Zeka Çevirisi
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {results.note || "Bu sonuç yapay zeka ile elde edilmiştir. Daha iyi sonuçlar için AI modelini eğitin."}
              </p>
            </div>
          </div>
        )}

        {/* Osmanlıca Metin */}
        {results.ottomanText && (
          <div className="space-y-3">
            <h3 className="font-medium text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tespit Edilen Osmanlıca Metin
            </h3>
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <p className="text-cyan-900 dark:text-cyan-100 text-lg leading-relaxed" dir="rtl">
                {results.ottomanText}
              </p>
            </div>
          </div>
        )}

        {/* Türkçe Çeviri */}
        {results.turkishTranslation && (
          <div className="space-y-3">
            <h3 className="font-medium text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Türkçe Çeviri
            </h3>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-start gap-3">
                <p className="text-green-900 dark:text-green-100 text-lg leading-relaxed flex-1">
                  {results.turkishTranslation}
                </p>
                <Button
                  onClick={handleCopyTranslation}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 h-8 px-2 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* İşlem Butonları */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-cyan-200 dark:border-cyan-800">
          <Button
            onClick={handleCopyResults}
            variant="outline"
            className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sonuçları Kopyala
          </Button>
          
          <Button
            onClick={handleDownloadReport}
            variant="outline"
            className="border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900"
          >
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
          
          <Button
            onClick={onAnalyzeAgain}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yeniden Çevir
          </Button>
        </div>

        {/* Analiz Bilgisi */}
        <div className="text-xs text-cyan-500 dark:text-cyan-400 pt-2 border-t border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-3 w-3" />
            Çeviri Tarihi: {new Date(results.timestamp).toLocaleString('tr-TR')}
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3" />
            Çeviri Yöntemi: {results.fallback ? 'Yapay Zeka' : 'AI Modeli'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}