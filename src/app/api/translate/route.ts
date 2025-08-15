import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir metin gerekli' },
        { status: 400 }
      );
    }

    // Geçici dosya oluştur
    const tempDir = path.join(process.cwd(), 'ai-training', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `input_${timestamp}.txt`);
    const outputFile = path.join(tempDir, `output_${timestamp}.txt`);

    // Giriş dosyasını yaz
    fs.writeFileSync(inputFile, text, 'utf8');

    // Python script'ini çalıştır - YENİ SİSTEM
    const scriptPath = path.join(process.cwd(), 'ai-training', 'advanced_ottoman_translator.py');
    const command = `python "${scriptPath}" "${inputFile}"`;

    console.log('🚀 YENİ Advanced Ottoman Translator çalıştırılıyor:', command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 60000, // 60 saniye timeout
        cwd: path.join(process.cwd(), 'ai-training'), // Working directory'i ayarla
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' } // Encoding ayarı
      });

      if (stderr) {
        console.error('Python script stderr:', stderr);
      }

      // YENİ SİSTEM: JSON çıktısını işle
      let translationResult = '';
      let layerInfo = '';
      let methodUsed = '';
      let aiModel = '';
      let confidence = 0;
      let processingTime = 0;

      console.log('Python stdout:', stdout);
      
      try {
        const result = JSON.parse(stdout.trim());
        if (result.success && result.turkish_text) {
          translationResult = result.turkish_text;
          confidence = result.confidence || 0.0;
          methodUsed = result.method_used || "advanced_ottoman_translator";
          aiModel = result.ai_model || "Advanced Ottoman Translator";
          layerInfo = JSON.stringify(result.layer_info || {});
          processingTime = result.processing_time || 0.0;
        } else {
          throw new Error("Yeni sistem çeviri başarısız");
        }
      } catch (parseError) {
        console.error('Yeni sistem JSON parse hatası:', parseError);
        translationResult = '';
      }

      // Geçici dosyaları temizle
      try {
        fs.unlinkSync(inputFile);
      } catch (cleanupError) {
        console.error('Dosya temizleme hatası:', cleanupError);
      }

      // Eğer çeviri başarısızsa, gelişmiş fallback sistemi kullan
      if (!translationResult) {
        console.log('AI çeviri başarısız, gelişmiş fallback sistemi kullanılıyor...');
        
        // Gelişmiş fallback sistemi - Akıllı karakter tanıma
        translationResult = text
          .split('')
          .map(char => {
            // Gelişmiş karakter mapping
            const advancedCharMap: { [key: string]: string } = {
              // Temel Osmanlıca karakterler
              'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'c', 'چ': 'ç',
              'ح': 'h', 'خ': 'h', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's',
              'ش': 'ş', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'ğ',
              'ف': 'f', 'ق': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
              'و': 'u', 'ه': 'h', 'ی': 'i', 'ي': 'i', 'ى': 'i',
              'ة': 'e', 'ء': '', 'ئ': 'i', 'ؤ': 'ü', 'آ': 'a', 'أ': 'a', 'إ': 'i',
              
              // Özel karakterler
              'ژ': 'j', 'ک': 'k', 'څ': 'c', 'ځ': 'c', 'ډ': 'd', 'ڊ': 'd', 'ڋ': 'd',
              'ڌ': 'd', 'ڍ': 'd', 'ڎ': 'd', 'ڏ': 'd', 'ڐ': 'd', 'ڑ': 'r', 'ڒ': 'r',
              'ړ': 'r', 'ڔ': 'r', 'ڕ': 'r', 'ږ': 'r', 'ڗ': 'r', 'ڙ': 'r', 'ښ': 's',
              'ڛ': 's', 'ڜ': 's', 'ڝ': 's', 'ڞ': 's', 'ڟ': 't', 'ڠ': 'n', 'ڡ': 'f',
              'ڢ': 'f', 'ڣ': 'f', 'ڤ': 'v', 'ڥ': 'v', 'ڦ': 'p', 'ڧ': 'q', 'ڨ': 'q',
              'ڪ': 'k', 'ګ': 'k', 'ڬ': 'k', 'ڭ': 'k', 'ڮ': 'k', 'ڰ': 'g', 'ڱ': 'g',
              'ڲ': 'g', 'ڳ': 'g', 'ڴ': 'g', 'ڵ': 'l', 'ڶ': 'l', 'ڷ': 'l', 'ڸ': 'l',
              'ڹ': 'n', 'ں': 'n', 'ڻ': 'n', 'ڼ': 'n', 'ڽ': 'n', 'ھ': 'h', 'ڿ': 'h',
              'ہ': 'h', 'ۂ': 'h', 'ۃ': 'h', 'ۄ': 'v', 'ۅ': 'v', 'ۆ': 'v', 'ۇ': 'u',
              'ۈ': 'ü', 'ۉ': 'u', 'ۊ': 'v', 'ۋ': 'v', 'ۍ': 'i', 'ێ': 'i', 'ۏ': 'v',
              'ې': 'e', 'ۑ': 'i', 'ے': 'e', 'ۓ': 'e',
              
              // Noktalama işaretleri
              '،': ',', '؛': ';', '؟': '?', '۔': '.',
              
              // Vurgu işaretleri
              'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ّ': '', 'ْ': '', 'ٰ': 'a',
              'ٱ': 'a', 'ٲ': 'a', 'ٳ': 'a', 'ٴ': 'a', 'ٵ': 'a', 'ٶ': 'u',
              'ٷ': 'u', 'ٸ': 'i', 'ٹ': 't', 'ٺ': 't', 'ٻ': 'b', 'ټ': 't',
              'ٽ': 't', 'ٿ': 't', 'ڀ': 'b', 'ڂ': 'c', 'ڃ': 'c', 'ڄ': 'c',
              'ڇ': 'c', 'ڈ': 'd',
            };
            
            return advancedCharMap[char] || char;
          })
          .join('');
        
        layerInfo = 'Gelişmiş fallback karakter çevirisi';
        methodUsed = 'advanced_fallback_translation';
        aiModel = 'Advanced Fallback System';
        confidence = 0.5; // Fallback için düşük güven
      }

      processingTime = Date.now() - timestamp;

      return NextResponse.json({
        originalText: text,
        translatedText: translationResult,
        layerInfo: layerInfo || 'Gelişmiş çok katmanlı AI çeviri sistemi',
        methodUsed: methodUsed || 'advanced_ai_multi_layer_translation',
        aiModel: aiModel || 'Advanced Multi-Layer AI Translation System',
        confidence: confidence,
        processingTime: processingTime,
        success: true
      });

    } catch (execError) {
      console.error('Python script çalıştırma hatası:', execError);
      
      // Son çare fallback sistemi
      let fallbackResult = text
        .split('')
        .map(char => {
          const basicCharMap: { [key: string]: string } = {
            'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'c', 'چ': 'ç',
            'ح': 'h', 'خ': 'h', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's',
            'ش': 'ş', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'ğ',
            'ف': 'f', 'ق': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
            'و': 'u', 'ه': 'h', 'ی': 'i', 'ي': 'i', 'ى': 'i',
            'ة': 'e', 'ء': '', 'ئ': 'i', 'ؤ': 'ü', 'آ': 'a', 'أ': 'a', 'إ': 'i',
          };
          return basicCharMap[char] || char;
        })
        .join('');

      return NextResponse.json({
        originalText: text,
        translatedText: fallbackResult,
        layerInfo: 'Son çare basit karakter çevirisi',
        methodUsed: 'emergency_fallback_translation',
        aiModel: 'Emergency Fallback System',
        confidence: 0.1,
        processingTime: Date.now() - timestamp,
        success: true
      });
    }

  } catch (error) {
    console.error('Çeviri hatası:', error);
    return NextResponse.json(
      { 
        error: 'Çeviri sırasında hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}