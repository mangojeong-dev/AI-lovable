<script setup>
import { onMounted, ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useWorkoutStore } from '../stores/workout.js';
import WorkoutForm from '../components/WorkoutForm.vue';
import { SPORT_CATEGORIES, SPORT_LIST } from '../constants/sports.js';

const store = useWorkoutStore();
const route = useRoute();
const filterType = ref('');
const search = ref('');
const selectedSportKey = computed(() => route.params.sportKey || '');
const selectedSport = computed(() => SPORT_CATEGORIES[selectedSportKey.value] || null);
const availableTypes = computed(() => selectedSport.value ? selectedSport.value.types : [...new Set(store.workouts.map((w) => w.type))]);
const isStrengthMode = computed(() => selectedSport.value?.mode === 'strength');

onMounted(() => {
  if (store.workouts.length === 0) store.fetchWorkouts();
  if (selectedSport.value) localStorage.setItem('recentSportKey', selectedSport.value.key);
});

const filtered = computed(() => {
  return store.workouts
    .filter((w) => !selectedSport.value || selectedSport.value.types.includes(w.type))
    .filter((w) => !filterType.value || w.type === filterType.value)
    .filter((w) => !search.value || `${w.note || ''} ${w.exercise || ''}`.includes(search.value))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
});

const types = computed(() => availableTypes.value);

async function onDelete(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  await store.deleteWorkout(id);
}

function moodIcon(mood) {
  switch (mood) {
    case '매우좋음': return 'fa-solid fa-face-grin-stars text-success';
    case '상쾌함': return 'fa-solid fa-face-smile text-primary';
    case '보통': return 'fa-solid fa-face-meh text-secondary';
    case '피곤함': return 'fa-solid fa-face-tired text-warning';
    case '지침': return 'fa-solid fa-face-dizzy text-danger';
    default: return 'fa-solid fa-face-meh';
  }
}
</script>

<template>
  <div class="records-view">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
      <h2 class="mb-0"><i class="fa-solid fa-list text-success me-2"></i>{{ selectedSport ? `${selectedSport.label} 기록` : '운동 기록' }}</h2>
      <div class="sport-quick-nav">
        <RouterLink
          v-for="sport in SPORT_LIST"
          :key="sport.key"
          class="sport-chip"
          :class="{ active: selectedSportKey === sport.key }"
          :to="`/sports/${sport.key}`"
        >
          {{ sport.label }}
        </RouterLink>
      </div>
    </div>

    <p v-if="selectedSport" class="section-caption mb-3">
      <i :class="`${selectedSport.icon} me-1`"></i>{{ selectedSport.description }}
    </p>

    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title"><i class="fa-solid fa-plus-circle text-primary me-1"></i>새 기록 추가</h6>
        <WorkoutForm
          :available-types="availableTypes"
          :default-type="selectedSport?.defaultType || types[0] || '러닝'"
          :mode="selectedSport?.mode || 'endurance'"
          :exercise-options="selectedSport?.exercises || []"
          :note-placeholder="selectedSport ? `${selectedSport.label} 세션 메모를 입력하세요` : '오늘 운동 메모를 남겨보세요'"
        />
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row g-2 mb-3">
          <div class="col-md-3">
            <select class="form-select form-select-sm" v-model="filterType">
              <option value="">전체 종류</option>
              <option v-for="t in types" :key="t">{{ t }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control form-control-sm" placeholder="메모 검색..." v-model="search" />
          </div>
          <div class="col-md-5 text-end text-muted small align-self-center">
            총 {{ filtered.length }}건
          </div>
        </div>

        <div class="table-responsive records-table-wrap">
          <table class="table table-hover align-middle records-table">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>날짜</th>
                <th>종류</th>
                <th v-if="isStrengthMode">운동 종목</th>
                <th class="text-end">시간(분)</th>
                <th class="text-end">칼로리</th>
                <th class="text-end" v-if="!isStrengthMode">거리(km)</th>
                <th class="text-end" v-if="isStrengthMode">무게(kg)</th>
                <th class="text-end" v-if="isStrengthMode">횟수</th>
                <th class="text-end" v-if="isStrengthMode">세트</th>
                <th class="text-end">심박</th>
                <th>컨디션</th>
                <th>메모</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in filtered" :key="w.id">
                <td class="text-muted">{{ w.id }}</td>
                <td>{{ w.date }}</td>
                <td><span class="badge bg-primary-subtle text-primary">{{ w.type }}</span></td>
                <td v-if="isStrengthMode">{{ w.exercise || '-' }}</td>
                <td class="text-end">{{ w.duration }}</td>
                <td class="text-end">{{ w.calories }}</td>
                <td class="text-end" v-if="!isStrengthMode">{{ w.distance }}</td>
                <td class="text-end" v-if="isStrengthMode">{{ w.weight ?? '-' }}</td>
                <td class="text-end" v-if="isStrengthMode">{{ w.reps ?? '-' }}</td>
                <td class="text-end" v-if="isStrengthMode">{{ w.sets ?? '-' }}</td>
                <td class="text-end">{{ w.heartRate }}</td>
                <td><i :class="moodIcon(w.mood)"></i> <span class="small">{{ w.mood }}</span></td>
                <td class="small text-muted">{{ w.note }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger delete-btn" @click="onDelete(w.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td :colspan="isStrengthMode ? 13 : 10" class="text-center text-muted py-4">기록이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.records-view .card-title {
  font-size: 0.97rem;
  font-weight: 700;
  margin-bottom: 0.95rem;
}

.sport-quick-nav {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.sport-chip {
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  border: 1px solid #d7e5fb;
  background: #f8fbff;
  color: #33517f;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 600;
}

.sport-chip.active,
.sport-chip:hover {
  border-color: #86b8ff;
  background: #eaf3ff;
}

.section-caption {
  color: #61748f;
}

.records-table-wrap {
  border: 1px solid #e9edf4;
  border-radius: 12px;
}

.records-table thead th {
  color: #4b5c79;
  font-size: 0.82rem;
  letter-spacing: 0.01em;
  font-weight: 700;
  text-transform: uppercase;
}

.delete-btn:hover {
  transform: translateY(-1px);
}
</style>
