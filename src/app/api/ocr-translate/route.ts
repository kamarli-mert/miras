import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// AI training proje yolu
const AI_TRAINING_PATH = join(process.cwd(), 'ai-training');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const text = formData.get('text') as string;

    if (!imageFile && !text) {
      return NextResponse.json(
        { error: "Resim veya metin gerekli" },
        { status: 400 }
      );
    }

    let extractedText = "";
    let ocrConfidence = 0.0;
    let ocrResult: any = null;

    // Eğer resim varsa OCR yap
    if (imageFile) {
      ocrResult = await performOCR(imageFile);
      extractedText = ocrResult.text;
      ocrConfidence = ocrResult.confidence;
    } else {
      extractedText = text;
      ocrConfidence = 1.0; // Metin zaten verildi
    }

    // Tesseract OCR sistemi sonucunu kullan
    if (ocrResult && ocrResult.translatedText) {
      return NextResponse.json({ 
        success: true, 
        originalImage: imageFile ? "image_provided" : "text_only",
        extractedText: extractedText,
        translatedText: ocrResult.translatedText,
        ocrConfidence: ocrConfidence,
        translationConfidence: 0.85, // Osmanlıca mapping güvenilir
        methodUsed: "tesseract_ottoman_ocr",
        processingTime: ocrResult.layerInfo?.processing_time || 0.0,
        aiModel: `OCR: ${ocrResult.ocrMethod || 'tesseract_ocr'} + Translation: ottoman_turkish_mapping`,
        layerInfo: ocrResult.layerInfo || {},
        timestamp: new Date().toISOString()
      });
    } else {
      // Sadece OCR sonucu varsa
      return NextResponse.json({ 
        success: true, 
        originalImage: imageFile ? "image_provided" : "text_only",
        extractedText: extractedText,
        translatedText: "Çeviri yapılamadı",
        ocrConfidence: ocrConfidence,
        translationConfidence: 0.0,
        methodUsed: "tesseract_ottoman_ocr_only",
        processingTime: ocrResult?.layerInfo?.processing_time || 0.0,
        aiModel: `OCR: ${ocrResult?.ocrMethod || 'tesseract_ocr'}`,
        layerInfo: ocrResult?.layerInfo || {},
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("OCR Translation error:", error);
    return NextResponse.json(
      { error: "OCR ve çeviri sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Tesseract OCR ile Osmanlıca metin tespit sistemi
async function performOCR(imageFile: File): Promise<{ text: string; confidence: number; translatedText?: string | null; ocrMethod?: string; translationMethod?: string; layerInfo?: any; method?: string }> {
  try {
    // Resmi geçici dosyaya kaydet
    const fs = await import('fs');
    const tempDir = join(AI_TRAINING_PATH, 'temp');
    const tempImagePath = join(tempDir, `ocr_image_${Date.now()}.jpg`);
    
    // Temp klasörü oluştur
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (error) {
      // Klasör zaten varsa hata yok say
    }
    
    // Resmi dosyaya yaz
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempImagePath, buffer);

    // Tesseract OCR sistemi kullan
    const ocrScriptPath = join(AI_TRAINING_PATH, 'tesseract_ottoman_ocr.py');
    
    const { stdout, stderr } = await execAsync(`python "${ocrScriptPath}" "${tempImagePath}"`, {
      cwd: AI_TRAINING_PATH,
      timeout: 60000, // 1 dakika timeout
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    if (stderr) {
      console.warn('OCR script stderr:', stderr);
    }

    // Geçici dosyayı temizle
    try {
      fs.unlinkSync(tempImagePath);
    } catch (cleanupError) {
      console.warn('Geçici resim dosyası temizlenemedi:', cleanupError);
    }

    // Script çıktısını işle
    try {
      const result = JSON.parse(stdout.trim());
      console.log("🔍 Tesseract OCR Script çıktısı:", result);
      
      if (result.success && result.extracted_text) {
        return {
          text: result.extracted_text,
          confidence: result.confidence || 0.8,
          translatedText: result.translated_text || null,
          method: result.method || "tesseract_ottoman_ocr",
          ocrMethod: "tesseract_ocr",
          translationMethod: "ottoman_turkish_mapping",
          layerInfo: {
            processing_time: result.processing_time || 0,
            text_regions_count: result.text_regions_count || 0,
            detected_language: "ottoman"
          }
        };
      } else if (result.error) {
        console.error("OCR hatası:", result.error);
        throw new Error(result.error);
      } else {
        console.error("OCR başarısız:", result);
        throw new Error("OCR başarısız");
      }
    } catch (parseError) {
      console.error('Tesseract OCR script çıktısı parse edilemedi:', parseError);
      console.error('Raw stdout:', stdout);
      throw new Error("OCR output parsing failed");
    }

  } catch (execError) {
    console.error('OCR script çalıştırma hatası:', execError);
    
    // Fallback: OCR hata mesajı
    return {
      text: "OCR işlemi başarısız oldu",
      confidence: 0.0,
      translatedText: null,
      method: "fallback_ocr"
    };
  }
}

// Osmanlıca metin çeviri sistemi (basit karakter mapping)
function translateOttomanText(text: string): string {
  const charMap: Record<string, string> = {
    // Temel harfler
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 's', 'ج': 'c', 'ح': 'h', 'خ': 'h',
    'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'ş', 'ص': 's',
    'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '', 'غ': 'ğ', 'ف': 'f', 'ق': 'k',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'v', 'ي': 'y',
    'ى': 'i', 'ة': 'e', 'آ': 'a', 'أ': 'a', 'إ': 'i', 'ؤ': 'ü', 'ئ': 'i',
    'ء': '', 'گ': 'g', 'پ': 'p', 'چ': 'ç', 'ژ': 'j',
    
    // Özel kombinasyonlar
    'ﻻ': 'la', 'ﷲ': 'allah', 'الله': 'allah', 'محمد': 'muhammed',
    'علي': 'ali', 'حسن': 'hasan', 'حسين': 'hüseyin', 'فاطمة': 'fatma',
    
    // Sayılar
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5',
    '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    
    // Noktalama işaretleri
    '،': ',', '؛': ';', '؟': '?', '!': '!', '۔': '.', 'ـ': '-'
  };

  let result = text;
  for (const [ottoman, turkish] of Object.entries(charMap)) {
    result = result.replace(new RegExp(ottoman, 'g'), turkish);
  }

  return result || "Çeviri yapılamadı";
} 