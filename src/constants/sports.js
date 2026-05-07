export const SPORT_CATEGORIES = {
  weight: {
    key: 'weight',
    label: '웨이트 트레이닝',
    icon: 'fa-solid fa-dumbbell',
    description: '세트 중심 근력 운동 기록',
    types: ['웨이트'],
    defaultType: '웨이트',
    mode: 'strength',
    exercises: ['벤치프레스', '스쿼트', '데드리프트', '오버헤드프레스', '랫풀다운', '레그프레스']
  },
  crossfit: {
    key: 'crossfit',
    label: '크로스핏',
    icon: 'fa-solid fa-bolt',
    description: '고강도 인터벌/복합 운동 기록',
    types: ['HIIT'],
    defaultType: 'HIIT',
    mode: 'strength',
    exercises: ['머슬업', '로잉', '월볼', '쓰러스터', '버피', '케틀벨 스윙']
  },
  running: {
    key: 'running',
    label: '러닝',
    icon: 'fa-solid fa-person-running',
    description: '거리와 페이스 중심 기록',
    types: ['러닝', '사이클링'],
    defaultType: '러닝',
    mode: 'endurance'
  },
  swimming: {
    key: 'swimming',
    label: '수영',
    icon: 'fa-solid fa-person-swimming',
    description: '지구력/호흡 중심 수영 기록',
    types: ['수영'],
    defaultType: '수영',
    mode: 'endurance'
  }
};

export const SPORT_LIST = Object.values(SPORT_CATEGORIES);
