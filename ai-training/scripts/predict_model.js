#!/usr/bin/env node

/**
 * Osmanlıca Karakter Tanıma - Model Kullanma Script'i
 * Bu script, eğitilmiş modeli kullanarak yeni resimlerde karakter tanıma yapar
 */

const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

// Proje kök dizini
const rootDir = path.join(__dirname, '..');
const modelsDir = path.join(rootDir, 'models');

// Tanıma parametreleri
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

// Resmi yükle ve ön işle
async function loadAndProcessImage(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageTensor = tf.node.decodeImage(imageBuffer, NUM_CHANNELS); // Gri tonlama
    
    // Boyutlandır
    const resized = tf.image.resizeBilinear(imageTensor, [IMAGE_SIZE, IMAGE_SIZE]);
    
    // Normalizasyon
    const normalized = resized.div(255.0);
    
    // Batch boyutu ekle
    const batched = normalized.expandDims(0);
    
    return batched;
  } catch (error) {
    console.error(`Resim yüklenemedi: ${imagePath}`, error.message);
    return null;
  }
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

// Tek resimde tahmin yap
async function predictSingleImage(model, imagePath, characterNames) {
  const processedImage = await loadAndProcessImage(imagePath);
  
  if (!processedImage) {
    return null;
  }
  
  // Tahmin yap
  const prediction = model.predict(processedImage);
  const probabilities = await prediction.data();
  
  // En yüksek olasılıklı tahmini bul
  const maxProbability = Math.max(...probabilities);
  const predictedIndex = probabilities.indexOf(maxProbability);
  const predictedLabel = characterNames[predictedIndex];
  
  // Tensor'ları temizle
  processedImage.dispose();
  prediction.dispose();
  
  return {
    imagePath,
    predictedLabel,
    confidence: maxProbability,
    allProbabilities: probabilities.map((prob, index) => ({
      character: characterNames[index],
      probability: prob
    })).sort((a, b) => b.probability - a.probability)
  };
}

