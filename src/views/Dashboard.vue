<script setup>
import { onMounted, computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { GChart } from 'vue-google-charts';
import { useWorkoutStore } from '../stores/workout.js';
import StatCard from '../components/StatCard.vue';
import { SPORT_LIST, MOOD_CONFIG } from '../constants/sports.js';

const store = useWorkoutStore();

onMounted(() => {
  if (store.workouts.length === 0) store.fetchWorkouts();
});

// ─── 주간 목표 편집 ───────────────────────────────────────
const showGoalEditor = ref(false);
const goalDraft = ref({ ...store.weeklyGoal });

function openGoalEditor() {
  goalDraft.value = { ...store.weeklyGoal };
  showGoalEditor.value = true;
}
function saveGoal() {
  store.saveWeeklyGoal({ ...goalDraft.value });
  showGoalEditor.value = false;
}

// ─── 차트 데이터 ──────────────────────────────────────────
const pieData = computed(() => {
  const rows = Object.entries(store.countByType).map(([t, c]) => [t, Number(c) || 0]);
  return [['종류', '횟수'], ...rows];
});
const pieOptions = computed(() => ({
  pieHole: 0.42,
  chartArea: { width: '92%', height: '82%' },
  legend: { position: 'right', textStyle: { color: isDark.value ? '#94a3b8' : '#475569', fontSize: 12 } },
  backgroundColor: 'transparent',
  colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316','#22c55e','#a855f7'],
  tooltip: { showColorCode: true },
}));

const colData = computed(() => {
  const rows = store.avgDurationByType.map(([t, m]) => [t, Number(m) || 0]);
  return [['종류', '평균 시간(분)'], ...rows];
});
const colOptions = computed(() => ({
  legend: { position: 'none' },
  colors: ['#3b82f6'],
  chartArea: { width: '85%', height: '68%' },
  backgroundColor: 'transparent',
  hAxis: { textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 } },
  vAxis: { textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 }, gridlines: { color: isDark.value ? '#1e293b' : '#f1f5f9' } },
  bar: { groupWidth: '60%' },
}));

const lineData = computed(() => {
  const rows = store.caloriesByDate.map(([d, c]) => [d, Number(c) || 0]);
  return [['날짜', '칼로리'], ...rows];
});
const lineOptions = computed(() => ({
  curveType: 'function',
  legend: { position: 'none' },
  colors: ['#ef4444'],
  chartArea: { width: '90%', height: '72%' },
  backgroundColor: 'transparent',
  hAxis: { textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 10 }, slantedText: true, slantedTextAngle: 45 },
  vAxis: { textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 }, gridlines: { color: isDark.value ? '#1e293b' : '#f1f5f9' } },
  series: { 0: { areaOpacity: 0.15 } },
}));

const monthlyBarData = computed(() => {
  const rows = store.monthlyStats.map((m) => [m.month.slice(5) + '월', m.sessions]);
  return [['월', '운동 횟수'], ...rows];
});
const monthlyBarOptions = computed(() => ({
  legend: { position: 'none' },
  colors: ['#8b5cf6'],
  chartArea: { width: '85%', height: '68%' },
  backgroundColor: 'transparent',
  hAxis: { textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 } },
  vAxis: { textStyle: { color: isDark.value ? '#94a3b8' : '#64748b', fontSize: 11 }, gridlines: { color: isDark.value ? '#1e293b' : '#f1f5f9' } },
  bar: { groupWidth: '60%' },
}));

// 다크모드 감지
const isDark = ref(document.documentElement.classList.contains('dark'));
const observer = new MutationObserver(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});
onMounted(() => observer.observe(document.documentElement, { attributeFilter: ['class'] }));

