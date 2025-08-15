import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// AI training proje yolu
const AI_TRAINING_PATH = join(process.cwd(), 'ai-training');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: "Resim bulunamadı" },
        { status: 400 }
      );
    }

    // Dosya türünü kontrol et
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Geçersiz dosya türü. Sadece JPG, PNG, BMP veya WEBP kabul edilir." },
        { status: 400 }
      );
    }

    // Dosya boyutunu kontrol et (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya çok büyük. Maksimum 10MB kabul edilir." },
        { status: 400 }
      );
    }

    // Geçici dosya adı oluştur
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `upload_${timestamp}_${randomId}.${fileExtension}`;
    
    // Geçici klasörü oluştur
    const tempDir = join(AI_TRAINING_PATH, 'temp');
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      // Klasör zaten varsa hata yok say
    }

    // Dosyayı geçici olarak kaydet
    const filePath = join(tempDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log(`Resim geçici olarak kaydedildi: ${filePath}`);

    try {
      // AI modelini kullanarak analizi yap
      const analysisResult = await analyzeWithAIModel(filePath);
      
      // Geçici dosyayı temizle
      try {
        import('fs').then(fs => {
          fs.unlinkSync(filePath);
        }).catch(() => {
          // Ignore cleanup errors
        });
      } catch (cleanupError) {
        console.warn('Geçici dosya temizlenemedi:', cleanupError);
      }

      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        imagePath: `/temp/${fileName}`
      });

    } catch (aiError) {
      console.error('AI analizi hatası:', aiError);
      
      // Geçici dosyayı temizle
      try {
        import('fs').then(fs => {
          fs.unlinkSync(filePath);
        }).catch(() => {
          // Ignore cleanup errors
        });
      } catch (cleanupError) {
        console.warn('Geçici dosya temizlenemedi:', cleanupError);
      }

      // AI çalışmazsa fallback olarak basit çeviri yap
      const fallbackResult = await fallbackAnalysis();
      
      return NextResponse.json({
        success: true,
        analysis: fallbackResult,
        fallback: true,
        note: "AI modeli şu an kullanılamıyor, basit çeviri yapıldı."
      });
    }

  } catch (error) {
    console.error("Resim analizi hatası:", error);
    return NextResponse.json(
      { error: "Resim analizi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// AI modeli ile analiz fonksiyonu
async function analyzeWithAIModel(imagePath: string) {
  try {
    // AI training script'ini çalıştır
    const scriptPath = join(AI_TRAINING_PATH, 'scripts', 'analyze_image.js');
    
    // Node.js script'ini çalıştır
    const { stdout, stderr } = await execAsync(`node "${scriptPath}" "${imagePath}" --json`, {
      cwd: AI_TRAINING_PATH,
      timeout: 30000 // 30 saniye timeout
    });

    if (stderr) {
      console.warn('AI script stderr:', stderr);
    }

    // Script çıktısını parse et
    try {
      const result = JSON.parse(stdout);
      
      return {
        ottomanText: result.ottomanText || 'Tespit edilemedi',
        turkishTranslation: result.turkishTranslation || 'Çeviri yapılamadı',
        confidence: result.confidence || 0,
        totalAnalyzed: result.totalAnalyzed || 0,
        timestamp: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('AI çıktısı parse edilemedi:', parseError);
      throw new Error('AI çıktısı işlenemedi');
    }

  } catch (execError) {
    console.error('AI script çalıştırma hatası:', execError);
    throw execError;
  }
}

// Fallback analiz fonksiyonu (AI çalışmazsa kullanılır)
async function fallbackAnalysis() {
  // Basit bir çeviri simülasyonu
  // Gerçek uygulamada burada basit OCR veya pattern matching kullanılabilir
  
  return {
    ottomanText: 'Resimdeki Osmanlıca metin',
    turkishTranslation: 'Resimdeki Osmanlıca metin Türkçeye çevrilemedi. Lütfen daha net bir resim yükleyin veya metin çeviri bölümünü kullanın.',
    confidence: 0.5,
    totalAnalyzed: 0,
    timestamp: new Date().toISOString(),
    note: "Bu bir fallback analiz sonucudur. Daha iyi sonuçlar için AI modelini eğitin."
  };
}