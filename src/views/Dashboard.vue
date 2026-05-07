<script setup>
import { onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { GChart } from 'vue-google-charts';
import { useWorkoutStore } from '../stores/workout.js';
import StatCard from '../components/StatCard.vue';
import { SPORT_LIST } from '../constants/sports.js';

const store = useWorkoutStore();

onMounted(() => {
  if (store.workouts.length === 0) store.fetchWorkouts();
});

// Pie: 운동 종류별 횟수
const pieData = computed(() => {
  const rows = Object.entries(store.countByType).map(([type, count]) => [type, Number(count) || 0]);
  return [['종류', '횟수'], ...rows];
});
const pieOptions = {
  title: '운동 종류 분포',
  pieHole: 0.4,
  chartArea: { width: '90%', height: '80%' },
  legend: { position: 'right' }
};

// Line: 일자별 칼로리
const lineData = computed(() => {
  const rows = store.caloriesByDate.map(([d, c]) => [d, Number(c) || 0]);
  return [['날짜', '칼로리'], ...rows];
});
const lineOptions = {
  title: '일자별 칼로리 소모',
  curveType: 'function',
  legend: { position: 'bottom' },
  colors: ['#dc3545'],
  chartArea: { width: '88%', height: '70%' }
};

// Column: 종류별 평균 시간
const colData = computed(() => {
  const rows = store.avgDurationByType.map(([t, m]) => [t, Number(m) || 0]);
  return [['종류', '평균 시간(분)'], ...rows];
});
const colOptions = {
  title: '운동 종류별 평균 시간',
  legend: { position: 'none' },
  colors: ['#0d6efd'],
  chartArea: { width: '85%', height: '65%' }
};
</script>

<template>
  <div class="dashboard-view">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <h2 class="mb-0"><i class="fa-solid fa-chart-line text-primary me-2"></i>대시보드</h2>
      <div class="d-flex gap-2">
        <RouterLink to="/" class="btn btn-sm btn-outline-primary">
          <i class="fa-solid fa-layer-group me-1"></i> 종목 선택
        </RouterLink>
        <button class="btn btn-sm btn-outline-primary" @click="store.fetchWorkouts()">
          <i class="fa-solid fa-rotate me-1"></i> 새로고침
        </button>
      </div>
    </div>

    <div class="sport-shortcuts mb-3">
      <RouterLink v-for="sport in SPORT_LIST" :key="sport.key" :to="`/sports/${sport.key}`" class="mini-chip">
        <i :class="`${sport.icon} me-1`"></i>{{ sport.label }}
      </RouterLink>
    </div>

    <div v-if="store.error" class="alert alert-danger">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>{{ store.error }}
      <div class="small mt-1">json-server가 실행 중인지 확인하세요. (npm run server)</div>
    </div>

    <div v-if="store.loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else>
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6"><StatCard icon="fa-solid fa-list-check" label="총 운동 횟수" :value="store.totalCount" unit="회" color="primary" /></div>
        <div class="col-md-3 col-6"><StatCard icon="fa-solid fa-clock" label="총 운동 시간" :value="store.totalDuration" unit="분" color="success" /></div>
        <div class="col-md-3 col-6"><StatCard icon="fa-solid fa-fire" label="총 소모 칼로리" :value="store.totalCalories" unit="kcal" color="danger" /></div>
        <div class="col-md-3 col-6"><StatCard icon="fa-solid fa-route" label="총 이동 거리" :value="store.totalDistance" unit="km" color="warning" /></div>
      </div>

      <div class="row g-3">
        <div class="col-lg-6">
          <div class="card chart-card">
            <div class="card-body">
              <GChart type="PieChart" :data="pieData" :options="pieOptions" :settings="{ packages: ['corechart'] }" style="height:340px;" />
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="card chart-card">
            <div class="card-body">
              <GChart type="ColumnChart" :data="colData" :options="colOptions" :settings="{ packages: ['corechart'] }" style="height:340px;" />
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card chart-card">
            <div class="card-body">
              <GChart type="LineChart" :data="lineData" :options="lineOptions" :settings="{ packages: ['corechart'] }" style="height:360px;" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-view .chart-card {
  overflow: hidden;
}

.dashboard-view .chart-card .card-body {
  padding-top: 1.25rem;
}

.sport-shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.mini-chip {
  text-decoration: none;
  border: 1px solid #d8e4f8;
  background: #ffffff;
  color: #3a5275;
  border-radius: 999px;
  font-size: 0.77rem;
  padding: 0.3rem 0.6rem;
  font-weight: 600;
}

.mini-chip:hover {
  border-color: #94bdf7;
  background: #edf4ff;
}
</style>
