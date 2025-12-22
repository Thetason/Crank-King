export interface CharacterBehavior {
  type: 'walk' | 'idle' | 'hop' | 'wave' | 'sleep';
  duration: number; // milliseconds
  probability: number; // 0-1
}

export interface CharacterStory {
  id: string;
  name: string;
  koreanName: string;
  emoji: string;
  tagline: string;
  story: string;
  personality: string[];
  favoriteThings: string[];
  productId: string;
  imageAsset?: string; // Path to high-fidelity image when available
  behaviors: CharacterBehavior[];
  defaultSpeed: number; // pixels per second
  color: string; // Main character color for theming
}

export const characters: CharacterStory[] = [
  {
    id: 'lamb',
    name: 'Lambie',
    koreanName: '램비',
    emoji: '🐑',
    tagline: '순수한 마음을 가진 작은 양',
    story: `리틀 나사렛 동산에서 가장 순수한 마음을 가진 램비예요.

매일 아침 해가 뜨면 언덕 위에 올라가 친구들에게 인사를 건네고, 부드러운 목소리로 노래를 불러요. 램비의 노래를 듣고 있으면 마음이 따뜻해지고 평화로워진다고 해요.

램비는 친구들을 정말 사랑해요. 누군가 슬퍼하면 곁에 다가가 포근하게 안아주고, 기쁜 일이 있으면 함께 뛰어놀며 기쁨을 나눠요. 작지만 큰 사랑을 품은 램비와 함께라면, 당신의 하루도 더욱 따뜻해질 거예요.`,
    personality: [
      '순수하고 착한 성격',
      '친구들을 돌보는 것을 좋아함',
      '노래 부르기를 좋아함',
      '포옹을 좋아함'
    ],
    favoriteThings: [
      '아침 햇살',
      '푸른 언덕',
      '친구들과 함께하는 시간',
      '따뜻한 포옹'
    ],
    productId: 'lamb-plush',
    behaviors: [
      { type: 'walk', duration: 3000, probability: 0.4 },
      { type: 'idle', duration: 2000, probability: 0.3 },
      { type: 'hop', duration: 1000, probability: 0.2 },
      { type: 'wave', duration: 1500, probability: 0.1 }
    ],
    defaultSpeed: 30,
    color: '#F5E6D3'
  },
  {
    id: 'lion',
    name: 'Leo',
    koreanName: '레오',
    emoji: '🦁',
    tagline: '용감하고 따뜻한 마음의 사자',
    story: `리틀 나사렛의 용감한 수호자, 레오예요.

겉으로는 강인해 보이지만, 레오는 누구보다 따뜻한 마음을 가지고 있어요. 동산의 친구들이 어려움에 처하면 항상 앞장서서 도와주고, 밤이 되면 별을 바라보며 깊은 생각에 잠기곤 해요.

레오의 꿈은 모든 친구들이 평화롭고 행복하게 지내는 것이에요. 때로는 엄격해 보이지만, 그건 친구들을 진심으로 아끼기 때문이에요. 레오와 함께라면 어떤 어려움도 이겨낼 수 있는 용기가 생길 거예요.`,
    personality: [
      '용감하고 정의로움',
      '리더십이 있음',
      '생각이 깊음',
      '친구들을 보호하려는 마음'
    ],
    favoriteThings: [
      '별이 빛나는 밤',
      '높은 바위 위',
      '친구들의 웃음소리',
      '평화로운 시간'
    ],
    productId: 'lion-plush',
    behaviors: [
      { type: 'walk', duration: 4000, probability: 0.3 },
      { type: 'idle', duration: 3000, probability: 0.4 },
      { type: 'wave', duration: 2000, probability: 0.2 },
      { type: 'sleep', duration: 2500, probability: 0.1 }
    ],
    defaultSpeed: 25,
    color: '#E8C4A0'
  },
  {
    id: 'squirrel',
    name: 'Nutty',
    koreanName: '너티',
    emoji: '🐿️',
    tagline: '호기심 많은 작은 다람쥐',
    story: `리틀 나사렛에서 가장 활발하고 호기심 많은 너티예요!

너티는 하루 종일 동산을 뛰어다니며 새로운 것들을 발견해요. 반짝이는 돌멩이, 예쁜 낙엽, 숨겨진 보물... 너티에게는 모든 것이 신기하고 재미있어요.

가끔 너무 호기심이 많아서 작은 실수를 하기도 하지만, 그럴 때마다 웃으면서 다시 일어나요. 너티와 함께라면 평범한 일상도 특별한 모험이 될 거예요. 작은 것에서 큰 기쁨을 찾는 법을 너티가 알려줄게요!`,
    personality: [
      '호기심이 넘침',
      '활발하고 장난기 많음',
      '긍정적이고 낙천적',
      '모험을 좋아함'
    ],
    favoriteThings: [
      '도토리 모으기',
      '나무 타기',
      '숨바꼭질',
      '반짝이는 물건들'
    ],
    productId: 'squirrel-plush',
    behaviors: [
      { type: 'walk', duration: 2000, probability: 0.3 },
      { type: 'hop', duration: 800, probability: 0.4 },
      { type: 'idle', duration: 1500, probability: 0.2 },
      { type: 'wave', duration: 1000, probability: 0.1 }
    ],
    defaultSpeed: 50,
    color: '#D4A574'
  },
  {
    id: 'bear',
    name: 'Honey',
    koreanName: '허니',
    emoji: '🐻',
    tagline: '다정하고 포근한 곰',
    story: `리틀 나사렛의 포근한 친구, 허니예요.

허니는 언제나 느긋하고 여유로워요. 나무 그늘 아래에서 낮잠을 자거나, 꿀을 맛보며 행복한 시간을 보내죠. 하지만 친구가 필요할 때는 언제든 든든한 어깨를 내어줘요.

허니의 포옹은 세상에서 가장 따뜻해요. 힘든 일이 있을 때 허니를 안으면, 모든 걱정이 사라지는 것 같아요. 허니와 함께라면 삶의 작은 즐거움을 음미하는 법을 배울 수 있을 거예요.`,
    personality: [
      '느긋하고 여유로움',
      '다정하고 포근함',
      '위로를 잘 해줌',
      '달콤한 것을 좋아함'
    ],
    favoriteThings: [
      '꿀과 달콤한 간식',
      '낮잠',
      '따뜻한 포옹',
      '나무 그늘'
    ],
    productId: 'bear-plush',
    behaviors: [
      { type: 'walk', duration: 4500, probability: 0.2 },
      { type: 'idle', duration: 3500, probability: 0.4 },
      { type: 'sleep', duration: 3000, probability: 0.3 },
      { type: 'wave', duration: 2000, probability: 0.1 }
    ],
    defaultSpeed: 20,
    color: '#8B6F47'
  },
  {
    id: 'deer',
    name: 'Grace',
    koreanName: '그레이스',
    emoji: '🦌',
    tagline: '우아하고 지혜로운 사슴',
    story: `리틀 나사렛의 지혜로운 안내자, 그레이스예요.

그레이스는 우아한 걸음걸이로 동산을 거닐며, 친구들에게 지혜로운 조언을 해줘요. 오래된 나무들의 이야기를 듣고, 계절의 변화를 가장 먼저 알아차리죠.

조용하지만 강한 내면을 가진 그레이스는, 친구들이 올바른 길을 찾도록 도와줘요. 그레이스와 함께 걸으면, 자연의 아름다움과 삶의 의미를 더 깊이 이해하게 될 거예요.`,
    personality: [
      '우아하고 침착함',
      '지혜롭고 현명함',
      '자연을 사랑함',
      '조용하지만 강인함'
    ],
    favoriteThings: [
      '새벽의 이슬',
      '숲속 산책',
      '계절의 변화',
      '고요한 시간'
    ],
    productId: 'deer-plush',
    behaviors: [
      { type: 'walk', duration: 3500, probability: 0.5 },
      { type: 'idle', duration: 2500, probability: 0.3 },
      { type: 'hop', duration: 1200, probability: 0.1 },
      { type: 'wave', duration: 1800, probability: 0.1 }
    ],
    defaultSpeed: 35,
    color: '#C4A57B'
  }
];

export function getCharacterById(id: string): CharacterStory | undefined {
  return characters.find(char => char.id === id);
}

export function getCharacterByProductId(productId: string): CharacterStory | undefined {
  return characters.find(char => char.productId === productId);
}
