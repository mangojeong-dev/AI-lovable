# 운동 기록 대시보드 (Vue 3 + Pinia + JSON Server)

Vue 3 Composition API, Bootstrap 5, Google Charts, Font Awesome 아이콘, Axios를 사용한 운동 기록 관리 대시보드입니다.

## 기술 스택
- **Vue 3** (Composition API, ES6+)
- **Pinia** (상태 관리, axios로 json-server 연결)
- **Vue Router 4**
- **Bootstrap 5** (UI)
- **Google Charts** (`vue-google-charts`)
- **Font Awesome** (아이콘, CDN)
- **Axios** + **json-server** (Mock REST API)
- **Vite** (빌드 도구)

## 실행 방법

```bash
npm install
npm start
```

- 프론트엔드: http://localhost:5173
- json-server API: http://localhost:3000/workouts

(개별 실행: `npm run server`, `npm run dev`)

## 프로젝트 구조

```
vue-workout-dashboard/
├── db.json                    # json-server 데이터 (운동 기록 100개 샘플)
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.js                # Vue/Pinia/Router 부트스트랩, Bootstrap & FontAwesome import
    ├── App.vue
    ├── router/index.js
    ├── stores/
    │   └── workout.js         # Pinia store - axios로 json-server 연결
    ├── views/
    │   ├── Dashboard.vue      # Google Charts 대시보드
    │   └── Records.vue        # 운동 기록 목록/추가/삭제
    └── components/
        ├── StatCard.vue
        └── WorkoutForm.vue
```

## 데이터 모델

```json
{
  "id": 1,
  "type": "러닝",
  "date": "2025-01-05",
  "duration": 45,
  "calories": 380,
  "distance": 6.2,
  "heartRate": 142,
  "mood": "상쾌함",
  "note": "러닝 세션 #1"
}
```