// ─── 인사이트 카드 ────────────────────────────────────────
const insights = computed(() => {
  const list = [];
  const ws = store.weeklyStats;
  const wg = store.weeklyGoal;

  if (store.topType) {
    list.push({
      icon: 'fa-solid fa-trophy',
      color: '#f59e0b',
      text: `가장 많이 한 운동은 <b>${store.topType}</b>입니다. (${store.countByType[store.topType]}회)`
    });
  }
  if (ws.sessions >= wg.sessions) {
    list.push({ icon: 'fa-solid fa-star', color: '#10b981', text: `이번 주 운동 목표 <b>${wg.sessions}회</b> 달성했습니다! 🎉` });
  } else {
    const rem = wg.sessions - ws.sessions;
    list.push({ icon: 'fa-solid fa-bullseye', color: '#3b82f6', text: `주간 목표까지 <b>${rem}회</b> 남았습니다. 화이팅!` });
  }
  if (store.avgCaloriesPerSession > 0) {
    list.push({
      icon: 'fa-solid fa-fire',
      color: '#ef4444',
      text: `세션당 평균 소모 칼로리: <b>${store.avgCaloriesPerSession.toLocaleString()} kcal</b>`
    });
  }
  if (store.avgHeartRate > 0) {
    list.push({
      icon: 'fa-solid fa-heart-pulse',
      color: '#ec4899',
      text: `전체 평균 심박수: <b>${store.avgHeartRate} bpm</b>`
    });
  }
  return list;
});

// ─── 컨디션 분포 ──────────────────────────────────────────
const moodDist = computed(() => {
  const map = {};
  store.workouts.forEach((w) => { map[w.mood] = (map[w.mood] || 0) + 1; });
  return Object.entries(map)
    .map(([mood, count]) => ({ mood, count, cfg: MOOD_CONFIG[mood] || { icon: 'fa-solid fa-face-meh', color: 'text-secondary' } }))
    .sort((a, b) => b.count - a.count);
});

