#!/usr/bin/env node

/**
 * Osmanlıca Karakter Tanıma - Eğitim Script'i
 * Bu script, resim verilerini kullanarak yapay zeka modelini eğitir
 */

const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

// Proje kök dizini
const rootDir = path.join(__dirname, '..');
const trainingDir = path.join(rootDir, 'data', 'training');
const testDir = path.join(rootDir, 'data', 'test');
const modelsDir = path.join(rootDir, 'models');

// Model parametreleri
const IMAGE_SIZE = 64;
const NUM_CHANNELS = 1; // Gri tonlama
const BATCH_SIZE = 32;
const EPOCHS = 50;
const LEARNING_RATE = 0.001;

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

// Veri setini yükle
async function loadDataset(dataDir, characterNames) {
  const images = [];
  const labels = [];
  
  console.log('📁 Veri seti yükleniyor...');
  
  for (let i = 0; i < characterNames.length; i++) {
    const charName = characterNames[i];
    const charDir = path.join(dataDir, charName);
    
    if (!fs.existsSync(charDir)) {
      console.log(`⚠️  Klasör bulunamadı: ${charName}`);
      continue;
    }
    
    const imageFiles = findImageFiles(charDir);
    console.log(`📂 ${charName}: ${imageFiles.length} resim bulundu`);
    
    for (const imagePath of imageFiles) {
      const imageTensor = await loadAndProcessImage(imagePath);
      if (imageTensor) {
        images.push(imageTensor);
        labels.push(i); // Karakter indeksi
      }
    }
  }
  
  if (images.length === 0) {
    throw new Error('Hiç resim bulunamadı! Lütfen resimleri klasörlere yerleştirin.');
  }
  
  console.log(`✅ Toplam ${images.length} resim yüklendi`);
  
  // Tensor'lara dönüştür
  const imagesTensor = tf.stack(images);
  const labelsTensor = tf.tensor1d(labels, 'int32');
  
  return {
    images: imagesTensor,
    labels: tf.oneHot(labelsTensor, characterNames.length),
    count: images.length
  };
}

// Model oluştur
function createModel(numClasses) {
  const model = tf.sequential({
    layers: [
      // Evrişimli katmanlar
      tf.layers.conv2d({
        inputShape: [IMAGE_SIZE, IMAGE_SIZE, NUM_CHANNELS],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        name: 'conv1'
      }),
      tf.layers.maxPooling2d({ poolSize: 2, name: 'pool1' }),
      tf.layers.dropout({ rate: 0.25 }),
      
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
        name: 'conv2'
      }),
      tf.layers.maxPooling2d({ poolSize: 2, name: 'pool2' }),
      tf.layers.dropout({ rate: 0.25 }),
      
      tf.layers.conv2d({
        filters: 128,
        kernelSize: 3,
        activation: 'relu',
        name: 'conv3'
      }),
      tf.layers.maxPooling2d({ poolSize: 2, name: 'pool3' }),
      tf.layers.dropout({ rate: 0.25 }),
      
      // Flatten ve Dense katmanlar
      tf.layers.flatten({ name: 'flatten' }),
      tf.layers.dense({
        units: 512,
        activation: 'relu',
        name: 'dense1'
      }),
      tf.layers.dropout({ rate: 0.5 }),
      tf.layers.dense({
        units: numClasses,
        activation: 'softmax',
        name: 'output'
      })
    ]
  });
  
  // Modeli derle
  model.compile({
    optimizer: tf.train.adam(LEARNING_RATE),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  return model;
}

// Modeli eğit
async function trainModel(model, trainingData, validationData, characterNames) {
  console.log('\n🚀 Model eğitimi başlıyor...');
  console.log(`📊 Eğitim verisi: ${trainingData.count} resim`);
  console.log(`📊 Doğrulama verisi: ${validationData.count} resim`);
  console.log(`🎯 Sınıf sayısı: ${characterNames.length}`);
  console.log(`⏱️  Epoch sayısı: ${EPOCHS}`);
  
  const history = await model.fit(trainingData.images, trainingData.labels, {
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    validationData: [validationData.images, validationData.labels],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}/${EPOCHS} - ` +
                  `loss: ${logs.loss.toFixed(4)} - ` +
                  `acc: ${logs.acc.toFixed(4)} - ` +
                  `val_loss: ${logs.val_loss.toFixed(4)} - ` +
                  `val_acc: ${logs.val_acc.toFixed(4)}`);
      }
    }
  });
  
  return history;
}

// Modeli kaydet
async function saveModel(model, characterNames) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const modelName = `ottoman_model_${timestamp}`;
  const modelPath = path.join(modelsDir, modelName);
  
  // Modeli kaydet
  await model.save(`file://${modelPath}`);
  
  // Meta verileri kaydet
  const metadata = {
    modelName,
    createdAt: timestamp,
    characterNames,
    numClasses: characterNames.length,
    imageSize: IMAGE_SIZE,
    epochs: EPOCHS,
    batchSize: BATCH_SIZE,
    learningRate: LEARNING_RATE
  };
  
  fs.writeFileSync(
    path.join(modelPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log(`\n💾 Model kaydedildi: ${modelPath}`);
  return modelPath;
}

// Ana fonksiyon
async function main() {
  try {
    console.log('🧠 Osmanlıca Karakter Tanıma - Eğitim Script\'i');
    console.log('===============================================\n');
    
    // Klasörleri kontrol et
    if (!fs.existsSync(trainingDir)) {
      throw new Error(`Eğitim klasörü bulunamadı: ${trainingDir}`);
    }
    
    if (!fs.existsSync(testDir)) {
      throw new Error(`Test klasörü bulunamadı: ${testDir}`);
    }
    
    // Models klasörünü oluştur
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }
    
    // Karakter listesini yükle
    const characterList = loadCharacterList();
    const characterNames = getCharacterNames(characterList);
    
    console.log(`📝 ${characterNames.length} karakter tespit edildi`);
    
    // Veri setlerini yükle
    const trainingData = await loadDataset(trainingDir, characterNames);
    const validationData = await loadDataset(testDir, characterNames);
    
    // Model oluştur
    console.log('\n🏗️  Model oluşturuluyor...');
    const model = createModel(characterNames.length);
    
    // Model özeti
    model.summary();
    
    // Modeli eğit
    const history = await trainModel(model, trainingData, validationData, characterNames);
    
    // Modeli kaydet
    const modelPath = await saveModel(model, characterNames);
    
    // Temizlik
    tf.dispose([trainingData.images, trainingData.labels, validationData.images, validationData.labels]);
    
    console.log('\n🎉 Eğitim başarıyla tamamlandı!');
    console.log(`📁 Model kaydedildi: ${modelPath}`);
    console.log('🚀 Artık modeli kullanabilirsiniz!');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { main, createModel, loadDataset };