<script setup>
import { computed, inject } from 'vue';
import { RouterLink } from 'vue-router';
import { SPORT_LIST } from '../constants/sports.js';
import { useWorkoutStore } from '../stores/workout.js';
import { onMounted } from 'vue';

const store = useWorkoutStore();
const toast = inject('toast');

onMounted(() => {
  if (store.workouts.length === 0) store.fetchWorkouts();
});

const recentSportKey = localStorage.getItem('recentSportKey') || '';
const recentSport = computed(() => SPORT_LIST.find((s) => s.key === recentSportKey) || null);

// 간단 요약 통계
const quickStats = computed(() => [
  { icon: 'fa-solid fa-list-check', label: '총 운동', value: store.totalCount, unit: '회', color: '#3b82f6' },
  { icon: 'fa-solid fa-fire',       label: '총 칼로리', value: store.totalCalories.toLocaleString(), unit: 'kcal', color: '#ef4444' },
  { icon: 'fa-solid fa-clock',      label: '총 시간', value: store.totalDuration, unit: '분', color: '#10b981' },
  { icon: 'fa-solid fa-route',      label: '총 거리', value: store.totalDistance, unit: 'km', color: '#f59e0b' },
]);

// 이번 주 활동 히트맵
const activity = computed(() => store.last7DaysActivity);
</script>

<template>
  <!-- ── 히어로 ─────────────────────────────────────────── -->
  <section class="hero-section">
    <div class="hero-bg-blur hero-blur-1"></div>
    <div class="hero-bg-blur hero-blur-2"></div>
    <div class="hero-content">
      <div class="hero-left">
        <p class="hero-kicker">PERSONAL FITNESS TRACKER</p>
        <h1 class="hero-title">
          오늘의 운동,<br>
          <span class="hero-highlight">스마트하게 기록</span>하세요.
        </h1>
        <p class="hero-sub">종목별 맞춤 기록 화면으로 바로 이동합니다. 목표를 설정하고 달성 현황을 한눈에 확인하세요.</p>
        <div class="hero-actions">
          <RouterLink to="/dashboard" class="btn btn-primary btn-hero">
            <i class="fa-solid fa-chart-line me-2"></i>대시보드 보기
          </RouterLink>
          <RouterLink to="/records" class="btn btn-hero-outline">
            <i class="fa-solid fa-plus me-2"></i>기록 추가
          </RouterLink>
        </div>
      </div>

      <!-- 미니 통계 -->
      <div class="hero-stats" v-if="!store.loading && store.totalCount > 0">
        <div class="hero-stat-item" v-for="s in quickStats" :key="s.label">
          <span class="hstat-icon" :style="{ background: s.color + '22', color: s.color }">
            <i :class="s.icon"></i>
          </span>
          <div>
            <div class="hstat-value">{{ s.value }}<span class="hstat-unit">{{ s.unit }}</span></div>
            <div class="hstat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── 이번 주 히트맵 ─────────────────────────────────── -->
  <section class="week-heatmap-section mt-4" v-if="activity.length">
    <div class="section-header mb-2">
      <h6 class="section-label"><i class="fa-solid fa-calendar-week text-primary me-2"></i>최근 7일 활동</h6>
    </div>
    <div class="heatmap-row">
      <div
        v-for="day in activity" :key="day.date"
        :class="['heatmap-cell', day.count > 0 ? (day.count >= 2 ? 'heat-high' : 'heat-low') : 'heat-none']"
        :title="`${day.date} · ${day.count}건`"
      >
        <span class="heat-day">{{ day.label }}</span>
        <span class="heat-count">{{ day.count > 0 ? day.count : '' }}</span>
      </div>
    </div>
  </section>

  <!-- ── 종목 선택 ──────────────────────────────────────── -->
  <section class="sports-section mt-4">
    <div class="section-header mb-3">
      <h2 class="mb-0">종목 선택</h2>
      <p class="section-sub">운동 종목을 고르면 맞춤 기록 화면으로 바로 이동합니다.</p>
    </div>

    <div class="sport-grid">
      <RouterLink
        v-for="sport in SPORT_LIST"
        :key="sport.key"
        class="sport-tile"
        :to="`/sports/${sport.key}`"
      >
        <span class="sport-icon" :style="{ background: sport.gradient }">
          <i :class="sport.icon"></i>
        </span>
        <div class="sport-info">
          <h3>{{ sport.label }}</h3>
          <p>{{ sport.description }}</p>
        </div>
        <span class="sport-arrow"><i class="fa-solid fa-chevron-right"></i></span>

        <!-- 최근 선택 뱃지 -->
        <span v-if="recentSport?.key === sport.key" class="recent-badge">최근</span>
      </RouterLink>
    </div>
  </section>

  <!-- ── 최근 선택 종목 배너 ────────────────────────────── -->
  <section v-if="recentSport" class="resume-banner mt-4">
    <span class="resume-icon" :style="{ background: recentSport.gradient }">
      <i :class="recentSport.icon"></i>
    </span>
    <div class="resume-text">
      <div class="resume-title">이어서 기록할까요?</div>
      <div class="resume-sub">마지막으로 선택한 종목: <b>{{ recentSport.label }}</b></div>
    </div>
    <RouterLink :to="`/sports/${recentSport.key}`" class="btn btn-primary btn-sm ms-auto">
      이어서 기록하기 <i class="fa-solid fa-arrow-right ms-1"></i>
    </RouterLink>
  </section>
