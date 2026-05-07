<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { SPORT_LIST } from '../constants/sports.js';

const recentSportKey = localStorage.getItem('recentSportKey') || '';
const recentSport = computed(() => SPORT_LIST.find((sport) => sport.key === recentSportKey) || null);
</script>

<template>
  <section class="landing-hero">
    <p class="hero-kicker mb-2">PERSONAL FITNESS TRACKER</p>
    <h1 class="hero-title">오늘의 운동 목적에 맞춰<br>맞춤 기록 페이지로 시작하세요.</h1>
    <p class="hero-sub mt-3 mb-0">종목을 고르면 해당 운동에 맞는 기록 화면으로 바로 이동합니다.</p>
  </section>

  <section class="sports-section mt-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <h2 class="mb-0">종목 선택</h2>
      <RouterLink to="/dashboard" class="btn btn-outline-primary btn-sm">
        <i class="fa-solid fa-chart-column me-1"></i> 전체 대시보드 보기
      </RouterLink>
    </div>

    <div class="sport-grid">
      <RouterLink
        v-for="sport in SPORT_LIST"
        :key="sport.key"
        class="sport-tile"
        :to="`/sports/${sport.key}`"
      >
        <i :class="sport.icon"></i>
        <div>
          <h3>{{ sport.label }}</h3>
          <p>{{ sport.description }}</p>
        </div>
        <span class="go-arrow"><i class="fa-solid fa-arrow-right"></i></span>
      </RouterLink>
    </div>
  </section>

  <section v-if="recentSport" class="recent-strip mt-4">
    <span class="small text-muted me-2">최근 선택한 종목</span>
    <RouterLink :to="`/sports/${recentSport.key}`" class="btn btn-sm btn-primary">
      <i :class="`${recentSport.icon} me-1`"></i>{{ recentSport.label }} 이어서 기록하기
    </RouterLink>
  </section>
</template>

<style scoped>
.landing-hero {
  padding: 2rem;
  border-radius: 20px;
  background: linear-gradient(130deg, #0f172a, #1f3255 58%, #1f4857);
  color: #eef6ff;
}

.hero-kicker {
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  color: #67e8f9;
  font-weight: 700;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.4rem, 1.1rem + 1.4vw, 2rem);
  line-height: 1.35;
}

.hero-sub {
  color: #c9d7ea;
}

.sport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.sport-tile {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #dce6f5;
  background: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  color: #162235;
  transition: all 0.2s ease;
}

.sport-tile:hover {
  transform: translateY(-2px);
  border-color: #93c5fd;
  background: #ffffff;
  box-shadow: 0 14px 24px rgba(23, 37, 84, 0.11);
}

.sport-tile > i {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #eaf2ff;
  color: #2563eb;
}

.sport-tile h3 {
  margin: 0;
  font-size: 1rem;
}

.sport-tile p {
  margin: 0.2rem 0 0;
  font-size: 0.84rem;
  color: #64748b;
}

.go-arrow {
  margin-left: auto;
  color: #60a5fa;
}

.recent-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
