"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">MİRAS</h1>
              <img src="/miras.png" alt="Padişah" className="w-12 h-16 object-contain" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sistem:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  Multi-Layer AI
            </span>
          </div>
        </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">


        {/* Main Content - Duolingo Style Roadmap */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🗺️ Osmanlıca Öğrenme Yol Haritası</h2>
            <p className="text-lg text-gray-600 mb-6">
              Duolingo benzeri interaktif Osmanlıca öğrenme deneyimi
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">36</div>
                <div className="text-sm text-green-700">Toplam Ders</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-blue-700">Kategori</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1,250</div>
                <div className="text-sm text-purple-700">Toplam XP</div>
              </div>
            </div>

            {/* Duolingo Style Learning Path */}
            <div className="relative mb-8">
              {/* Path Container */}
              <div className="relative bg-gradient-to-b from-green-50 to-blue-50 rounded-2xl p-8 overflow-hidden">
                


                {/* Learning Stages */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Stage 1: Temel Harfler */}
                  <div className="relative">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div className="text-4xl mb-4 mt-2">🔤</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Temel Harfler</h3>
                      <p className="text-gray-600 mb-4 text-sm">Osmanlıca alfabesinin temel harflerini öğrenin</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 font-medium">2/12</span>
                        <div className="w-16 h-2 bg-green-200 rounded-full">
                          <div className="w-4 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                          </div>

                  {/* Stage 2: Kelime Öğrenme */}
                  <div className="relative">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                          </div>
                      <div className="text-4xl mb-4 mt-2">📚</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Kelime Öğrenme</h3>
                      <p className="text-gray-600 mb-4 text-sm">Temel Osmanlıca kelimeleri öğrenin</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600 font-medium">1/8</span>
                        <div className="w-16 h-2 bg-blue-200 rounded-full">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stage 3: Cümle Yapısı */}
                  <div className="relative">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <div className="text-4xl mb-4 mt-2">📝</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Cümle Yapısı</h3>
                      <p className="text-gray-600 mb-4 text-sm">Osmanlıca cümle yapısını öğrenin</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-600 font-medium">0/6</span>
                        <div className="w-16 h-2 bg-yellow-200 rounded-full">
                          <div className="w-0 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                          </div>

                  {/* Stage 4: İleri Seviye */}
                  <div className="relative">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        4
                          </div>
                      <div className="text-4xl mb-4 mt-2">🎯</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">İleri Seviye</h3>
                      <p className="text-gray-600 mb-4 text-sm">Gelişmiş Osmanlıca metinleri okuyun</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600 font-medium">0/10</span>
                        <div className="w-16 h-2 bg-red-200 rounded-full">
                          <div className="w-0 h-2 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>


                  </div>
        </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-xl text-white shadow-lg transform hover:scale-102 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Öğrenmeye Başlayın!
                </h3>
                <p className="text-lg mb-6 text-blue-100 leading-relaxed">
                  Osmanlıca öğrenme yolculuğunuza başlamak için detaylı yol haritasını inceleyin
                </p>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Yol Haritasını Aç 
                  <span className="ml-2 text-lg">→</span>
                </Link>
          </div>
          </div>
          </div>
        </div>





        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around py-4">
              <Link href="/roadmap" className="flex flex-col items-center space-y-1 text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">Yol Haritası</span>
              </Link>
              <Link href="/text-translation" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs font-medium">Metin Çeviri</span>
              </Link>
              <Link href="/image-translation" className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium">Görsel Çeviri</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}