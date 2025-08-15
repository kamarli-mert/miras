#!/usr/bin/env node

/**
 * Osmanlıca Karakter Tanıma - Test Script'i
 * Bu script, eğitilmiş modeli test eder ve performans raporu oluşturur
 */

const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

// Proje kök dizini
const rootDir = path.join(__dirname, '..');
const testDir = path.join(rootDir, 'data', 'test');
const modelsDir = path.join(rootDir, 'models');

// Test parametreleri
const IMAGE_SIZE = 64;
const NUM_CHANNELS = 1; // Gri tonlama

// Karakter listesini yükle
function loadCharacterList() {
  const characterListPath = path.join(rootDir, 'karakter_listesi.json');
  const rawData = fs.readFileSync(characterListPath, 'utf8');
  return JSON.parse(rawData);
}

// Tüm karakter isimlerini al
function getCharacterNames(characterList) {
  const names = [];
  
  Object.values(characterList.characters).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(char => names.push(char.name));
    }
  });
  
  return names.sort();
}

// Resim dosyalarını bul
function findImageFiles(directory) {
  const files = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.bmp'];
  
  if (!fs.existsSync(directory)) {
    return files;
  }
  
  const items = fs.readdirSync(directory);
  
  items.forEach(item => {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (extensions.includes(ext)) {
        files.push(itemPath);
      }
    }
  });
  
  return files;
}

// Resmi yükle ve ön işle
async function loadAndProcessImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageTensor = tf.node.decodeImage(imageBuffer, 1); // Gri tonlama
    
    // Boyutlandır
    const resized = tf.image.resizeBilinear(imageTensor, [IMAGE_SIZE, IMAGE_SIZE]);
    
    // Normalizasyon
    const normalized = resized.div(255.0);
    
    return normalized;
  } catch (error) {
    console.error(`Resim yüklenemedi: ${imagePath}`, error.message);
    return null;
  }
}

// Test veri setini yükle
async function loadTestDataset(testDir, characterNames) {
  const testData = [];
  const trueLabels = [];
  
  console.log('📁 Test veri seti yükleniyor...');
  
  for (let i = 0; i < characterNames.length; i++) {
    const charName = characterNames[i];
    const charDir = path.join(testDir, charName);
    
    if (!fs.existsSync(charDir)) {
      console.log(`⚠️  Klasör bulunamadı: ${charName}`);
      continue;
    }
    
    const imageFiles = findImageFiles(charDir);
    console.log(`📂 ${charName}: ${imageFiles.length} test resmi bulundu`);
    
    for (const imagePath of imageFiles) {
      const imageTensor = await loadAndProcessImage(imagePath);
      if (imageTensor) {
        testData.push({
          image: imageTensor,
          path: imagePath,
          trueLabel: i,
          trueLabelName: charName
        });
        trueLabels.push(i);
      }
    }
  }
  
  if (testData.length === 0) {
    throw new Error('Hiç test resmi bulunamadı! Lütfen test resimlerini klasörlere yerleştirin.');
  }
  
  console.log(`✅ Toplam ${testData.length} test resmi yüklendi`);
  return testData;
}

