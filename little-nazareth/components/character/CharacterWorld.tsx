'use client';

import { useEffect, useRef, useState } from 'react';
import { useCharacterWorldStore } from '@/lib/store/characterWorldStore';
import { characters, getCharacterById } from '@/lib/characterData';
import { Character } from './Character';
import { CharacterStoryModal } from './CharacterStoryModal';
import { motion } from 'framer-motion';

export function CharacterWorld() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  const {
    characterPositions,
    selectedCharacter,
    worldWidth,
    worldHeight,
    isWorldActive,
    initializeWorld,
    updateCharacterPosition,
    updateCharacterBehavior,
    selectCharacter,
    setWorldActive
  } = useCharacterWorldStore();

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Initialize world on mount and handle resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });

        if (!isWorldActive) {
          initializeWorld(rect.width, rect.height);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [initializeWorld, isWorldActive]);

  // Character movement and behavior animation loop
  useEffect(() => {
    if (!isWorldActive || characterPositions.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Update each character
      characterPositions.forEach((pos) => {
        const character = getCharacterById(pos.characterId);
        if (!character) return;

        // Check if current behavior should end
        const currentBehavior = character.behaviors.find(
          (b) => b.type === pos.currentBehavior
        );
        const behaviorElapsed = now - pos.behaviorStartTime;

        if (currentBehavior && behaviorElapsed >= currentBehavior.duration) {
          // Choose next behavior based on probability
          const rand = Math.random();
          let cumulativeProbability = 0;
          let nextBehavior = pos.currentBehavior;

          for (const behavior of character.behaviors) {
            cumulativeProbability += behavior.probability;
            if (rand <= cumulativeProbability) {
              nextBehavior = behavior.type;
              break;
            }
          }

          updateCharacterBehavior(pos.characterId, nextBehavior);
        }

        // Update position if walking
        if (pos.currentBehavior === 'walk') {
          const speed = character.defaultSpeed * (deltaTime / 1000);
          let newX = pos.x;
          let newDirection = pos.direction;

          // Move character
          if (pos.direction === 'right') {
            newX += speed;
            // Turn around at boundaries
            if (newX > containerSize.width - 50) {
              newDirection = 'left';
              newX = containerSize.width - 50;
            }
          } else {
            newX -= speed;
            // Turn around at boundaries
            if (newX < 50) {
              newDirection = 'right';
              newX = 50;
            }
          }

          updateCharacterPosition(pos.characterId, newX, pos.y, newDirection);
        } else if (pos.currentBehavior === 'hop') {
          // Hopping moves character slowly
          const speed = character.defaultSpeed * 0.3 * (deltaTime / 1000);
          let newX = pos.x;
          let newDirection = pos.direction;

          if (pos.direction === 'right') {
            newX += speed;
            if (newX > containerSize.width - 50) {
              newDirection = 'left';
              newX = containerSize.width - 50;
            }
          } else {
            newX -= speed;
            if (newX < 50) {
              newDirection = 'right';
              newX = 50;
            }
          }

          updateCharacterPosition(pos.characterId, newX, pos.y, newDirection);
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isWorldActive,
    characterPositions,
    containerSize,
    updateCharacterPosition,
    updateCharacterBehavior
  ]);

  const handleCharacterClick = (characterId: string) => {
    const character = getCharacterById(characterId);
    if (character) {
      selectCharacter(character);
    }
  };

  const handleCloseModal = () => {
    selectCharacter(null);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full bg-gradient-to-b from-[#E8F5E9] via-[#F1F8E9] to-[#FFF9C4] overflow-hidden"
        style={{ height: '600px', minHeight: '400px' }}
      >
        {/* Background Hills */}
        <div className="absolute inset-0">
          <svg
            className="absolute bottom-0 w-full h-3/4"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Far hill */}
            <path
              d="M0,200 Q300,120 600,180 T1200,200 L1200,400 L0,400 Z"
              fill="#C8E6C9"
              opacity="0.6"
            />
            {/* Middle hill */}
            <path
              d="M0,250 Q400,170 800,230 T1200,250 L1200,400 L0,400 Z"
              fill="#A5D6A7"
              opacity="0.7"
            />
            {/* Near hill */}
            <path
              d="M0,300 Q300,220 600,280 T1200,300 L1200,400 L0,400 Z"
              fill="#81C784"
              opacity="0.8"
            />
          </svg>

          {/* Decorative elements */}
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-10 right-20 text-6xl"
          >
            ☁️
          </motion.div>

          <motion.div
            animate={{
              x: [0, -15, 0],
              y: [0, 10, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
            className="absolute top-20 left-32 text-5xl opacity-80"
          >
            ☁️
          </motion.div>

          <div className="absolute top-8 left-12 text-7xl">☀️</div>

          {/* Ground decorations */}
          <div className="absolute bottom-16 left-10 text-4xl">🌸</div>
          <div className="absolute bottom-24 right-16 text-3xl">🌼</div>
          <div className="absolute bottom-20 left-1/4 text-3xl">🌺</div>
          <div className="absolute bottom-32 right-1/3 text-2xl">🦋</div>
        </div>

        {/* Title Overlay */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10"
        >
          <h2 className="text-3xl md:text-4xl font-light tracking-wider text-gray-800 mb-2">
            Little Nazareth Hill
          </h2>
          <p className="text-sm text-gray-600 font-light tracking-wide">
            캐릭터를 클릭하여 그들의 이야기를 만나보세요
          </p>
        </motion.div>

        {/* Characters */}
        {characterPositions.map((pos) => {
          const character = getCharacterById(pos.characterId);
          if (!character) return null;

          return (
            <Character
              key={pos.characterId}
              character={character}
              position={pos}
              onClick={() => handleCharacterClick(pos.characterId)}
            />
          );
        })}

        {/* Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{
              y: [0, 10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-gray-600 text-sm font-light tracking-wide flex items-center gap-2"
          >
            <span>아래로 스크롤하여 더 알아보기</span>
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Story Modal */}
      <CharacterStoryModal character={selectedCharacter} onClose={handleCloseModal} />
    </>
  );
}
