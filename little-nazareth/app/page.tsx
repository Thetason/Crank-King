"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { characters, getCharacterById } from "@/lib/characters";

// 히어로 영상 데이터 - 현재는 램비 영상만 사용
const heroVideos = [
  {
    id: "lamb",
    name: "램비",
    videoUrl: "/hero-videos/lamb-story.mp4",
    character: "🐑",
    color: "#FFB3BA",
  },
];

// 캐릭터 핫스팟 데이터 - 현재 영상에 나오는 캐릭터만 (램비, 다비)
const characterHotspots = [
  {
    id: "lamb",
    name: "램비",
    emoji: "🐑",
    position: { left: "30%", top: "40%" }, // 영상 속 램비 위치
    color: "#FFB3BA",
    nickname: "수도꼭지 울보",
    story: "실컷 울어도 괜찮아요. 램비가 당신의 눈물을 다 가져가 줄 테니까요.",
  },
  {
    id: "squirrel",
    name: "다비",
    emoji: "🐿️",
    position: { right: "25%", top: "45%" }, // 영상 속 다비 위치
    color: "#D4A574",
    nickname: "조약돌 수집가",
    story: "덜덜 떨면서도 결국 오늘은 버텨낸 당신처럼, 아주 단단한 용기인걸요.",
  },
];