// Modeli yükle
async function loadModel(modelPath) {
  console.log('🔄 Model yükleniyor...');
  
  const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
  
  // Meta verileri yükle
  const metadataPath = path.join(modelPath, 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  console.log(`✅ Model yüklendi: ${metadata.modelName}`);
  console.log(`📅 Oluşturulma tarihi: ${metadata.createdAt}`);
  console.log(`🎯 Sınıf sayısı: ${metadata.numClasses}`);
  
  return { model, metadata };
}

// Modeli test et
async function testModel(model, testData, characterNames) {
  console.log('\n🧪 Model test ediliyor...');
  
  let correctPredictions = 0;
  const confusionMatrix = Array(characterNames.length).fill(null).map(() => 
    Array(characterNames.length).fill(0)
  );
  const predictions = [];
  
  for (let i = 0; i < testData.length; i++) {
    const testItem = testData[i];
    
    // Tahmin yap
    const prediction = model.predict(
      testItem.image.expandDims(0)
    );
    
    const probabilities = await prediction.data();
    const predictedIndex = probabilities.indexOf(Math.max(...probabilities));
    const predictedLabel = characterNames[predictedIndex];
    const confidence = probabilities[predictedIndex];
    
    // Sonuçları kaydet
    predictions.push({
      path: testItem.path,
      trueLabel: testItem.trueLabelName,
      predictedLabel: predictedLabel,
      confidence: confidence,
      correct: testItem.trueLabel === predictedIndex
    });
    
    // Confusion matrix'i güncelle
    confusionMatrix[testItem.trueLabel][predictedIndex]++;
    
    if (testItem.trueLabel === predictedIndex) {
      correctPredictions++;
    }
    
    // Tensor'ları temizle
    prediction.dispose();
    
    // İlerleme göster
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\r🔄 Test ediliyor: ${i + 1}/${testData.length}`);
    }
  }
  
  process.stdout.write('\r✅ Test tamamlandı: ' + ' '.repeat(30) + '\n');
  
  const accuracy = (correctPredictions / testData.length) * 100;
  
  return {
    accuracy,
    correctPredictions,
    totalPredictions: testData.length,
    confusionMatrix,
    predictions
  };
}

// Performans raporu oluştur
function generateReport(results, characterNames, outputPath) {
  const { accuracy, correctPredictions, totalPredictions, confusionMatrix, predictions } = results;
  
  let report = `# Osmanlıca Karakter Tanıma - Test Raporu

## Genel Performans
- **Doğruluk (Accuracy)**: ${accuracy.toFixed(2)}%
- **Doğru Tahminler**: ${correctPredictions}/${totalPredictions}
- **Test Tarihi**: ${new Date().toLocaleString('tr-TR')}

## Sınıf Bazında Performans

| Karakter | Doğruluk | Doğru Sayısı | Toplam |
|----------|----------|--------------|--------|
`;
  
  // Her karakter için performansı hesapla
  for (let i = 0; i < characterNames.length; i++) {
    const truePositives = confusionMatrix[i][i];
    const totalInClass = confusionMatrix[i].reduce((sum, val) => sum + val, 0);
    const classAccuracy = totalInClass > 0 ? (truePositives / totalInClass) * 100 : 0;
    
    report += `| ${characterNames[i]} | ${classAccuracy.toFixed(1)}% | ${truePositives} | ${totalInClass} |\n`;
  }
  
  report += `
## Confusion Matrix
`;
  
  // Confusion matrix'i tablo olarak ekle
  report += '| |' + characterNames.map(name => ` ${name} `).join('|') + '|\n';
  report += '|' + '-|'.repeat(characterNames.length + 1) + '\n';
  
  for (let i = 0; i < characterNames.length; i++) {
    report += `| ${characterNames[i]} |`;
    for (let j = 0; j < characterNames.length; j++) {
      report += ` ${confusionMatrix[i][j]} |`;
    }
    report += '\n';
  }
  
  report += `
## Hatalı Tahminler

| Resim Yolu | Gerçek Karakter | Tahmin Edilen | Güven |
|------------|----------------|---------------|-------|
`;
  
  // Hatalı tahminleri listele
  const wrongPredictions = predictions.filter(p => !p.correct);
  wrongPredictions.slice(0, 20).forEach(pred => {
    const relativePath = path.relative(rootDir, pred.path);
    report += `| ${relativePath} | ${pred.trueLabel} | ${pred.predictedLabel} | ${(pred.confidence * 100).toFixed(1)}% |\n`;
  });
  
  if (wrongPredictions.length > 20) {
    report += `| ... | ... | ... | ... |\n`;
    report += `*Toplam ${wrongPredictions.length} hatalı tahmin, ilk 20 gösterildi*\n`;
  }
  
  report += `
## Öneriler

1. **Düşük doğruluğa sahip karakterler için**:
   - Daha fazla eğitim verisi ekleyin
   - Resim kalitesini artırın
   - Farklı yazı stillerini ekleyin

2. **Genel iyileştirmeler için**:
   - Modeli daha fazla epoch ile eğitin
   - Veri artırma (data augmentation) teknikleri kullanın
   - Farklı model mimarileri deneyin

3. **Test verisi için**:
   - Test verilerini eğitim verilerinden tamamen ayırın
   - Her karakter için dengeli sayıda test örneği sağlayın
`;
  
  fs.writeFileSync(outputPath, report);
  console.log(`📄 Rapor oluşturuldu: ${outputPath}`);
  
  return report;
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🧪 Osmanlıca Karakter Tanıma - Test Script\'i');
    console.log('==============================================\n');
    
    // Komut satırı argümanlarını kontrol et
    const args = process.argv.slice(2);
    let modelPath = args[0];
    
    if (!modelPath) {
      // En son modeli bul
      const modelFolders = fs.readdirSync(modelsDir)
        .filter(item => fs.statSync(path.join(modelsDir, item)).isDirectory())
        .sort();
      
      if (modelFolders.length === 0) {
        throw new Error('Hiç eğitilmiş model bulunamadı! Önce train_model.js script\'ini çalıştırın.');
      }
      
      modelPath = path.join(modelsDir, modelFolders[modelFolders.length - 1]);
      console.log(`📁 En son model kullanılıyor: ${modelPath}`);
    } else {
      modelPath = path.resolve(modelPath);
      if (!fs.existsSync(modelPath)) {
        throw new Error(`Model bulunamadı: ${modelPath}`);
      }
    }
    
    // Karakter listesini yükle
    const characterList = loadCharacterList();
    const characterNames = getCharacterNames(characterList);
    
    console.log(`📝 ${characterNames.length} karakter tespit edildi`);
    
    // Test veri setini yükle
    const testData = await loadTestDataset(testDir, characterNames);
    
    // Modeli yükle
    const { model, metadata } = await loadModel(modelPath);
    
    // Modeli test et
    const results = await testModel(model, testData, characterNames);
    
    // Rapor oluştur
    const reportPath = path.join(rootDir, 'test_report.md');
    generateReport(results, characterNames, reportPath);
    
    // Sonuçları göster
    console.log('\n🎯 Test Sonuçları:');
    console.log(`✅ Genel Doğruluk: ${results.accuracy.toFixed(2)}%`);
    console.log(`✅ Doğru Tahminler: ${results.correctPredictions}/${results.totalPredictions}`);
    
    // En iyi ve en kötü performans gösteren karakterler
    const classPerformances = [];
    for (let i = 0; i < characterNames.length; i++) {
      const truePositives = results.confusionMatrix[i][i];
      const totalInClass = results.confusionMatrix[i].reduce((sum, val) => sum + val, 0);
      const accuracy = totalInClass > 0 ? (truePositives / totalInClass) * 100 : 0;
      
      classPerformances.push({
        character: characterNames[i],
        accuracy: accuracy,
        correct: truePositives,
        total: totalInClass
      });
    }
    
    classPerformances.sort((a, b) => b.accuracy - a.accuracy);
    
    console.log('\n🏆 En İyi Performans:');
    classPerformances.slice(0, 3).forEach(perf => {
      console.log(`   ${perf.character}: ${perf.accuracy.toFixed(1)}% (${perf.correct}/${perf.total})`);
    });
    
    console.log('\n📉 Geliştirme Gerekenler:');
    classPerformances.slice(-3).reverse().forEach(perf => {
      console.log(`   ${perf.character}: ${perf.accuracy.toFixed(1)}% (${perf.correct}/${perf.total})`);
    });
    
    // Temizlik
    testData.forEach(item => item.image.dispose());
    model.dispose();
    
    console.log('\n🎉 Test başarıyla tamamlandı!');
    console.log('📄 Detaylı rapor için test_report.md dosyasını kontrol edin.');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { main, testModel, loadTestDataset };