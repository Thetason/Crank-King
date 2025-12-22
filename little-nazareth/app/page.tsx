"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CharacterWorld } from "@/components/character/CharacterWorld";

export default function Home() {
  const [showVideo, setShowVideo] = useState(true);
  const [showProductButton, setShowProductButton] = useState(false);
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Interactive Character World */}
      <CharacterWorld />

      {/* Top Right - Product Button (expandable on hover) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-6 right-6 z-20"
        onMouseEnter={() => setShowProductButton(true)}
        onMouseLeave={() => setShowProductButton(false)}
      >
        <a
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
        </a>
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
              <button className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="text-4xl">📚</span>
                </div>
                <span className="text-2xl font-bold text-[#4A3828] group-hover:text-[#7C6FFF] transition-colors whitespace-nowrap">
                  세계관 가이드
                </span>
              </button>

              <div className="w-px h-20 bg-gray-300 shrink-0" />

              {/* Menu Item 3 */}
              <a href="/test" className="flex items-center gap-6 group">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="text-4xl">✨</span>
                </div>
                <span className="text-2xl font-bold text-[#4A3828] group-hover:text-[#7C6FFF] transition-colors leading-tight whitespace-nowrap">
                  나한테 꼭 맞는<br />친구찾기 테스트
                </span>
              </a>

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
    </div>
  );
}