export default function Home() {
  const [showVideo, setShowVideo] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showProductButton, setShowProductButton] = useState(false);
  const [currentHeroVideo, setCurrentHeroVideo] = useState(() => {
    // 페이지 로드시 랜덤하게 하나의 영상 선택
    return heroVideos[Math.floor(Math.random() * heroVideos.length)];
  });
  const introVideoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setTimeout(() => setShowVideo(false), 500);
  };

  // Video Intro
  if (showVideo) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#D4C8ED] via-[#FFB893] to-[#FF9B71]">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: '2px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.6)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="relative max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl">
            <video
              ref={introVideoRef}
              autoPlay
              muted
              onEnded={handleVideoEnd}
              className="w-full h-auto"
            >
              <source src="/intro-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#B5A4D9] via-[#FFB893] to-[#9CC5A1]">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: Math.random() > 0.7 ? '3px' : '2px',
              height: Math.random() > 0.7 ? '3px' : '2px',
              background: Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section with Screenshot */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">

        {/* Top: Logo */}
        <div className="absolute top-12 text-center animate-fade-in">
          <h1
            className="text-5xl md:text-6xl font-bold tracking-wider mb-2"
            style={{
              color: '#8B5E3C',
              textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
              fontFamily: 'Georgia, serif'
            }}
          >
            Little Nazareth
          </h1>
          <p className="text-base text-[#8B7355] tracking-wider">
            하늘 솜사탕 마을
          </p>
        </div>

        {/* Center: Hero Video with Interactive Hotspots */}
        <div className="relative flex items-center justify-center">
          {/* Main Hero Video Area */}
          <div className="relative w-[800px] h-[600px] rounded-3xl overflow-hidden shadow-2xl">
            {/* Background Hero Video */}
            <video
              key={currentHeroVideo.id}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={currentHeroVideo.videoUrl} type="video/mp4" />
              {/* Fallback: 영상 로딩 실패시 이미지 표시 */}
              <img
                src="/little-nazareth-hero.png"
                alt="Little Nazareth Village"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </video>

            {/* Video Character Badge - 현재 재생중인 캐릭터 표시 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentHeroVideo.character}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentHeroVideo.name}의 이야기</p>
                  <p className="text-xs text-gray-500">Little Nazareth</p>
                </div>
              </div>
            </motion.div>

            {/* Interactive Hotspots */}
            {characterHotspots.map((char) => (
              <div
                key={char.id}
                className="absolute group"
                style={char.position}
                onMouseEnter={() => setHoveredId(char.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <motion.button
                  className="relative"
                  onClick={() => setSelectedCharacter(char.id)}
                >
                  {/* 보이지 않는 Hotspot 영역 - 마우스 hover만 감지 */}
                  <div
                    className="relative w-32 h-32 cursor-pointer"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  >
                    {/* 완전히 투명한 영역 */}
                  </div>
                </motion.button>

                {/* Hover Popup - 세부 스토리 */}
                <AnimatePresence>
                  {hoveredId === char.id && (() => {
                    const fullChar = getCharacterById(char.id);
                    if (!fullChar) return null;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-80 pointer-events-none z-50"
                      >
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border-2" style={{ borderColor: char.color }}>
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">{char.emoji}</span>
                            <div>
                              <h4 className="text-xl font-bold" style={{ color: char.color }}>
                                {fullChar.name}
                              </h4>
                              <p className="text-xs text-gray-500">"{fullChar.nickname}"</p>
                            </div>
                          </div>

                          {/* Story */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {fullChar.story}
                            </p>
                          </div>

                          {/* Personality Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {fullChar.personality.map((trait, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-xs rounded-full text-white font-medium"
                                style={{ backgroundColor: char.color }}
                              >
                                {trait}
                              </span>
                            ))}
                          </div>

                          {/* Symbol Item */}
                          {fullChar.symbolItem && (
                            <p className="text-xs text-gray-500 italic mb-3">
                              상징 아이템: {fullChar.symbolItem}
                            </p>
                          )}

                          {/* CTA - 구매하기 버튼 */}
                          <Link
                            href="/products"
                            className="block w-full py-2 text-center rounded-full text-white font-bold text-sm pointer-events-auto hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: char.color }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            구매하기 →
                          </Link>
                        </div>

                        {/* Arrow pointer */}
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent"
                          style={{ borderTopColor: char.color }}
                        />
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: CTA */}
        <div className="absolute bottom-24 flex flex-col items-center gap-6 text-center max-w-3xl animate-reveal px-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#4A3828] mb-3" style={{
              textShadow: '0 2px 20px rgba(255, 255, 255, 0.5)'
            }}>
              마을의 친구들을 만나보세요
            </h2>
            <p className="text-[#8B7355] text-lg">
              각 캐릭터를 클릭하여 그들의 이야기를 들어보세요
            </p>
          </div>

          <Link
            href="/story"
            className="px-8 py-4 text-lg font-bold text-white rounded-full shadow-xl hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #7C6FFF 0%, #9D8FFF 50%, #B5A4FF 100%)',
              boxShadow: '0 10px 30px rgba(124, 111, 255, 0.4)',
            }}
          >
            스토리 보러가기 ✨
          </Link>
        </div>
      </main>

      {/* Top Right - Product Button (expandable on hover) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 z-20"
        onMouseEnter={() => setShowProductButton(true)}
        onMouseLeave={() => setShowProductButton(false)}
      >
        <Link
          href="/products"
          className="flex items-center gap-3 bg-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all overflow-hidden"
          style={{
            padding: showProductButton ? '12px 24px 12px 16px' : '12px 16px',
            width: showProductButton ? 'auto' : '64px',
          }}
        >
          <span className="text-2xl">🛍️</span>
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: showProductButton ? 'auto' : 0,
              opacity: showProductButton ? 1 : 0,
            }}
            className="font-bold text-base whitespace-nowrap"
          >
            상품보러가기
          </motion.span>
        </Link>
      </motion.div>

      {/* Bottom Navigation Bar - 동물의 숲 스타일 */}
      <nav className="absolute bottom-0 left-0 right-0 z-20">
        <div className="flex justify-center px-6 pb-6">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-16 px-20 py-8">
              {/* Menu Item 1 */}
              <Link href="/story" className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="text-4xl">🏠</span>
                </div>
                <span className="text-2xl font-bold text-[#4A3828] group-hover:text-[#7C6FFF] transition-colors leading-tight whitespace-nowrap">
                  리틀 나자렛에서<br />시작하는 새로운 하루
                </span>
              </Link>

              <div className="w-px h-20 bg-gray-300 shrink-0" />

              {/* Menu Item 2 */}
              <Link href="/world" className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="text-4xl">🌍</span>
                </div>
                <span className="text-2xl font-bold text-[#4A3828] group-hover:text-[#7C6FFF] transition-colors whitespace-nowrap">
                  3D 월드
                </span>
              </Link>

              <div className="w-px h-20 bg-gray-300 shrink-0" />

              {/* Menu Item 3 */}
              <Link href="/test" className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="text-4xl">✨</span>
                </div>
                <span className="text-2xl font-bold text-[#4A3828] group-hover:text-[#7C6FFF] transition-colors leading-tight whitespace-nowrap">
                  나한테 꼭 맞는<br />친구찾기 테스트
                </span>
              </Link>

              <div className="w-px h-20 bg-gray-300 shrink-0" />

              {/* Menu Item 4 */}
              <button className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="text-4xl">▶️</span>
                </div>
                <span className="text-2xl font-bold text-[#4A3828] group-hover:text-[#7C6FFF] transition-colors whitespace-nowrap">
                  영상
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* Character Story Modal */}
      <AnimatePresence>
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedCharacter(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const char = characterHotspots.find(c => c.id === selectedCharacter);
                if (!char) return null;
                return (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-7xl mb-4">{char.emoji}</div>
                      <h3 className="text-3xl font-bold mb-2" style={{ color: char.color }}>
                        {char.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">"{char.nickname}"</p>
                      <p className="text-gray-700 text-base leading-relaxed mb-6 px-4">{char.story}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href="/products"
                        className="flex-1 py-3 rounded-full font-bold text-white text-center"
                        style={{ backgroundColor: char.color }}
                        onClick={() => setSelectedCharacter(null)}
                      >
                        구매하기 →
                      </Link>
                      <button
                        onClick={() => setSelectedCharacter(null)}
                        className="flex-1 py-3 rounded-full font-bold border-2 transition-colors"
                        style={{
                          borderColor: char.color,
                          color: char.color
                        }}
                      >
                        닫기
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
