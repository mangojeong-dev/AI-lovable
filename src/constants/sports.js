export const SPORT_CATEGORIES = {
  weight: {
    key: 'weight',
    label: '웨이트 트레이닝',
    icon: 'fa-solid fa-dumbbell',
    description: '세트 중심 근력 운동 기록',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    types: ['웨이트'],
    defaultType: '웨이트',
    mode: 'strength',
    exercises: ['벤치프레스', '스쿼트', '데드리프트', '오버헤드프레스', '랫풀다운', '레그프레스', '바벨로우', '인클라인프레스', '레그컬', '케이블크로스오버']
  },
  crossfit: {
    key: 'crossfit',
    label: '크로스핏 / HIIT',
    icon: 'fa-solid fa-bolt',
    description: '고강도 인터벌/복합 운동 기록',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    types: ['HIIT', '크로스핏'],
    defaultType: 'HIIT',
    mode: 'strength',
    exercises: ['머슬업', '로잉', '월볼', '쓰러스터', '버피', '케틀벨 스윙', '더블언더', '핸드스탠드 푸시업', '링 딥스', '클린앤저크']
  },
  running: {
    key: 'running',
    label: '러닝 / 사이클링',
    icon: 'fa-solid fa-person-running',
    description: '거리와 페이스 중심 기록',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    types: ['러닝', '사이클링'],
    defaultType: '러닝',
    mode: 'endurance'
  },
  swimming: {
    key: 'swimming',
    label: '수영',
    icon: 'fa-solid fa-person-swimming',
    description: '지구력/호흡 중심 수영 기록',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    types: ['수영'],
    defaultType: '수영',
    mode: 'endurance'
  },
  mindBody: {
    key: 'mindBody',
    label: '요가 / 필라테스',
    icon: 'fa-solid fa-spa',
    description: '유연성·호흡·마음 케어 기록',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #a855f7)',
    types: ['요가', '필라테스', '스트레칭'],
    defaultType: '요가',
    mode: 'mindBody'
  },
  sports: {
    key: 'sports',
    label: '격투 / 클라이밍',
    icon: 'fa-solid fa-fist-raised',
    description: '복싱·클라이밍 등 스포츠 기록',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    types: ['복싱', '클라이밍'],
    defaultType: '복싱',
    mode: 'endurance'
  }
};

export const SPORT_LIST = Object.values(SPORT_CATEGORIES);

export const ALL_WORKOUT_TYPES = [
  '웨이트', 'HIIT', '크로스핏', '러닝', '사이클링', '수영',
  '요가', '필라테스', '스트레칭', '복싱', '클라이밍'
];

export const MOOD_CONFIG = {
  '매우좋음': { icon: 'fa-solid fa-face-grin-stars', color: 'text-success', bg: 'bg-success', label: '매우 좋음', score: 5 },
  '상쾌함':  { icon: 'fa-solid fa-face-smile',       color: 'text-primary', bg: 'bg-primary', label: '상쾌함',   score: 4 },
  '보통':    { icon: 'fa-solid fa-face-meh',          color: 'text-secondary', bg: 'bg-secondary', label: '보통', score: 3 },
  '피곤함':  { icon: 'fa-solid fa-face-tired',        color: 'text-warning', bg: 'bg-warning', label: '피곤함',   score: 2 },
  '지침':    { icon: 'fa-solid fa-face-dizzy',        color: 'text-danger',  bg: 'bg-danger',  label: '지침',     score: 1 }
};
