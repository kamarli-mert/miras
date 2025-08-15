#!/usr/bin/env node

/**
 * Osmanlıca Karakter Klasör Oluşturucu
 * Bu script, eğitim ve test için gerekli tüm karakter klasörlerini otomatik oluşturur
 */

const fs = require('fs');
const path = require('path');

// Proje kök dizini
const rootDir = path.join(__dirname, '..');
const trainingDir = path.join(rootDir, 'data', 'training');
const testDir = path.join(rootDir, 'data', 'test');

// Karakter listesini JSON dosyasından oku
const characterListPath = path.join(rootDir, 'karakter_listesi.json');
let characterList;

try {
  const rawData = fs.readFileSync(characterListPath, 'utf8');
  characterList = JSON.parse(rawData);
} catch (error) {
  console.error('Hata: karakter_listesi.json dosyası okunamadı:', error.message);
  process.exit(1);
}

// Klasör oluşturma fonksiyonu
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Klasör oluşturuldu: ${dirPath}`);
  } else {
    console.log(`⚠️  Klasör zaten var: ${dirPath}`);
  }
}

// Karakter isimlerini topla
function getAllCharacterNames() {
  const names = [];
  
  // Tekil harfler
  characterList.characters.single_letters.forEach(char => {
    names.push(char.name);
  });
  
  // Ünlü işaretleri
  characterList.characters.vowel_marks.forEach(char => {
    names.push(char.name);
  });
  
  // Özel karakterler
  characterList.characters.special_characters.forEach(char => {
    names.push(char.name);
  });
  
  // Sayılar
  characterList.characters.numbers.forEach(char => {
    names.push(char.name);
  });
  
  // Kombinasyonlar
  characterList.characters.combinations.forEach(char => {
    names.push(char.name);
  });
  
  // Yaygın kelimeler
  characterList.characters.common_words.forEach(char => {
    names.push(char.name);
  });
  
  // Noktalama işaretleri
  characterList.characters.punctuation.forEach(char => {
    names.push(char.name);
  });
  
  return names;
}

// Ana fonksiyon
function main() {
  console.log('🚀 Osmanlıca Karakter Klasör Oluşturucu Başlatılıyor...');
  console.log('=====================================\n');
  
  // Ana klasörleri kontrol et
  createDirectory(trainingDir);
  createDirectory(testDir);
  
  // Tüm karakter isimlerini al
  const characterNames = getAllCharacterNames();
  
  console.log(`\n📁 Toplam ${characterNames.length} karakter için klasörler oluşturuluyor...\n`);
  
  // Eğitim klasörlerini oluştur
  console.log('📚 Eğitim Klasörleri:');
  characterNames.forEach(name => {
    const charTrainingDir = path.join(trainingDir, name);
    createDirectory(charTrainingDir);
  });
  
  // Test klasörlerini oluştur
  console.log('\n🧪 Test Klasörleri:');
  characterNames.forEach(name => {
    const charTestDir = path.join(testDir, name);
    createDirectory(charTestDir);
  });
  
  // Bilgi dosyası oluştur
  const infoContent = `
# Osmanlıca AI Eğitim Veri Seti

Bu klasör yapısı Osmanlıca karakterlerin yapay zeka ile tanınması için oluşturulmuştur.

## Klasör Yapısı
- \`training/\`: Eğitim verileri (her karakterden ~500 resim)
- \`test/\`: Test verileri (her karakterden ~50-100 resim)

## Karakter Sayısı
- Toplam karakter: ${characterNames.length}
- Tekil harfler: ${characterList.characters.single_letters.length}
- Ünlü işaretleri: ${characterList.characters.vowel_marks.length}
- Özel karakterler: ${characterList.characters.special_characters.length}
- Sayılar: ${characterList.characters.numbers.length}
- Kombinasyonlar: ${characterList.characters.combinations.length}
- Yaygın kelimeler: ${characterList.characters.common_words.length}
- Noktalama işaretleri: ${characterList.characters.punctuation.length}

## Kullanım Talimatları
1. Her karakter klasörüne ilgili resimleri yerleştirin
2. Resimler .jpg, .jpeg, .png veya .bmp formatında olmalıdır
3. Resim boyutları mümkünse tutarlı olmalıdır (önerilen: 64x64 piksel)
4. Eğitim için her karakterden en az 500 resim gereklidir
5. Test için her karakterden 50-100 resim yeterlidir

## Örnek Yapı
\`\`\`
training/
├── elif/
│   ├── elif_001.jpg
│   ├── elif_002.jpg
│   └── ...
├── be/
│   ├── be_001.jpg
│   ├── be_002.jpg
│   └── ...
└── ...

test/
├── elif/
│   ├── elif_test_001.jpg
│   ├── elif_test_002.jpg
│   └── ...
└── ...
\`\`\`

Oluşturulma tarihi: ${new Date().toLocaleString('tr-TR')}
`;
  
  const infoPath = path.join(rootDir, 'README.md');
  fs.writeFileSync(infoPath, infoContent);
  console.log(`\n📄 Bilgi dosyası oluşturuldu: ${infoPath}`);
  
  console.log('\n✅ Tüm klasörler başarıyla oluşturuldu!');
  console.log('🎯 Şimdi resimlerinizi ilgili klasörlere yerleştirebilirsiniz.');
  console.log('💡 Her karakter klasörüne yaklaşık 500 resim koymayı unutmayın.');
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { main, getAllCharacterNames };