// Çoklu resimlerde tahmin yap
async function predictMultipleImages(model, imagePaths, characterNames) {
  const results = [];
  
  console.log(`🔍 ${imagePaths.length} resim analiz ediliyor...`);
  
  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i];
    
    console.log(`📷 ${i + 1}/${imagePaths.length}: ${path.basename(imagePath)}`);
    
    const result = await predictSingleImage(model, imagePath, characterNames);
    
    if (result) {
      results.push(result);
      
      // Sonucu göster
      console.log(`   🎯 Tahmin: ${result.predictedLabel}`);
      console.log(`   📊 Güven: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(''); // Boş satır
    }
  }
  
  return results;
}

// Sonuçları kaydet
function saveResults(results, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    totalImages: results.length,
    predictions: results.map(result => ({
      imagePath: path.relative(rootDir, result.imagePath),
      predictedLabel: result.predictedLabel,
      confidence: result.confidence,
      topPredictions: result.allProbabilities.slice(0, 5)
    }))
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`💾 Sonuçlar kaydedildi: ${outputPath}`);
}

// HTML raporu oluştur
function generateHTMLReport(results, outputPath) {
  let html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Osmanlıca Karakter Tanıma Sonuçları</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .result-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
        }
        .result-card img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .prediction {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .confidence {
            color: #7f8c8d;
            font-size: 14px;
        }
        .confidence-bar {
            width: 100%;
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 5px;
        }
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #e74c3c, #f39c12, #27ae60);
            transition: width 0.3s ease;
        }
        .top-predictions {
            margin-top: 10px;
            font-size: 12px;
        }
        .top-prediction {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 Osmanlıca Karakter Tanıma Sonuçları</h1>
        
        <div class="summary">
            <h2>📊 Özet</h2>
            <p><strong>Toplam Resim:</strong> ${results.length}</p>
            <p><strong>Analiz Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        </div>
        
        <div class="result-grid">
`;
  
  results.forEach(result => {
    const imagePath = path.relative(rootDir, result.imagePath);
    const confidencePercent = (result.confidence * 100).toFixed(1);
    
    html += `
            <div class="result-card">
                <img src="${imagePath}" alt="Tahmin edilen resim" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzMkMzMiAyNSA0MCAyNSA0MCAzMkM0MCAzOSAzMiAzOSAyNSAzOVYzMloiIHN0cm9rZT0iIzlDOUNDOSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMyIgZmlsbD0iIzlDOUNDOSIvPgo8L3N2Zz4K'">
                <div class="prediction">🎯 ${result.predictedLabel}</div>
                <div class="confidence">Güven: ${confidencePercent}%</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
                </div>
                <div class="top-predictions">
                    <strong>Diğer tahminler:</strong>
`;
    
    result.allProbabilities.slice(1, 4).forEach(pred => {
      const predPercent = (pred.probability * 100).toFixed(1);
      html += `
                    <div class="top-prediction">
                        <span>${pred.character}</span>
                        <span>${predPercent}%</span>
                    </div>
`;
    });
    
    html += `
                </div>
            </div>
`;
  });
  
  html += `
        </div>
        
        <div class="timestamp">
            Rapor oluşturulma tarihi: ${new Date().toLocaleString('tr-TR')}
        </div>
    </div>
</body>
</html>
`;
  
  fs.writeFileSync(outputPath, html);
  console.log(`📄 HTML raporu oluşturuldu: ${outputPath}`);
}

// Kullanım talimatları
function showUsage() {
  console.log(`
🧠 Osmanlıca Karakter Tanıma - Model Kullanma Script'i

Kullanım:
  node predict_model.js [model_yolu] [resim_yolu veya klasör]

Seçenekler:
  model_yolu       - Eğitilmiş model klasörü (isteğe bağlı, en son model kullanılır)
  resim_yolu       - Analiz edilecek resim dosyası veya klasör yolu

Örnekler:
  # En son model ile tek resim analizi
  node predict_model.js /path/to/image.jpg
  
  # Belirli bir model ile tek resim analizi
  node predict_model.js /path/to/model /path/to/image.jpg
  
  # Klasördeki tüm resimleri analiz et
  node predict_model.js /path/to/images/
  
  # Çıktı seçenekleri:
  #   --json      - Sonuçları JSON olarak kaydeder
  #   --html      - HTML raporu oluşturur
  #   --output    - Çıktı dosyasını belirtir

Örnek çıktı komutları:
  node predict_model.js image.jpg --json --output results.json
  node predict_model.js images/ --html --output report.html
`);
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🧠 Osmanlıca Karakter Tanıma - Model Kullanma Script\'i');
    console.log('===================================================\n');
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      showUsage();
      return;
    }
    
    // Argümanları parse et
    let modelPath = null;
    let inputPath = null;
    let outputJson = false;
    let outputHtml = false;
    let outputPath = null;
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--json') {
        outputJson = true;
      } else if (arg === '--html') {
        outputHtml = true;
      } else if (arg === '--output' && i + 1 < args.length) {
        outputPath = args[i + 1];
        i++;
      } else if (!modelPath && fs.existsSync(arg) && 
                fs.statSync(arg).isDirectory() && 
                fs.existsSync(path.join(arg, 'model.json'))) {
        modelPath = arg;
      } else if (!inputPath && fs.existsSync(arg)) {
        inputPath = arg;
      } else if (!modelPath) {
        modelPath = arg;
      } else if (!inputPath) {
        inputPath = arg;
      }
    }
    
    // Model yolunu belirle
    if (!modelPath) {
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
      if (!fs.existsSync(modelPath) || !fs.existsSync(path.join(modelPath, 'model.json'))) {
        throw new Error(`Geçerli model bulunamadı: ${modelPath}`);
      }
    }
    
    // Giriş yolunu kontrol et
    if (!inputPath) {
      throw new Error('Lütfen analiz edilecek resim veya klasör belirtin.');
    }
    
    inputPath = path.resolve(inputPath);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Giriş yolu bulunamadı: ${inputPath}`);
    }
    
    // Karakter listesini yükle
    const characterList = loadCharacterList();
    const characterNames = getCharacterNames(characterList);
    
    console.log(`📝 ${characterNames.length} karakter tespit edildi`);
    
    // Modeli yükle
    const { model, metadata } = await loadModel(modelPath);
    
    // Resim yollarını topla
    let imagePaths = [];
    const stat = fs.statSync(inputPath);
    
    if (stat.isFile()) {
      imagePaths = [inputPath];
      console.log(`📷 Tek resim analizi: ${path.basename(inputPath)}`);
    } else if (stat.isDirectory()) {
      // Klasördeki tüm resimleri bul
      const extensions = ['.jpg', '.jpeg', '.png', '.bmp'];
      const items = fs.readdirSync(inputPath);
      
      items.forEach(item => {
        const itemPath = path.join(inputPath, item);
        const itemStat = fs.statSync(itemPath);
        
        if (itemStat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (extensions.includes(ext)) {
            imagePaths.push(itemPath);
          }
        }
      });
      
      console.log(`📁 Klasör analizi: ${imagePaths.length} resim bulundu`);
    }
    
    if (imagePaths.length === 0) {
      throw new Error('Analiz edilecek resim bulunamadı!');
    }
    
    // Tahminleri yap
    const results = await predictMultipleImages(model, imagePaths, characterNames);
    
    // Sonuçları göster
    console.log('\n📊 Analiz Özeti:');
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    console.log(`✅ Toplam analiz edilen resim: ${results.length}`);
    console.log(`✅ Ortalama güven: ${(avgConfidence * 100).toFixed(1)}%`);
    
    // Güven seviyelerine göre dağılım
    const highConfidence = results.filter(r => r.confidence > 0.8).length;
    const mediumConfidence = results.filter(r => r.confidence > 0.5 && r.confidence <= 0.8).length;
    const lowConfidence = results.filter(r => r.confidence <= 0.5).length;
    
    console.log(`🎯 Yüksek güven (>80%): ${highConfidence}`);
    console.log(`🎯 Orta güven (50-80%): ${mediumConfidence}`);
    console.log(`🎯 Düşük güven (<50%): ${lowConfidence}`);
    
    // Çıktıları kaydet
    if (outputJson || outputHtml) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (outputJson) {
        const jsonPath = outputPath || path.join(rootDir, `prediction_results_${timestamp}.json`);
        saveResults(results, jsonPath);
      }
      
      if (outputHtml) {
        const htmlPath = outputPath || path.join(rootDir, `prediction_report_${timestamp}.html`);
        generateHTMLReport(results, htmlPath);
      }
    }
    
    // Temizlik
    model.dispose();
    
    console.log('\n🎉 Analiz başarıyla tamamlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { main, predictSingleImage, predictMultipleImages };