'use client';

import { CharacterStory } from '@/lib/characterData';
import { CharacterPosition } from '@/lib/store/characterWorldStore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CharacterProps {
  character: CharacterStory;
  position: CharacterPosition;
  onClick: () => void;
}

export function Character({ character, position, onClick }: CharacterProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get animation variants based on current behavior
  const getAnimationVariants = () => {
    switch (position.currentBehavior) {
      case 'hop':
        return {
          animate: {
            y: [0, -20, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      case 'wave':
        return {
          animate: {
            rotate: [0, 15, -15, 15, 0],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      case 'sleep':
        return {
          animate: {
            scale: [1, 0.98, 1],
            opacity: [1, 0.9, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      case 'walk':
        return {
          animate: {
            y: [0, -5, 0],
            transition: {
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
      default: // idle
        return {
          animate: {
            scale: [1, 1.02, 1],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: Math.floor(position.y)
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Character Container */}
      <div className="relative">
        {/* Hover Indicator */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 text-xs font-light tracking-wide text-gray-900 border border-gray-200 shadow-lg">
              {character.koreanName}
              <div className="text-[10px] text-gray-600 mt-0.5">
                클릭하여 스토리 보기
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/95" />
          </motion.div>
        )}

        {/* Character Emoji with Behavior Animation */}
        <motion.div
          {...getAnimationVariants()}
          className="relative select-none"
          style={{
            transform: position.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            filter: isHovered ? 'brightness(1.1) drop-shadow(0 0 20px rgba(0,0,0,0.2))' : 'none',
            transition: 'filter 0.3s ease'
          }}
        >
          <div className="text-7xl md:text-8xl">
            {character.emoji}
          </div>
        </motion.div>

        {/* Shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-16 h-6 rounded-full bg-black/10 blur-sm"
          style={{
            bottom: position.currentBehavior === 'hop' ? '-10px' : '-5px'
          }}
        />

        {/* Behavior Indicator (for debugging/visual feedback) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] text-gray-400 whitespace-nowrap">
            {position.currentBehavior}
          </div>
        )}
      </div>
    </motion.div>
  );
}
