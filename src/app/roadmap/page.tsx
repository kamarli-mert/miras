"use client";

import { useState } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  locked: boolean;
  xp: number;
}

interface SkillCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  completedCount: number;
  totalCount: number;
}

const skillCategories: SkillCategory[] = [
  {
    id: "basic",
    title: "Temel Harfler",
    description: "Osmanlıca alfabesinin temel harflerini öğrenin",
    icon: "🔤",
    color: "green",
    completedCount: 2,
    totalCount: 12,
    lessons: [
      { id: "alif", title: "Elif (ا)", description: "A sesi", completed: true, locked: false, xp: 10 },
      { id: "be", title: "Be (ب)", description: "B sesi", completed: true, locked: false, xp: 10 },
      { id: "cim", title: "Cim (ج)", description: "C sesi", completed: false, locked: false, xp: 10 },
      { id: "dal", title: "Dal (د)", description: "D sesi", completed: false, locked: false, xp: 10 },
      { id: "he", title: "He (ه)", description: "H sesi", completed: false, locked: false, xp: 10 },
      { id: "vav", title: "Vav (و)", description: "V sesi", completed: false, locked: false, xp: 10 },
      { id: "ze", title: "Ze (ز)", description: "Z sesi", completed: false, locked: false, xp: 10 },
      { id: "ha", title: "Ha (ح)", description: "H sesi (kalın)", completed: false, locked: false, xp: 10 },
      { id: "tı", title: "Tı (ط)", description: "T sesi (kalın)", completed: false, locked: false, xp: 10 },
      { id: "yı", title: "Yı (ي)", description: "Y sesi", completed: false, locked: false, xp: 10 },
      { id: "kef", title: "Kef (ك)", description: "K sesi", completed: false, locked: false, xp: 10 },
      { id: "lam", title: "Lam (ل)", description: "L sesi", completed: false, locked: false, xp: 10 },
    ]
  },
  {
    id: "words",
    title: "Kelime Öğrenme",
    description: "Temel Osmanlıca kelimeleri öğrenin",
    icon: "📚",
    color: "blue",
    completedCount: 1,
    totalCount: 8,
    lessons: [
      { id: "greetings", title: "Selamlaşma", description: "Merhaba, selam vb.", completed: true, locked: false, xp: 15 },
      { id: "daily", title: "Günlük Kelimeler", description: "Günlük hayatta kullanılan kelimeler", completed: false, locked: false, xp: 15 },
      { id: "family", title: "Aile", description: "Aile üyeleri", completed: false, locked: false, xp: 15 },
      { id: "numbers", title: "Sayılar", description: "1-100 arası sayılar", completed: false, locked: false, xp: 15 },
      { id: "colors", title: "Renkler", description: "Temel renk isimleri", completed: false, locked: false, xp: 15 },
      { id: "animals", title: "Hayvanlar", description: "Hayvan isimleri", completed: false, locked: false, xp: 15 },
      { id: "food", title: "Yemek", description: "Yemek ve içecek isimleri", completed: false, locked: false, xp: 15 },
      { id: "professions", title: "Meslekler", description: "Meslek isimleri", completed: false, locked: false, xp: 15 },
    ]
  },
  {
    id: "sentences",
    title: "Cümle Yapısı",
    description: "Osmanlıca cümle yapısını öğrenin",
    icon: "📝",
    color: "yellow",
    completedCount: 0,
    totalCount: 6,
    lessons: [
      { id: "basic-sentences", title: "Basit Cümleler", description: "Temel cümle yapıları", completed: false, locked: false, xp: 20 },
      { id: "questions", title: "Soru Cümleleri", description: "Soru kalıpları", completed: false, locked: false, xp: 20 },
      { id: "complex", title: "Karmaşık Cümleler", description: "Birleşik cümleler", completed: false, locked: false, xp: 20 },
      { id: "negative", title: "Olumsuz Cümleler", description: "Olumsuz yapılar", completed: false, locked: false, xp: 20 },
      { id: "past-tense", title: "Geçmiş Zaman", description: "Geçmiş zaman kalıpları", completed: false, locked: false, xp: 20 },
      { id: "future-tense", title: "Gelecek Zaman", description: "Gelecek zaman kalıpları", completed: false, locked: false, xp: 20 },
    ]
  },
  {
    id: "advanced",
    title: "İleri Seviye",
    description: "Gelişmiş Osmanlıca metinleri okuyun",
    icon: "🎯",
    color: "red",
    completedCount: 0,
    totalCount: 10,
    lessons: [
      { id: "historical", title: "Tarihi Metinler", description: "Osmanlı tarih metinleri", completed: false, locked: false, xp: 25 },
      { id: "literary", title: "Edebi Metinler", description: "Şiir ve edebiyat", completed: false, locked: false, xp: 25 },
      { id: "official", title: "Resmi Belgeler", description: "Ferman ve beratlar", completed: false, locked: false, xp: 25 },
      { id: "religious", title: "Dini Metinler", description: "Kuran ve hadisler", completed: false, locked: false, xp: 25 },
      { id: "scientific", title: "Bilimsel Metinler", description: "Tıp ve astronomi", completed: false, locked: false, xp: 25 },
      { id: "philosophy", title: "Felsefi Metinler", description: "İslam felsefesi", completed: false, locked: false, xp: 25 },
      { id: "correspondence", title: "Mektuplar", description: "Resmi ve özel mektuplar", completed: false, locked: false, xp: 25 },
      { id: "chronicles", title: "Vakayinameler", description: "Tarih kayıtları", completed: false, locked: false, xp: 25 },
      { id: "legal", title: "Hukuki Metinler", description: "Kanun ve fetvalar", completed: false, locked: false, xp: 25 },
      { id: "mystical", title: "Tasavvuf Metinleri", description: "Sufi edebiyatı", completed: false, locked: false, xp: 25 },
    ]
  }
];

