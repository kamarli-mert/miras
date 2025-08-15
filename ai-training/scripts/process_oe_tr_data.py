#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Osmanlıca-Türkçe Veri Setlerini İşleme Script'i
oe_tr.txt ve oe_tr.xlsx dosyalarını görsel eğitim sistemine entegre eder
"""

import pandas as pd
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple
import re

class OETRDataProcessor:
    """Osmanlıca-Türkçe veri setlerini işleyen sınıf"""
    
    def __init__(self):
        self.data_dir = Path("..")  # Ana dizin
        self.output_dir = Path("data/training")
        self.character_mappings = self._load_character_mappings()
        
    def _load_character_mappings(self) -> Dict[str, str]:
        """Karakter eşleşmelerini yükle"""
        return {
            'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ر': 'r', 'س': 's',
            'ت': 't', 'ب': 'b', 'ی': 'i', 'ه': 'e', 'د': 'd', 'ف': 'f', 'ق': 'k',
            'ع': '', 'ؤ': 'ü', 'ء': '', 'ئ': '', 'آ': 'a', 'أ': 'a', 'إ': 'i',
            'ة': 'e', 'ش': 'ş', 'چ': 'ç', 'ژ': 'j', 'پ': 'p', 'غ': 'ğ', 'ظ': 'z',
            'ط': 't', 'ض': 'd', 'ص': 's', 'ث': 's', 'خ': 'h', 'ح': 'h', 'ذ': 'z',
            'ز': 'z', 'و': 'v', 'ى': 'i', 'ﻻ': 'la', 'ﷲ': 'allah',
        }
    
    def process_txt_file(self, file_path: str) -> List[Dict]:
        """TXT dosyasını işle"""
        print(f"📖 TXT dosyası işleniyor: {file_path}")
        
        word_pairs = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line and '\t' in line:
                        parts = line.split('\t')
                        if len(parts) >= 2:
                            ottoman = parts[0].strip()
                            turkish = parts[1].strip()
                            
                            if ottoman and turkish:
                                word_pairs.append({
                                    'ottoman': ottoman,
                                    'turkish': turkish,
                                    'source': 'txt',
                                    'line': line_num
                                })
            
            print(f"✅ TXT dosyası işlendi: {len(word_pairs)} kelime çifti")
            return word_pairs
            
        except Exception as e:
            print(f"❌ TXT dosyası işlenemedi: {e}")
            return []
    
    def process_xlsx_file(self, file_path: str) -> List[Dict]:
        """XLSX dosyasını işle"""
        print(f"📊 XLSX dosyası işleniyor: {file_path}")
        
        word_pairs = []
        try:
            df = pd.read_excel(file_path)
            print(f"📈 Excel dosyası yüklendi: {len(df)} satır")
            print(f"📋 Sütunlar: {list(df.columns)}")
            
            for index, row in df.iterrows():
                ottoman = str(row.get('OE', '')).strip()
                turkish = str(row.get('TR', '')).strip()
                
                if ottoman and turkish and ottoman != 'nan' and turkish != 'nan':
                    word_pairs.append({
                        'ottoman': ottoman,
                        'turkish': turkish,
                        'source': 'xlsx',
                        'line': index + 1
                    })
            
            print(f"✅ XLSX dosyası işlendi: {len(word_pairs)} kelime çifti")
            return word_pairs
            
        except Exception as e:
            print(f"❌ XLSX dosyası işlenemedi: {e}")
            return []
    
    def analyze_characters(self, word_pairs: List[Dict]) -> Dict:
        """Karakter analizi yap"""
        character_frequency = {}
        character_examples = {}
        
        for pair in word_pairs:
            ottoman_text = pair['ottoman']
            
            for char in ottoman_text:
                if char in self.character_mappings:
                    character_frequency[char] = character_frequency.get(char, 0) + 1
                    
                    if char not in character_examples:
                        character_examples[char] = []
                    
                    if len(character_examples[char]) < 10:  # Her karakter için max 10 örnek
                        character_examples[char].append({
                            'ottoman': ottoman_text,
                            'turkish': pair['turkish']
                        })
        
        return {
            'frequency': character_frequency,
            'examples': character_examples
        }
    
    def create_training_data(self, word_pairs: List[Dict], character_analysis: Dict):
        """Eğitim verileri oluştur"""
        
        # Ana çeviri çiftleri dosyası
        translation_file = self.output_dir / "translation_pairs.json"
        translation_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(translation_file, 'w', encoding='utf-8') as f:
            json.dump({
                'type': 'translation_pairs',
                'data': word_pairs,
                'count': len(word_pairs),
                'sources': list(set([pair['source'] for pair in word_pairs]))
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Çeviri çiftleri kaydedildi: {translation_file}")
        print(f"📊 Toplam {len(word_pairs)} çeviri çifti")
        
        # Karakter analizi dosyası
        char_file = self.output_dir / "character_analysis.json"
        
        with open(char_file, 'w', encoding='utf-8') as f:
            json.dump({
                'type': 'character_analysis',
                'frequency': character_analysis['frequency'],
                'examples': character_analysis['examples'],
                'total_characters': len(character_analysis['frequency'])
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Karakter analizi kaydedildi: {char_file}")
        print(f"📊 Toplam {len(character_analysis['frequency'])} benzersiz karakter")
        
        # Her karakter için örnek dosyaları oluştur
        self.create_character_examples(character_analysis['examples'])
    
    def create_character_examples(self, character_examples: Dict):
        """Her karakter için örnek dosyaları oluştur"""
        
        for char, examples in character_examples.items():
            # Karakter adını belirle
            char_name = self.get_character_name(char)
            
            if char_name:
                char_dir = self.output_dir / char_name
                char_dir.mkdir(parents=True, exist_ok=True)
                
                # Karakter için metin verisi dosyası
                text_file = char_dir / "text_data.json"
                
                with open(text_file, 'w', encoding='utf-8') as f:
                    json.dump({
                        'character': char_name,
                        'ottoman_char': char,
                        'turkish_char': self.character_mappings.get(char, ''),
                        'examples': examples,
                        'count': len(examples)
                    }, f, ensure_ascii=False, indent=2)
                
                print(f"✅ {char_name} için metin verisi oluşturuldu ({len(examples)} örnek)")
    
    def get_character_name(self, char: str) -> str:
        """Karakter için klasör adını belirle"""
        char_mappings = {
            'ا': 'elif', 'ب': 'be', 'پ': 'pe', 'ت': 'te', 'ث': 'se',
            'ج': 'cim', 'ح': 'ha', 'خ': 'hi', 'د': 'dal', 'ذ': 'zel',
            'ر': 're', 'ز': 'ze', 'س': 'sin', 'ش': 'şin', 'ص': 'sad',
            'ض': 'dad', 'ط': 'ta', 'ظ': 'za', 'ع': 'ayn', 'غ': 'gayn',
            'ف': 'fe', 'ق': 'kaf', 'ك': 'kef', 'ل': 'lam', 'م': 'mim',
            'ن': 'nun', 'و': 'vav', 'ه': 'he', 'ي': 'ye'
        }
        
        return char_mappings.get(char, '')
    
    def generate_statistics(self, word_pairs: List[Dict], character_analysis: Dict):
        """İstatistikler oluştur"""
        
        print("\n📊 VERİ SETİ İSTATİSTİKLERİ")
        print("=" * 50)
        
        # Genel istatistikler
        print(f"📝 Toplam kelime çifti: {len(word_pairs)}")
        print(f"🔤 Benzersiz karakter: {len(character_analysis['frequency'])}")
        
        # Kaynak dağılımı
        sources = {}
        for pair in word_pairs:
            source = pair['source']
            sources[source] = sources.get(source, 0) + 1
        
        print(f"📁 Kaynak dağılımı:")
        for source, count in sources.items():
            print(f"   - {source}: {count} kelime çifti")
        
        # En çok kullanılan karakterler
        sorted_chars = sorted(character_analysis['frequency'].items(), 
                            key=lambda x: x[1], reverse=True)
        
        print(f"\n🔤 En çok kullanılan karakterler (İlk 10):")
        for char, count in sorted_chars[:10]:
            char_name = self.get_character_name(char)
            print(f"   - {char} ({char_name}): {count} kez")
        
        # Ortalama kelime uzunluğu
        ottoman_lengths = [len(pair['ottoman']) for pair in word_pairs]
        turkish_lengths = [len(pair['turkish']) for pair in word_pairs]
        
        avg_ottoman = sum(ottoman_lengths) / len(ottoman_lengths)
        avg_turkish = sum(turkish_lengths) / len(turkish_lengths)
        
        print(f"\n📏 Ortalama kelime uzunluğu:")
        print(f"   - Osmanlıca: {avg_ottoman:.1f} karakter")
        print(f"   - Türkçe: {avg_turkish:.1f} karakter")
    
    def run_processing(self):
        """Tüm işleme sürecini çalıştır"""
        print("🚀 Osmanlıca-Türkçe Veri İşleme Başlatılıyor...")
        print("=" * 60)
        
        all_word_pairs = []
        
        # TXT dosyasını işle
        txt_file = self.data_dir / "oe_tr.txt"
        if txt_file.exists():
            txt_pairs = self.process_txt_file(str(txt_file))
            all_word_pairs.extend(txt_pairs)
        else:
            print(f"⚠️ TXT dosyası bulunamadı: {txt_file}")
        
        # XLSX dosyasını işle
        xlsx_file = self.data_dir / "oe_tr.xlsx"
        if xlsx_file.exists():
            xlsx_pairs = self.process_xlsx_file(str(xlsx_file))
            all_word_pairs.extend(xlsx_pairs)
        else:
            print(f"⚠️ XLSX dosyası bulunamadı: {xlsx_file}")
        
        if not all_word_pairs:
            print("❌ Hiç kelime çifti bulunamadı!")
            return
        
        # Karakter analizi
        print("\n🔤 Karakter analizi yapılıyor...")
        character_analysis = self.analyze_characters(all_word_pairs)
        
        # Eğitim verileri oluştur
        print("\n📝 Eğitim verileri oluşturuluyor...")
        self.create_training_data(all_word_pairs, character_analysis)
        
        # İstatistikler
        self.generate_statistics(all_word_pairs, character_analysis)
        
        print("\n✅ Veri işleme tamamlandı!")
        print("🎯 Artık bu verileri görsel eğitim sisteminde kullanabilirsiniz.")

def main():
    """Ana fonksiyon"""
    processor = OETRDataProcessor()
    processor.run_processing()

if __name__ == "__main__":
    main() 