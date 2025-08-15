"use client";

import { useState } from "react";
import Link from "next/link";

interface AdvancedLesson {
  id: string;
  title: string;
  ottomanText: string;
  turkishText: string;
  status: 'locked' | 'completed' | 'active';
  difficulty: 'advanced';
  xp: number;
  icon: string;
  description: string;
}

export default function AdvancedRoadmapPage() {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const advancedLessons: AdvancedLesson[] = [
    {
      id: 'advanced-1',
      title: 'Tarihi Metinler',
      ottomanText: 'دفتردار حضرتلری',
      turkishText: 'Defterdar hazretleri',
      status: 'active',
      difficulty: 'advanced',
      xp: 50,
      icon: '📜',
      description: 'Osmanlı tarihi belgelerini okuyun'
    },
    {
      id: 'advanced-2',
      title: 'Edebi Metinler',
      ottomanText: 'شعر و ادب',
      turkishText: 'Şiir ve edebiyat',
      status: 'locked',
      difficulty: 'advanced',
      xp: 60,
      icon: '📖',
      description: 'Klasik edebi eserleri anlayın'
    },
    {
      id: 'advanced-3',
      title: 'Resmi Belge',
      ottomanText: 'فرمان سلطاني',
      turkishText: 'Sultan fermanı',
      status: 'locked',
      difficulty: 'advanced',
      xp: 70,
      icon: '🏛️',
      description: 'Resmi devlet belgelerini çözümleyin'
    },
    {
      id: 'advanced-4',
      title: 'Dini Metinler',
      ottomanText: 'القرآن الكريم',
      turkishText: 'Kuran-ı Kerim',
      status: 'locked',
      difficulty: 'advanced',
      xp: 80,
      icon: '🕌',
      description: 'Dini metinleri okuyup anlayın'
    },
    {
      id: 'advanced-5',
      title: 'Bilimsel Metin',
      ottomanText: 'علم الفلك',
      turkishText: 'Astronomi bilimi',
      status: 'locked',
      difficulty: 'advanced',
      xp: 90,
      icon: '🔬',
      description: 'Bilimsel eserleri analiz edin'
    },
    {
      id: 'advanced-6',
      title: 'Uzman Seviye',
      ottomanText: 'مستوى الخبير',
      turkishText: 'Uzman seviyesi',
      status: 'locked',
      difficulty: 'advanced',
      xp: 100,
      icon: '👑',
      description: 'En zorlu metinleri çözümleyin'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'active':
        return '⭐';
      case 'locked':
        return '🔒';
      default:
        return '⭕';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-yellow-500';
      case 'locked':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getLessonCardStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 shadow-green-100';
      case 'active':
        return 'bg-yellow-50 border-yellow-200 shadow-yellow-100 animate-pulse';
      case 'locked':
        return 'bg-gray-50 border-gray-200 shadow-gray-100 opacity-60';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/roadmap" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">MİRAS - İleri Seviye</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Seviye:</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  İleri
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Puan:</span>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                  2,450 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <span className="text-4xl">🏛️</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">İleri Seviye Yolculuğu</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Karmaşık Osmanlıca metinleri okuyup anlayın. Tarihi belgelerden edebi eserlere kadar her şeyi keşfedin.
          </p>
        </div>

        {/* Duolingo Style Path */}
        <div className="relative">
          {/* Winding Path */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
              {/* Main Path */}
              <path
                d="M 100 300 Q 200 200 300 300 Q 400 400 500 300 Q 600 200 700 300"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                className="drop-shadow-lg"
              />
              {/* Path Highlights */}
              <path
                d="M 100 300 Q 200 200 300 300"
                stroke="#10B981"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                className="drop-shadow-lg"
              />
            </svg>
          </div>

          {/* Lessons Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`relative ${getLessonCardStyle(lesson.status)} rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}
                onClick={() => setSelectedLesson(lesson.id)}
              >
                {/* Status Indicator */}
                <div className={`absolute -top-3 -right-3 w-8 h-8 ${getStatusColor(lesson.status)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {getStatusIcon(lesson.status)}
                </div>

                {/* Lesson Icon */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                    <span className="text-3xl">{lesson.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                </div>

                {/* Ottoman Text */}
                <div className="bg-white rounded-lg p-3 mb-3 border">
                  <p className="text-lg font-arabic text-center text-gray-800">{lesson.ottomanText}</p>
                </div>

                {/* Turkish Translation */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border">
                  <p className="text-sm text-center text-gray-700">{lesson.turkishText}</p>
                </div>

                {/* XP and Difficulty */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600 font-bold">⚡</span>
                    <span className="text-sm font-medium text-gray-700">{lesson.xp} XP</span>
                  </div>
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    İleri
                  </div>
                </div>

                {/* Progress Line */}
                {index < advancedLessons.length - 1 && (
                  <div className="absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-400 transform -translate-y-1/2 hidden lg:block"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <span className="mr-2">🚀</span>
            İleri Seviyeye Başla
          </button>
        </div>

        {/* Progress Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Tamamlanan</h4>
                <p className="text-2xl font-bold text-green-600">1/6</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Toplam XP</h4>
                <p className="text-2xl font-bold text-orange-600">2,450</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Başarı Oranı</h4>
                <p className="text-2xl font-bold text-blue-600">%85</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around h-16">
            <Link href="/" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium mt-1">Ana Sayfa</span>
            </Link>
            <Link href="/roadmap" className="flex flex-col items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium mt-1">Yol Haritası</span>
            </Link>
            <Link href="/text-translation" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium mt-1">Metin Çeviri</span>
            </Link>
            <Link href="/image-translation" className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium mt-1">Görsel Çeviri</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