const top3Types = computed(() =>
  Object.entries(store.countByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
);
</script>

<template>
  <div class="dashboard-view">

    <!-- 헤더 -->
    <div class="page-header mb-4">
      <div>
        <h2 class="mb-0"><i class="fa-solid fa-chart-line text-primary me-2"></i>대시보드</h2>
        <p class="page-sub">전체 운동 현황을 한눈에 확인하세요</p>
      </div>
      <div class="header-actions">
        <RouterLink to="/" class="btn btn-sm btn-outline-primary">
          <i class="fa-solid fa-layer-group me-1"></i>종목 선택
        </RouterLink>
        <button class="btn btn-sm btn-outline-primary" @click="store.fetchWorkouts()">
          <i :class="['fa-solid fa-rotate', store.loading && 'fa-spin']" class="me-1"></i>새로고침
        </button>
      </div>
    </div>

    <!-- 에러 -->
    <div v-if="store.error" class="alert alert-danger mb-4">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ store.error }}
      <div class="small mt-1">json-server가 실행 중인지 확인하세요. (npm run server)</div>
    </div>

    <!-- 로딩 -->
    <div v-if="store.loading" class="loading-center">
      <div class="spinner-border text-primary"></div>
      <p class="mt-3 text-muted small">데이터 불러오는 중...</p>
    </div>

    <template v-else>

      <!-- ══ 1. 전체 통계 카드 ══════════════════════════════ -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6 col-6">
          <StatCard icon="fa-solid fa-list-check" label="총 운동 횟수"   :value="store.totalCount"    unit="회"  color="primary" :trend="true" :prev="store.weeklyStats.prevSessions" />
        </div>
        <div class="col-xl-3 col-md-6 col-6">
          <StatCard icon="fa-solid fa-clock"      label="총 운동 시간"   :value="store.totalDuration" unit="분"  color="success" />
        </div>
        <div class="col-xl-3 col-md-6 col-6">
          <StatCard icon="fa-solid fa-fire"        label="총 소모 칼로리" :value="store.totalCalories" unit="kcal" color="danger"  :trend="true" :prev="store.weeklyStats.prevCalories" />
        </div>
        <div class="col-xl-3 col-md-6 col-6">
          <StatCard icon="fa-solid fa-route"       label="총 이동 거리"   :value="store.totalDistance" unit="km"  color="warning" />
        </div>
      </div>

      <!-- ══ 2. 주간 목표 & 인사이트 ══════════════════════════ -->
      <div class="row g-3 mb-4">

        <!-- 주간 목표 -->
        <div class="col-lg-5">
          <div class="card h-100">
            <div class="card-body">
              <div class="card-title-row mb-3">
                <h6 class="card-section-title">
                  <i class="fa-solid fa-bullseye text-primary me-2"></i>이번 주 목표
                </h6>
                <button class="btn-edit" @click="openGoalEditor" title="목표 수정">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              </div>

              <!-- 목표 편집 인라인 -->
              <div v-if="showGoalEditor" class="goal-editor mb-3">
                <div class="goal-edit-row">
                  <label class="goal-edit-label">운동 횟수</label>
                  <input type="number" class="form-control form-control-sm goal-input" v-model.number="goalDraft.sessions" min="1" max="21" />
                  <span class="goal-edit-unit">회/주</span>
                </div>
                <div class="goal-edit-row">
                  <label class="goal-edit-label">칼로리</label>
                  <input type="number" class="form-control form-control-sm goal-input" v-model.number="goalDraft.calories" min="100" step="100" />
                  <span class="goal-edit-unit">kcal</span>
                </div>
                <div class="goal-edit-row">
                  <label class="goal-edit-label">운동 시간</label>
                  <input type="number" class="form-control form-control-sm goal-input" v-model.number="goalDraft.duration" min="10" step="10" />
                  <span class="goal-edit-unit">분</span>
                </div>
                <div class="d-flex gap-2 mt-2">
                  <button class="btn btn-sm btn-primary" @click="saveGoal"><i class="fa-solid fa-check me-1"></i>저장</button>
                  <button class="btn btn-sm btn-outline-secondary" @click="showGoalEditor = false">취소</button>
                </div>
              </div>

              <!-- 목표 진행 바 -->
              <div class="goal-list">
                <div class="goal-item">
                  <div class="goal-item-header">
                    <span class="goal-item-label"><i class="fa-solid fa-list-check me-1 text-primary"></i>운동 횟수</span>
                    <span class="goal-item-val">{{ store.weeklyStats.sessions }} / {{ store.weeklyGoal.sessions }}회</span>
                  </div>
                  <div class="goal-bar-track">
                    <div class="goal-bar-fill primary" :style="{ width: store.weeklyProgress.sessions + '%' }"></div>
                  </div>
                  <span class="goal-pct" :class="store.weeklyProgress.sessions >= 100 ? 'done' : ''">{{ store.weeklyProgress.sessions }}%</span>
                </div>
                <div class="goal-item">
                  <div class="goal-item-header">
                    <span class="goal-item-label"><i class="fa-solid fa-fire me-1 text-danger"></i>칼로리</span>
                    <span class="goal-item-val">{{ store.weeklyStats.calories.toLocaleString() }} / {{ store.weeklyGoal.calories.toLocaleString() }} kcal</span>
                  </div>
                  <div class="goal-bar-track">
                    <div class="goal-bar-fill danger" :style="{ width: store.weeklyProgress.calories + '%' }"></div>
                  </div>
                  <span class="goal-pct" :class="store.weeklyProgress.calories >= 100 ? 'done' : ''">{{ store.weeklyProgress.calories }}%</span>
                </div>
                <div class="goal-item">
                  <div class="goal-item-header">
                    <span class="goal-item-label"><i class="fa-solid fa-clock me-1 text-success"></i>운동 시간</span>
                    <span class="goal-item-val">{{ store.weeklyStats.duration }} / {{ store.weeklyGoal.duration }}분</span>
                  </div>
                  <div class="goal-bar-track">
                    <div class="goal-bar-fill success" :style="{ width: store.weeklyProgress.duration + '%' }"></div>
                  </div>
                  <span class="goal-pct" :class="store.weeklyProgress.duration >= 100 ? 'done' : ''">{{ store.weeklyProgress.duration }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 인사이트 + 컨디션 분포 -->
        <div class="col-lg-7">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-section-title mb-3">
                <i class="fa-solid fa-lightbulb text-warning me-2"></i>인사이트
              </h6>
              <div class="insight-list mb-3">
                <div v-for="(ins, i) in insights" :key="i" class="insight-item">
                  <span class="insight-icon" :style="{ color: ins.color, background: ins.color + '18' }">
                    <i :class="ins.icon"></i>
                  </span>
                  <span class="insight-text" v-html="ins.text"></span>
                </div>
              </div>

              <!-- 컨디션 분포 -->
              <h6 class="card-section-title mb-2 mt-3">
                <i class="fa-solid fa-face-smile text-primary me-2"></i>컨디션 분포
              </h6>
              <div class="mood-dist">
                <div v-for="m in moodDist" :key="m.mood" class="mood-bar-row">
                  <span class="mood-bar-label">
                    <i :class="`${m.cfg.icon} ${m.cfg.color}`"></i> {{ m.mood }}
                  </span>
                  <div class="mood-bar-track">
                    <div class="mood-bar-fill" :style="{ width: (m.count / store.totalCount * 100).toFixed(1) + '%', background: '#3b82f6' }"></div>
                  </div>
                  <span class="mood-bar-cnt">{{ m.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ 3. 종목 바로가기 ═══════════════════════════════ -->
      <div class="sport-chips-row mb-4">
        <RouterLink
          v-for="sport in SPORT_LIST" :key="sport.key"
          :to="`/sports/${sport.key}`" class="sport-chip"
          :style="{ '--chip-color': sport.color }"
        >
          <i :class="sport.icon"></i>{{ sport.label }}
        </RouterLink>
      </div>

      <!-- ══ 4. 차트 ════════════════════════════════════════ -->
      <div class="row g-3 mb-3">
        <div class="col-lg-6">
          <div class="card chart-card">
            <div class="card-body">
              <h6 class="chart-title"><i class="fa-solid fa-chart-pie me-2 text-primary"></i>운동 종류 분포</h6>
              <GChart type="PieChart" :data="pieData" :options="pieOptions" :settings="{ packages: ['corechart'] }" style="height:300px;" />
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card chart-card">
            <div class="card-body">
              <h6 class="chart-title"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>종류별 평균 운동 시간</h6>
              <GChart type="ColumnChart" :data="colData" :options="colOptions" :settings="{ packages: ['corechart'] }" style="height:300px;" />
            </div>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="card chart-card">
            <div class="card-body">
              <h6 class="chart-title"><i class="fa-solid fa-fire me-2 text-danger"></i>일자별 칼로리 추이</h6>
              <GChart type="AreaChart" :data="lineData" :options="lineOptions" :settings="{ packages: ['corechart'] }" style="height:300px;" />
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card chart-card">
            <div class="card-body">
              <h6 class="chart-title"><i class="fa-solid fa-calendar me-2 text-primary"></i>월별 운동 횟수</h6>
              <GChart type="ColumnChart" :data="monthlyBarData" :options="monthlyBarOptions" :settings="{ packages: ['corechart'] }" style="height:300px;" />
            </div>
          </div>
        </div>
      </div>

      <!-- ══ 5. TOP 3 종목 ══════════════════════════════════ -->
      <div class="card">
        <div class="card-body">
          <h6 class="card-section-title mb-3">
            <i class="fa-solid fa-medal text-warning me-2"></i>TOP 3 운동 종목
          </h6>
          <div class="top3-row">
            <div v-for="([type, cnt], idx) in top3Types" :key="type" class="top3-item">
              <span class="top3-rank" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
              <span class="top3-name">{{ type }}</span>
              <span class="top3-count">{{ cnt }}회</span>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 1rem;
}
.page-sub { font-size: 0.82rem; color: var(--fit-muted); margin: 0.1rem 0 0; }
.header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.loading-center {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 240px;
}

/* 카드 섹션 타이틀 */
.card-section-title {
  font-size: 0.9rem; font-weight: 700; color: var(--fit-text);
  margin: 0; display: flex; align-items: center;
}
.card-title-row {
  display: flex; align-items: center; justify-content: space-between;
}
.btn-edit {
  border: none; background: none; color: var(--fit-muted);
  cursor: pointer; font-size: 0.85rem; padding: 0.2rem 0.4rem;
  border-radius: 6px; transition: all 0.15s;
}
.btn-edit:hover { background: var(--fit-surface2); color: var(--fit-primary); }

/* 주간 목표 */
.goal-editor {
  background: var(--fit-surface2);
  border-radius: 12px; padding: 0.85rem;
  border: 1px solid var(--fit-border);
}
.goal-edit-row {
  display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;
}
.goal-edit-label { font-size: 0.78rem; font-weight: 600; color: var(--fit-muted); width: 70px; flex-shrink: 0; }
.goal-input { flex: 1; }
.goal-edit-unit { font-size: 0.75rem; color: var(--fit-muted); white-space: nowrap; }

.goal-list { display: flex; flex-direction: column; gap: 1rem; }
.goal-item { }
.goal-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
.goal-item-label  { font-size: 0.8rem; font-weight: 600; color: var(--fit-text2); }
.goal-item-val    { font-size: 0.77rem; color: var(--fit-muted); }

.goal-bar-track { height: 8px; background: var(--fit-border); border-radius: 999px; overflow: hidden; }
.goal-bar-fill  { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.goal-bar-fill.primary { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
.goal-bar-fill.danger  { background: linear-gradient(90deg, #ef4444, #f97316); }
.goal-bar-fill.success { background: linear-gradient(90deg, #10b981, #34d399); }

.goal-pct { font-size: 0.72rem; color: var(--fit-muted); font-weight: 700; }
.goal-pct.done { color: #10b981; }

/* 인사이트 */
.insight-list { display: flex; flex-direction: column; gap: 0.55rem; }
.insight-item {
  display: flex; align-items: flex-start; gap: 0.65rem;
  padding: 0.6rem 0.75rem; border-radius: 10px;
  background: var(--fit-surface2); font-size: 0.83rem; color: var(--fit-text2);
}
.insight-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; flex-shrink: 0;
}
.insight-text { line-height: 1.5; }

/* 컨디션 분포 */
.mood-dist { display: flex; flex-direction: column; gap: 0.45rem; }
.mood-bar-row { display: flex; align-items: center; gap: 0.6rem; }
.mood-bar-label { font-size: 0.77rem; font-weight: 600; color: var(--fit-text2); width: 60px; flex-shrink: 0; }
.mood-bar-track { flex: 1; height: 6px; background: var(--fit-border); border-radius: 999px; overflow: hidden; }
.mood-bar-fill  { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
.mood-bar-cnt   { font-size: 0.75rem; color: var(--fit-muted); font-weight: 700; width: 24px; text-align: right; }

/* 종목 칩 */
.sport-chips-row {
  display: flex; flex-wrap: wrap; gap: 0.45rem;
}
.sport-chip {
  display: flex; align-items: center; gap: 0.4rem;
  text-decoration: none;
  border: 1px solid var(--fit-border);
  background: var(--fit-surface);
  color: var(--fit-text2);
  border-radius: 999px;
  font-size: 0.78rem; font-weight: 600;
  padding: 0.3rem 0.75rem;
  transition: all 0.18s;
}
.sport-chip:hover {
  border-color: var(--chip-color, var(--fit-primary));
  color: var(--chip-color, var(--fit-primary));
  background: color-mix(in srgb, var(--chip-color, #3b82f6) 8%, transparent);
}
.sport-chip i { font-size: 0.75rem; }

/* 차트 */
.chart-card { overflow: hidden; }
.chart-title { font-size: 0.87rem; font-weight: 700; color: var(--fit-text); margin-bottom: 0.2rem; }

/* TOP 3 */
.top3-row { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.top3-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 1rem; border-radius: 12px;
  background: var(--fit-surface2); flex: 1; min-width: 140px;
  border: 1px solid var(--fit-border);
}
.top3-rank {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 800; flex-shrink: 0;
}
.rank-1 { background: linear-gradient(135deg, #f59e0b, #fcd34d); color: #78350f; }
.rank-2 { background: linear-gradient(135deg, #94a3b8, #cbd5e1); color: #1e293b; }
.rank-3 { background: linear-gradient(135deg, #f97316, #fb923c); color: #7c2d12; }
.top3-name  { font-size: 0.9rem; font-weight: 700; color: var(--fit-text); flex: 1; }
.top3-count { font-size: 0.8rem; font-weight: 700; color: var(--fit-muted); }
</style>
