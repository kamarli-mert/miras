import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// AI training proje yolu
const AI_TRAINING_PATH = join(process.cwd(), 'ai-training');

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Metin gerekli" },
        { status: 400 }
      );
    }

    // Metin çeviri işlemi - Önce AI model dene, sonra mapping
    let translationResult;
    
    try {
      // AI model ile çeviri dene
      translationResult = await translateWithAIModel(text);
    } catch (aiError) {
      console.log("AI model başarısız, mapping'e geçiliyor:", aiError);
      // AI başarısızsa mapping kullan
      translationResult = await translateText(text);
    }

    return NextResponse.json({ 
      success: true, 
      originalText: text,
      translatedText: translationResult.translatedText,
      confidence: translationResult.confidence,
      methodUsed: translationResult.methodUsed,
      processingTime: translationResult.processingTime,
      aiModel: translationResult.aiModel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Text Translation error:", error);
    return NextResponse.json(
      { error: "Metin çeviri sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// AI model ile çeviri fonksiyonu
async function translateWithAIModel(text: string): Promise<any> {
  try {
    console.log("🚀 AI model çeviri başlatıldı:", text);
    
    // Geçici dosya oluştur
    const fs = await import('fs');
    const tempDir = join(AI_TRAINING_PATH, 'temp');
    const tempFilePath = join(tempDir, `translation_${Date.now()}.txt`);
    
    // Temp klasörü oluştur
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (error) {
      // Klasör zaten varsa hata yok say
    }
    
    // Metni dosyaya yaz
    fs.writeFileSync(tempFilePath, text);
    
    // AI model script'ini çalıştır
    const scriptPath = join(AI_TRAINING_PATH, 'advanced_ottoman_translator.py');
    const { stdout, stderr } = await execAsync(`python "${scriptPath}" "${tempFilePath}"`, {
      cwd: AI_TRAINING_PATH,
      timeout: 30000, // 30 saniye timeout
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    if (stderr) {
      console.warn('AI model script stderr:', stderr);
    }

    // Geçici dosyayı temizle
    try {
      fs.unlinkSync(tempFilePath);
    } catch (cleanupError) {
      console.warn('Geçici dosya temizlenemedi:', cleanupError);
    }

    // Script çıktısını işle
    const result = JSON.parse(stdout.trim());
    if (result.success && result.turkish_text) {
      return {
        translatedText: result.turkish_text,
        confidence: result.confidence || 0.9,
        methodUsed: "ai_model",
        processingTime: result.processing_time || 0.0,
        aiModel: "Advanced Ottoman Translator"
      };
    } else {
      throw new Error("AI model çeviri başarısız");
    }

  } catch (error) {
    console.error('AI model çeviri hatası:', error);
    throw error;
  }
}

// Basit mapping çeviri fonksiyonu
async function translateText(text: string): Promise<any> {
  try {
    console.log("🚀 Basit mapping çeviri başlatıldı:", text);
    
    // Mapping dosyasını oku
    const fs = await import('fs');
    const mappingPath = join(AI_TRAINING_PATH, 'merged_mapping.txt');
    
    if (!fs.existsSync(mappingPath)) {
      throw new Error("Mapping dosyası bulunamadı");
    }
    
    // Mapping'i yükle
    const mappingContent = fs.readFileSync(mappingPath, 'utf-8');
    const mapping: Record<string, string> = {};
    
    mappingContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && trimmed.includes('\t')) {
        const [ottoman, turkish] = trimmed.split('\t', 2);
        mapping[ottoman.trim()] = turkish.trim();
      }
    });
    
    // Önce tam cümle eşleşmesi ara
    let translatedText = "";
    
    if (mapping[text]) {
      // Tam cümle eşleşmesi bulundu
      translatedText = mapping[text];
    } else {
      // Yoksa kelime kelime çeviri yap
      const words = text.split(' ');
      const translatedWords = words.map(word => {
        return mapping[word] || `[${word}]`;
      });
      translatedText = translatedWords.join(' ');
    }
    
    return {
      translatedText: translatedText,
      confidence: 0.9,
      methodUsed: "direct_mapping",
      processingTime: 0.001,
      aiModel: "Direct Arabic Mapping"
    };

  } catch (error) {
    console.error('Mapping çeviri hatası:', error);
    
    // Fallback çeviri
    return {
      translatedText: "Çeviri yapılamadı",
      confidence: 0.0,
      methodUsed: "fallback",
      processingTime: 0.0,
      aiModel: "Fallback System"
    };
  }
}