</template>

<style scoped>
/* ── 히어로 ─────────────────────────────────────────────── */
.hero-section {
  position: relative; overflow: hidden;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1a3350 100%);
  color: #eef6ff;
}
.hero-bg-blur {
  position: absolute; border-radius: 50%;
  filter: blur(70px); opacity: 0.2; pointer-events: none;
}
.hero-blur-1 { width: 320px; height: 320px; background: #3b82f6; top: -80px; right: -60px; }
.hero-blur-2 { width: 200px; height: 200px; background: #06b6d4; bottom: -40px; left: 40%; }

.hero-content {
  position: relative; z-index: 1;
  display: flex; flex-wrap: wrap;
  gap: 2rem; align-items: flex-start;
}
.hero-left { flex: 1; min-width: 260px; }

.hero-kicker {
  font-size: 0.72rem; letter-spacing: 0.18em;
  color: #67e8f9; font-weight: 700; margin-bottom: 0.7rem;
}
.hero-title {
  font-size: clamp(1.5rem, 1.2rem + 1.8vw, 2.4rem);
  font-weight: 800; line-height: 1.25; margin: 0 0 0.9rem;
}
.hero-highlight {
  background: linear-gradient(90deg, #38bdf8, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub { color: #94a3b8; font-size: 0.93rem; line-height: 1.6; margin-bottom: 1.4rem; }

.hero-actions { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.btn-hero {
  padding: 0.6rem 1.3rem; font-size: 0.9rem;
  box-shadow: 0 8px 22px rgba(59,130,246,0.4);
}
.btn-hero-outline {
  padding: 0.6rem 1.3rem; font-size: 0.9rem; font-weight: 600;
  border-radius: 10px; border: 1px solid rgba(255,255,255,0.25);
  color: #e0f2fe; background: rgba(255,255,255,0.08);
  text-decoration: none; transition: all 0.18s;
}
.btn-hero-outline:hover { background: rgba(255,255,255,0.16); color: #fff; }

/* 미니 통계 */
.hero-stats {
  display: flex; flex-direction: column; gap: 0.7rem;
  min-width: 180px; flex-shrink: 0;
}
.hero-stat-item {
  display: flex; align-items: center; gap: 0.75rem;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(8px);
  padding: 0.65rem 0.9rem; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.1);
}
.hstat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.88rem; flex-shrink: 0;
}
.hstat-value { font-size: 1.05rem; font-weight: 800; color: #f1f5f9; }
.hstat-unit  { font-size: 0.72rem; color: #94a3b8; margin-left: 0.2rem; }
.hstat-label { font-size: 0.72rem; color: #64748b; margin-top: 0.05rem; }

/* ── 히트맵 ──────────────────────────────────────────────── */
.week-heatmap-section {
  background: var(--fit-surface);
  border: 1px solid var(--fit-border);
  border-radius: 16px;
  padding: 1rem 1.2rem;
}
.section-header { }
.section-label { font-size: 0.82rem; font-weight: 700; color: var(--fit-muted); margin: 0; }

.heatmap-row {
  display: flex; gap: 0.5rem;
}
.heatmap-cell {
  flex: 1; min-width: 40px; padding: 0.6rem 0.3rem;
  border-radius: 10px; display: flex; flex-direction: column;
  align-items: center; gap: 0.25rem; cursor: default;
}
.heat-none { background: var(--fit-surface2); }
.heat-low  { background: rgba(59,130,246,0.18); border: 1px solid rgba(59,130,246,0.3); }
.heat-high { background: linear-gradient(135deg, rgba(59,130,246,0.35), rgba(6,182,212,0.3));
             border: 1px solid rgba(59,130,246,0.5); }
.heat-day  { font-size: 0.72rem; font-weight: 700; color: var(--fit-muted); }
.heat-count { font-size: 0.78rem; font-weight: 800; color: var(--fit-primary); min-height: 1em; }

/* ── 종목 그리드 ──────────────────────────────────────────── */
.section-header h2 { margin-bottom: 0.2rem; }
.section-sub { font-size: 0.84rem; color: var(--fit-muted); margin: 0; }

.sport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.85rem;
}

.sport-tile {
  position: relative;
  display: flex; align-items: center; gap: 0.9rem;
  padding: 1rem 1.1rem; border-radius: 16px;
  border: 1px solid var(--fit-border);
  background: var(--fit-surface);
  text-decoration: none; color: var(--fit-text);
  transition: all 0.22s ease;
  overflow: hidden;
}
.sport-tile::after {
  content: ''; position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(135deg, transparent 60%, rgba(59,130,246,0.04));
  pointer-events: none;
}
.sport-tile:hover {
  transform: translateY(-3px);
  border-color: var(--fit-primary);
  box-shadow: var(--fit-shadow-lg);
}

.sport-icon {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1.05rem; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}
.sport-info { flex: 1; min-width: 0; }
.sport-info h3 { font-size: 0.95rem; font-weight: 700; margin: 0 0 0.15rem; }
.sport-info p  { font-size: 0.78rem; color: var(--fit-muted); margin: 0; }

.sport-arrow { color: var(--fit-primary); font-size: 0.8rem; flex-shrink: 0; opacity: 0.6; transition: opacity 0.18s, transform 0.18s; }
.sport-tile:hover .sport-arrow { opacity: 1; transform: translateX(3px); }

.recent-badge {
  position: absolute; top: 0.5rem; right: 0.5rem;
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.06em;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: #fff; padding: 0.15rem 0.45rem; border-radius: 999px;
}

/* ── 이어서 배너 ──────────────────────────────────────────── */
.resume-banner {
  display: flex; align-items: center; gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.2rem; border-radius: 16px;
  background: var(--fit-surface);
  border: 1px solid var(--fit-border);
  box-shadow: var(--fit-shadow);
}
.resume-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 1rem; flex-shrink: 0;
}
.resume-title { font-size: 0.9rem; font-weight: 700; color: var(--fit-text); }
.resume-sub   { font-size: 0.78rem; color: var(--fit-muted); }

@media (max-width: 640px) {
  .hero-section { padding: 1.8rem 1.2rem; }
  .hero-stats   { flex-direction: row; flex-wrap: wrap; }
  .hero-stat-item { flex: 1 1 calc(50% - 0.35rem); min-width: 0; }
  .sport-grid   { grid-template-columns: 1fr; }
  .heatmap-cell { min-width: 0; }
}
</style>
