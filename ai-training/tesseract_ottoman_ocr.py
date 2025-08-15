#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tesseract OCR ile Osmanlıca Metin Tespit Sistemi
Bu script Tesseract OCR kullanarak Osmanlıca metinleri tespit eder ve Türkçeye çevirir.
"""

import cv2
import numpy as np
import pytesseract
import json
import os
import sys
import re
from typing import Dict, List, Tuple, Optional
import time

class TesseractOttomanOCR:
    def __init__(self):
        """Tesseract OCR sistemi başlatıcı"""
        # Windows için Tesseract yolunu ayarla
        if os.name == 'nt':  # Windows
            tesseract_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
            ]
            
            for path in tesseract_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    break
            else:
                print("Tesseract bulunamadı. Lütfen Tesseract OCR'ı yükleyin.", file=sys.stderr)
        
        # Tesseract ayarları - Osmanlıca için optimize edilmiş
        self.tesseract_config = '--oem 3 --psm 6 -c tessedit_char_whitelist=ابتثجحخدذرزسشصضطظعغفقكلمنهويپچژگآأإؤئىةﻻﷲ0123456789.,;:!?()[]{}"\'- '
        
        # Osmanlıca karakter mapping'i
        self.ottoman_to_turkish = {
            # Temel harfler
            'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 's', 'ج': 'c', 'ح': 'h', 'خ': 'h',
            'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'ş', 'ص': 's',
            'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '', 'غ': 'ğ', 'ف': 'f', 'ق': 'k',
            'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'v', 'ي': 'y',
            'ى': 'i', 'ة': 'e', 'آ': 'a', 'أ': 'a', 'إ': 'i', 'ؤ': 'ü', 'ئ': 'i',
            'ء': '', 'گ': 'g', 'پ': 'p', 'چ': 'ç', 'ژ': 'j',
            
            # Özel kombinasyonlar
            'ﻻ': 'la', 'ﷲ': 'allah', 'الله': 'allah', 'محمد': 'muhammed',
            'علي': 'ali', 'حسن': 'hasan', 'حسين': 'hüseyin', 'فاطمة': 'fatma',
            
            # Sayılar
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5',
            '٦': '6', '٧': '7', '٨': '8', '٩': '9',
            
            # Noktalama işaretleri
            '،': ',', '؛': ';', '؟': '?', '!': '!', '۔': '.', 'ـ': '-'
        }
        
        # Türkçe kelime mapping'i
        self.turkish_word_mapping = {
            'kitab': 'kitap', 'mekteb': 'mektep', 'kalem': 'kalem', 'ev': 'ev',
            'kapı': 'kapı', 'yol': 'yol', 'su': 'su', 'ateş': 'ateş',
            'güneş': 'güneş', 'ay': 'ay', 'yıldız': 'yıldız', 'deniz': 'deniz',
            'dağ': 'dağ', 'orman': 'orman', 'çiçek': 'çiçek', 'ağaç': 'ağaç',
            'kuş': 'kuş', 'balık': 'balık', 'at': 'at', 'koyun': 'koyun',
            'insan': 'insan', 'çocuk': 'çocuk', 'kadın': 'kadın', 'erkek': 'erkek',
            'baba': 'baba', 'anne': 'anne', 'kardeş': 'kardeş', 'arkadaş': 'arkadaş',
            'öğretmen': 'öğretmen', 'öğrenci': 'öğrenci', 'doktor': 'doktor',
            'mühendis': 'mühendis', 'avukat': 'avukat', 'tüccar': 'tüccar',
            'zaman': 'zaman', 'gün': 'gün', 'hafta': 'hafta', 'ay': 'ay',
            'yıl': 'yıl', 'saat': 'saat', 'dakika': 'dakika', 'saniye': 'saniye',
            'bugün': 'bugün', 'dün': 'dün', 'yarın': 'yarın', 'şimdi': 'şimdi',
            'sonra': 'sonra', 'önce': 'önce', 'için': 'için', 'ile': 'ile',
            've': 've', 'veya': 'veya', 'ama': 'ama', 'fakat': 'fakat',
            'çünkü': 'çünkü', 'eğer': 'eğer', 'ise': 'ise', 'ki': 'ki',
            'bu': 'bu', 'şu': 'şu', 'o': 'o', 'ben': 'ben', 'sen': 'sen',
            'biz': 'biz', 'siz': 'siz', 'onlar': 'onlar', 'kim': 'kim',
            'ne': 'ne', 'nerede': 'nerede', 'ne zaman': 'ne zaman', 'nasıl': 'nasıl',
            'niçin': 'niçin', 'kaç': 'kaç', 'hangi': 'hangi', 'hangi': 'hangi'
        }

    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Görüntüyü OCR için ön işleme"""
        try:
            # Görüntüyü yükle
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Görüntü yüklenemedi: {image_path}")
            
            # Gri tonlamaya çevir
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Gürültü azaltma
            denoised = cv2.medianBlur(gray, 3)
            
            # Kontrast artırma
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(denoised)
            
            # İkili (binary) görüntü oluştur
            _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Morfolojik işlemler
            kernel = np.ones((1,1), np.uint8)
            cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            
            return cleaned
            
        except Exception as e:
            print(f"Görüntü ön işleme hatası: {e}", file=sys.stderr)
            return None

    def detect_text_regions(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Metin bölgelerini tespit et"""
        try:
            # Kenar tespiti
            edges = cv2.Canny(image, 50, 150, apertureSize=3)
            
            # Konturları bul
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            text_regions = []
            for contour in contours:
                # Kontur alanını hesapla
                area = cv2.contourArea(contour)
                
                # Küçük alanları filtrele
                if area > 100:
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # En-boy oranını kontrol et
                    aspect_ratio = w / h if h > 0 else 0
                    if 0.1 < aspect_ratio < 10:
                        text_regions.append((x, y, w, h))
            
            return text_regions
            
        except Exception as e:
            print(f"Metin bölgesi tespit hatası: {e}", file=sys.stderr)
            return []

    def extract_text_with_tesseract(self, image: np.ndarray, region: Optional[Tuple[int, int, int, int]] = None) -> Tuple[str, float]:
        """Tesseract ile metin çıkar"""
        try:
            if region:
                x, y, w, h = region
                roi = image[y:y+h, x:x+w]
            else:
                roi = image
            
            # Tesseract OCR uygula
            text = pytesseract.image_to_string(
                roi, 
                config=self.tesseract_config,
                lang='eng'  # İngilizce dil paketi kullan (Osmanlıca için)
            )
            
            # Güven skorunu hesapla (basit heuristik)
            confidence = self.calculate_confidence(text)
            
            return text.strip(), confidence
            
        except Exception as e:
            print(f"Tesseract OCR hatası: {e}", file=sys.stderr)
            return "", 0.0

    def calculate_confidence(self, text: str) -> float:
        """Metin güven skorunu hesapla"""
        if not text:
            return 0.0
        
        # Osmanlıca karakter sayısını hesapla
        ottoman_chars = sum(1 for char in text if char in self.ottoman_to_turkish)
        total_chars = len(text.replace(' ', ''))
        
        if total_chars == 0:
            return 0.0
        
        # Temel güven skoru
        base_confidence = ottoman_chars / total_chars
        
        # Metin uzunluğu bonusu
        length_bonus = min(len(text) / 50, 0.2)
        
        # Kelime sayısı bonusu
        word_count = len(text.split())
        word_bonus = min(word_count / 10, 0.1)
        
        return min(base_confidence + length_bonus + word_bonus, 1.0)

    def clean_ottoman_text(self, text: str) -> str:
        """Osmanlıca metni temizle"""
        if not text:
            return ""
        
        # Gereksiz karakterleri temizle
        text = re.sub(r'[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,;:!?()\[\]{}"\'-]', '', text)
        
        # Fazla boşlukları temizle
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()

    def translate_ottoman_to_turkish(self, text: str) -> str:
        """Osmanlıca metni Türkçeye çevir"""
        if not text:
            return ""
        
        # Metni temizle
        cleaned_text = self.clean_ottoman_text(text)
        
        # Karakter bazında çeviri
        translated = ""
        for char in cleaned_text:
            if char in self.ottoman_to_turkish:
                translated += self.ottoman_to_turkish[char]
            else:
                translated += char
        
        # Kelime bazında çeviri
        words = translated.split()
        final_words = []
        
        for word in words:
            # Kelime mapping'inde varsa kullan
            if word.lower() in self.turkish_word_mapping:
                final_words.append(self.turkish_word_mapping[word.lower()])
            else:
                final_words.append(word)
        
        return ' '.join(final_words)

    def process_image(self, image_path: str) -> Dict:
        """Ana işlem fonksiyonu"""
        start_time = time.time()
        
        try:
            # Görüntüyü ön işle
            processed_image = self.preprocess_image(image_path)
            if processed_image is None:
                return {
                    "success": False,
                    "error": "Görüntü ön işlenemedi",
                    "timestamp": time.time()
                }
            
            # Metin bölgelerini tespit et
            text_regions = self.detect_text_regions(processed_image)
            
            # OCR işlemi
            if text_regions:
                # Bölge bazında OCR
                all_texts = []
                total_confidence = 0.0
                
                for region in text_regions:
                    text, confidence = self.extract_text_with_tesseract(processed_image, region)
                    if text:
                        all_texts.append(text)
                        total_confidence += confidence
                
                # Tüm metinleri birleştir
                extracted_text = ' '.join(all_texts)
                avg_confidence = total_confidence / len(text_regions) if text_regions else 0.0
            else:
                # Tüm görüntüde OCR
                extracted_text, avg_confidence = self.extract_text_with_tesseract(processed_image)
            
            # Metni temizle
            cleaned_text = self.clean_ottoman_text(extracted_text)
            
            # Türkçeye çevir
            translated_text = self.translate_ottoman_to_turkish(cleaned_text)
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "extracted_text": cleaned_text,
                "translated_text": translated_text,
                "confidence": avg_confidence,
                "processing_time": processing_time,
                "text_regions_count": len(text_regions),
                "method": "tesseract_ottoman_ocr",
                "timestamp": time.time()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": time.time()
            }

def main():
    """Ana fonksiyon"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Kullanım: python tesseract_ottoman_ocr.py <image_path>"
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({
            "success": False,
            "error": f"Görüntü dosyası bulunamadı: {image_path}"
        }))
        sys.exit(1)
    
    # OCR sistemi başlat
    ocr_system = TesseractOttomanOCR()
    
    # İşlemi gerçekleştir
    result = ocr_system.process_image(image_path)
    
    # JSON formatında çıktı
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
