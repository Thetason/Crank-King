import { create } from 'zustand';
import { CharacterStory } from '../characterData';

export interface CharacterPosition {
  characterId: string;
  x: number;
  y: number;
  direction: 'left' | 'right';
  currentBehavior: 'walk' | 'idle' | 'hop' | 'wave' | 'sleep';
  behaviorStartTime: number;
}

interface CharacterWorldState {
  // Character positions and states
  characterPositions: CharacterPosition[];

  // Selected character for story modal
  selectedCharacter: CharacterStory | null;

  // World settings
  worldWidth: number;
  worldHeight: number;
  isWorldActive: boolean;

  // Actions
  initializeWorld: (width: number, height: number) => void;
  updateCharacterPosition: (characterId: string, x: number, y: number, direction: 'left' | 'right') => void;
  updateCharacterBehavior: (characterId: string, behavior: 'walk' | 'idle' | 'hop' | 'wave' | 'sleep') => void;
  selectCharacter: (character: CharacterStory | null) => void;
  setWorldActive: (active: boolean) => void;
  resetWorld: () => void;
}

export const useCharacterWorldStore = create<CharacterWorldState>((set, get) => ({
  characterPositions: [],
  selectedCharacter: null,
  worldWidth: 1200,
  worldHeight: 600,
  isWorldActive: false,

  initializeWorld: (width: number, height: number) => {
    // Initialize characters at random positions
    const initialPositions: CharacterPosition[] = [
      {
        characterId: 'lamb',
        x: width * 0.2,
        y: height * 0.6,
        direction: 'right',
        currentBehavior: 'idle',
        behaviorStartTime: Date.now()
      },
      {
        characterId: 'lion',
        x: width * 0.4,
        y: height * 0.5,
        direction: 'left',
        currentBehavior: 'idle',
        behaviorStartTime: Date.now()
      },
      {
        characterId: 'squirrel',
        x: width * 0.6,
        y: height * 0.7,
        direction: 'right',
        currentBehavior: 'hop',
        behaviorStartTime: Date.now()
      },
      {
        characterId: 'bear',
        x: width * 0.3,
        y: height * 0.4,
        direction: 'right',
        currentBehavior: 'sleep',
        behaviorStartTime: Date.now()
      },
      {
        characterId: 'deer',
        x: width * 0.7,
        y: height * 0.5,
        direction: 'left',
        currentBehavior: 'walk',
        behaviorStartTime: Date.now()
      }
    ];

    set({
      characterPositions: initialPositions,
      worldWidth: width,
      worldHeight: height,
      isWorldActive: true
    });
  },

  updateCharacterPosition: (characterId: string, x: number, y: number, direction: 'left' | 'right') => {
    set((state) => ({
      characterPositions: state.characterPositions.map((pos) =>
        pos.characterId === characterId
          ? { ...pos, x, y, direction }
          : pos
      )
    }));
  },

  updateCharacterBehavior: (characterId: string, behavior: 'walk' | 'idle' | 'hop' | 'wave' | 'sleep') => {
    set((state) => ({
      characterPositions: state.characterPositions.map((pos) =>
        pos.characterId === characterId
          ? { ...pos, currentBehavior: behavior, behaviorStartTime: Date.now() }
          : pos
      )
    }));
  },

  selectCharacter: (character: CharacterStory | null) => {
    set({ selectedCharacter: character });
  },

  setWorldActive: (active: boolean) => {
    set({ isWorldActive: active });
  },

  resetWorld: () => {
    const { worldWidth, worldHeight } = get();
    get().initializeWorld(worldWidth, worldHeight);
    set({ selectedCharacter: null });
  }
}));