export default function RoadmapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedCategoryData = skillCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">MİRAS</h1>
              <img src="/miras.png" alt="Padişah" className="w-12 h-16 object-contain" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Seviye:</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Başlangıç
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Puan:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  1,250 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Category Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temel Harfler */}
            <button
              onClick={() => setSelectedCategory('basic')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedCategory === 'basic'
                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg transform scale-105'
                  : 'border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200'
              }`}
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-200 mb-3">
                  <span className="text-2xl">🔤</span>
                </div>
                <h4 className="text-lg font-bold text-green-900">Temel Harfler</h4>
                <p className="text-sm text-green-700 mt-1">Osmanlıca alfabesinin temel harflerini öğrenin</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800">Elif (ا)</span>
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800">Be (ب)</span>
                  <span className="text-green-600">✅</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800">Cim (ج)</span>
                  <span className="text-yellow-600">⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-800">Dal (د)</span>
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">İlerleme</span>
                  <span className="text-sm font-medium text-green-800">2/12 Tamamlandı</span>
                </div>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
            </button>

            {/* Kelime Öğrenme */}
            <button
              onClick={() => setSelectedCategory('words')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedCategory === 'words'
                  ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform scale-105'
                  : 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200'
              }`}
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-200 mb-3">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="text-lg font-bold text-blue-900">Kelime Öğrenme</h4>
                <p className="text-sm text-blue-700 mt-1">Temel Osmanlıca kelimeleri öğrenin</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Selamlaşma</span>
                  <span className="text-blue-600">✅</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Günlük Kelimeler</span>
                  <span className="text-yellow-600">⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Aile</span>
                  <span className="text-gray-400">🔒</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800">Sayılar</span>
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">İlerleme</span>
                  <span className="text-sm font-medium text-blue-800">1/8 Tamamlandı</span>
                </div>
                <div className="mt-2 bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </button>

            {/* Cümle Yapısı */}
            <button
              onClick={() => setSelectedCategory('sentences')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedCategory === 'sentences'
                  ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg transform scale-105'
                  : 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200'
              }`}
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-200 mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="text-lg font-bold text-yellow-900">Cümle Yapısı</h4>
                <p className="text-sm text-yellow-700 mt-1">Osmanlıca cümle yapısını öğrenin</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-800">Basit Cümleler</span>
                  <span className="text-yellow-600">⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-800">Soru Cümleleri</span>
                  <span className="text-gray-400">🔒</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-800">Karmaşık Cümleler</span>
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-700">İlerleme</span>
                  <span className="text-sm font-medium text-yellow-800">0/6 Tamamlandı</span>
                </div>
                <div className="mt-2 bg-yellow-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </button>

            {/* İleri Seviye */}
            <button
              onClick={() => setSelectedCategory('advanced')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedCategory === 'advanced'
                  ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-lg transform scale-105'
                  : 'border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200'
              }`}
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-200 mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="text-lg font-bold text-red-900">İleri Seviye</h4>
                <p className="text-sm text-red-700 mt-1">Gelişmiş Osmanlıca metinleri okuyun</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-800">Tarihi Metinler</span>
                  <span className="text-yellow-600">⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-800">Edebi Metinler</span>
                  <span className="text-gray-400">🔒</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-800">Resmi Belgeler</span>
                  <span className="text-gray-400">🔒</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-800">Dini Metinler</span>
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-red-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-700">İlerleme</span>
                  <span className="text-sm font-medium text-red-800">0/10 Tamamlandı</span>
                </div>
                <div className="mt-2 bg-red-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Yeni</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {selectedCategoryData && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${selectedCategoryData.color}-200`}>
                  <span className="text-3xl">{selectedCategoryData.icon}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedCategoryData.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedCategoryData.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{selectedCategoryData.completedCount}/{selectedCategoryData.totalCount}</div>
                <div className="text-sm text-gray-600">Ders Tamamlandı</div>
              </div>
            </div>

            {/* Duolingo Style Learning Path */}
            <div className="relative">
              {/* Path Container */}
              <div className="relative bg-gradient-to-b from-gray-50 to-blue-50 rounded-2xl p-8 overflow-hidden">

                {/* Lessons Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {selectedCategoryData.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`relative group ${
                        lesson.completed
                          ? 'transform hover:scale-105'
                          : lesson.locked
                          ? 'opacity-60'
                          : 'transform hover:scale-105 cursor-pointer'
                      } transition-all duration-300`}
                    >
                      {/* Lesson Card */}
                      <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                        lesson.completed
                          ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                          : lesson.locked
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-blue-200 bg-white hover:shadow-xl hover:border-blue-300'
                      }`}>
                        
                        {/* Status Badge */}
                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          lesson.completed
                            ? 'bg-green-500'
                            : lesson.locked
                            ? 'bg-gray-400'
                            : 'bg-blue-500'
                        }`}>
                          {lesson.completed ? '✓' : lesson.locked ? '🔒' : (index + 1)}
                        </div>

                        {/* Lesson Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mt-2 ${
                          lesson.completed
                            ? 'bg-green-200 text-green-700'
                            : lesson.locked
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-blue-200 text-blue-700'
                        }`}>
                          <span className="text-xl">
                            {lesson.completed ? '🎉' : lesson.locked ? '🔒' : '📚'}
                          </span>
                        </div>

                        {/* Lesson Content */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">{lesson.title}</h4>
                          <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>
                          
                          {/* XP Badge */}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-medium text-gray-500">XP</span>
                            <span className="text-sm font-bold text-gray-900">{lesson.xp}</span>
                          </div>

                          {/* Progress Indicators */}
                          <div className="flex space-x-1 mb-4">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  lesson.completed
                                    ? 'bg-green-500'
                                    : lesson.locked
                                    ? 'bg-gray-300'
                                    : i === 0
                                    ? 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Action Button */}
                          {!lesson.locked && !lesson.completed && (
                            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:-translate-y-1 shadow-lg">
                              Başla
                            </button>
                          )}
                          
                          {lesson.completed && (
                            <div className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold text-center shadow-lg">
                              Tamamlandı ✓
                            </div>
                          )}
                          
                          {lesson.locked && (
                            <div className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-xl font-semibold text-center">
                              Kilitli 🔒
                            </div>
                          )}
                        </div>

                        {/* Completion Status */}
                        {lesson.completed && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Connection Line removed as requested */}
                    </div>
                  ))}
                </div>

                {/* Overall Progress Bar */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Genel İlerleme</span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedCategoryData.completedCount}/{selectedCategoryData.totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(selectedCategoryData.completedCount / selectedCategoryData.totalCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedCategoryData && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              <span className="text-4xl">🗺️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Yol Haritası</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Yukarıdaki kategorilerden birini seçerek öğrenme yolculuğunuza başlayın. Her kategori size farklı seviyelerde Osmanlıca öğrenme fırsatı sunar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
