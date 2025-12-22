'use client';

import { CharacterStory } from '@/lib/characterData';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface CharacterStoryModalProps {
  character: CharacterStory | null;
  onClose: () => void;
}

export function CharacterStoryModal({ character, onClose }: CharacterStoryModalProps) {
  const router = useRouter();

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (character) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [character, onClose]);

  const handlePurchase = () => {
    if (character) {
      router.push(`/products/${character.productId}`);
    }
  };

  return (
    <AnimatePresence>
      {character && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto relative"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Character Hero Section */}
              <div
                className="relative h-64 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: character.color }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-[150px]"
                >
                  {character.emoji}
                </motion.div>

                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Name & Tagline */}
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-2">
                    {character.koreanName}
                  </h2>
                  <p className="text-sm text-gray-600 font-light tracking-wide">
                    {character.name}
                  </p>
                  <p className="text-base text-gray-700 font-light mt-3 italic">
                    "{character.tagline}"
                  </p>
                </div>

                {/* Story */}
                <div className="mb-8">
                  <h3 className="text-xs tracking-widest font-medium text-gray-900 uppercase mb-4">
                    Story
                  </h3>
                  <div className="text-base text-gray-700 font-light leading-relaxed whitespace-pre-line">
                    {character.story}
                  </div>
                </div>

                {/* Personality */}
                <div className="mb-8">
                  <h3 className="text-xs tracking-widest font-medium text-gray-900 uppercase mb-4">
                    Personality
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {character.personality.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-xs text-gray-700 font-light tracking-wide"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Favorite Things */}
                <div className="mb-10">
                  <h3 className="text-xs tracking-widest font-medium text-gray-900 uppercase mb-4">
                    Favorite Things
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {character.favoriteThings.map((thing, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700 font-light">
                        <span className="text-lg">{character.emoji}</span>
                        <span>{thing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Button */}
                <div className="border-t border-gray-200 pt-8">
                  <button
                    onClick={handlePurchase}
                    className="w-full bg-gray-900 text-white py-4 px-8 text-sm tracking-widest font-light hover:bg-gray-800 transition-colors"
                  >
                    {character.koreanName}와 함께하기 →
                  </button>
                  <p className="text-xs text-center text-gray-500 font-light mt-4">
                    클릭하면 제품 페이지로 이동합니다
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
