#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Karakter eşleştirme veritabanı
const characterMap = {
  // Harfler
  'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 's', 'ج': 'c', 'ح': 'h',
  'خ': 'h', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's',
  'ش': 'ş', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '',
  'غ': 'ğ', 'ف': 'f', 'ق': 'k', 'ك': 'k', 'ل': 'l', 'م': 'm',
  'ن': 'n', 'ه': 'h', 'و': 'v', 'ي': 'i', 'ء': '', 'ؤ': 'ü',
  'ئ': 'i', 'آ': 'a', 'أ': 'a', 'إ': 'i', 'ة': 'e', 'ى': 'i',
  'چ': 'ç', 'ژ': 'j', 'پ': 'p', 'گ': 'g',
  
  // Özel karakterler ve kelimeler
  'ﷲ': 'allah', 'ﻻ': 'la', 'كلمه': 'kelime', 'حسن': 'güzel',
  'كبير': 'büyük', 'صغير': 'küçük', 'جميل': 'güzel', 'قبيح': 'çirkin',
  'حمد': 'hamd', 'شكر': 'teşekkür', 'سلام': 'selam', 'مرحبا': 'merhaba',
  'الله': 'allah', 'رب': 'rab', 'عالم': 'dünya', 'انسان': 'insan',
  'كتاب': 'kitap', 'قلم': 'kalem', 'مدرسة': 'okul', 'بيت': 'ev',
  'باب': 'kapı', 'نافذة': 'pencere', 'شمس': 'güneş', 'قمر': 'ay',
  'نجمة': 'yıldız', 'سماء': 'gök', 'ارض': 'toprak', 'ماء': 'su',
  'نار': 'ateş', 'هواء': 'hava', 'ريح': 'rüzgar', 'شجر': 'ağaç',
  'زهرة': 'çiçek', 'فاكهة': 'meyve', 'خبز': 'ekmek', 'لحم': 'et',
  'سمك': 'balık', 'دجاج': 'tavuk', 'حليب': 'süt', 'شاي': 'çay',
  'قهوة': 'kahve', 'سكر': 'şeker', 'ملح': 'tuz', 'زيت': 'yağ'
};

// Kelime çeviri veritabanı
const wordTranslations = {
  // İfadeler ve cümleler
  'كلمه حسنه صدقه': 'Güzel bir söz sadakadır.',
  'الحمد لله رب العالمين': 'Hamd alemlerin rabbi olan Allah\'adır.',
  'بسم الله الرحمن الرحيم': 'Rahman ve Rahim olan Allah\'ın adıyla.',
  'السلام عليكم ورحمة الله': 'Size ve Allah\'ın rahmeti selam olsun.',
  'في سبيل الله': 'Allah yolunda.',
  'شكرا لك': 'Teşekkür ederim.',
  'معذرة': 'Affedersiniz.',
  'من فضلك': 'Lütfen.',
  'اهلا وسهلا': 'Hoş geldiniz.',
  'صباح الخير': 'Günaydın.',
  'مساء الخير': 'İyi akşamlar.',
  'تصبح على خير': 'İyi geceler.',
  'الى اللقاء': 'Görüşürüz.',
  'مع السلامة': 'Hoşça kal.',
  'كيف حالك': 'Nasılsın?',
  'انا بخير': 'İyiyim.',
  'ما اسمك': 'Adın ne?',
  'اسمي': 'Adım...',
  'من اين انت': 'Nerelisin?',
  'اين': 'Nerede?',
  'متى': 'Ne zaman?',
  'لماذا': 'Neden?',
  'ماذا': 'Ne?',
  'كيف': 'Nasıl?',
  'كم': 'Kaç?',
  'من': 'Kim?',
  'هذا': 'Bu',
  'ذلك': 'Şu',
  'هنا': 'Burada',
  'هناك': 'Orada',
  'نعم': 'Evet',
  'لا': 'Hayır',
  'ربما': 'Belki',
  'دائما': 'Her zaman',
  'ابدا': 'Asla',
  'احيانا': 'Bazen',
  'اليوم': 'Bugün',
  'غدا': 'Yarın',
  'الامس': 'Dün',
  'الان': 'Şimdi',
  'بعد': 'Sonra',
  'قبل': 'Önce',
  'مع': 'İle',
  'بدون': 'Without',
  'فوق': 'Üstünde',
  'تحت': 'Altında',
  'جنب': 'Yanında',
  'امام': 'Karşısında',
  'خلف': 'Arkasında',
  'داخل': 'İçinde',
  'خارج': 'Dışında',
  'يوم': 'Gün',
  'ليلة': 'Gece',
  'اسبوع': 'Hafta',
  'شهر': 'Ay',
  'سنة': 'Yıl',
  'صباح': 'Sabah',
  'مساء': 'Akşam',
  'ليل': 'Gece',
  'نهار': 'Gündüz'
};

// Metin çeviri fonksiyonu
function translateText(text) {
  if (!text || typeof text !== 'string') {
    return 'Çevirilecek metin bulunamadı';
  }

  let translated = text;
  
  // Önce kelime çevirilerini yap
  for (const [ottoman, turkish] of Object.entries(wordTranslations)) {
    const regex = new RegExp(ottoman, 'gi');
    translated = translated.replace(regex, turkish);
  }
  
  // Sonra karakter çevirilerini yap
  for (const [ottoman, turkish] of Object.entries(characterMap)) {
    const regex = new RegExp(ottoman, 'g');
    translated = translated.replace(regex, turkish);
  }
  
  // Boşlukları temizle
  translated = translated.replace(/\s+/g, ' ').trim();
  
  // Eğer çeviri sonucu boşsa veya orijinal metne çok benzerse
  if (!translated || translated.length < 2) {
    return 'Metin çevrilemedi veya anlaşılamadı';
  }
  
  return translated;
}

// Ana fonksiyon
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Hata: Çevrilecek metin dosyası belirtilmedi.');
    process.exit(1);
  }
  
  const filePath = args[0];
  
  try {
    // Dosyadan metni oku
    const text = fs.readFileSync(filePath, 'utf8');
    
    // Metni çevir
    const translation = translateText(text);
    
    // Sonucu JSON formatında yazdır
    const result = {
      success: true,
      originalText: text,
      translatedText: translation,
      timestamp: new Date().toISOString()
    };
    
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Hata:', error.message);
    
    // Hata durumunda JSON formatında hata mesajı yazdır
    const errorResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { translateText, characterMap, wordTranslations };