<script setup>
import { onMounted, ref, computed, inject } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useWorkoutStore } from '../stores/workout.js';
import WorkoutForm from '../components/WorkoutForm.vue';
import EditModal from '../components/EditModal.vue';
import { SPORT_CATEGORIES, SPORT_LIST, MOOD_CONFIG } from '../constants/sports.js';

const store = useWorkoutStore();
const route = useRoute();
const toast = inject('toast');

// ─── 타입별 뱃지 색상 ─────────────────────────────────────
const TYPE_COLORS = {
  '웨이트':   { bg: '#ede9fe', color: '#6d28d9' },
  'HIIT':     { bg: '#fef3c7', color: '#b45309' },
  '크로스핏': { bg: '#fef3c7', color: '#b45309' },
  '러닝':     { bg: '#d1fae5', color: '#065f46' },
  '사이클링': { bg: '#ccfbf1', color: '#0f766e' },
  '수영':     { bg: '#dbeafe', color: '#1d4ed8' },
  '요가':     { bg: '#fce7f3', color: '#9d174d' },
  '필라테스': { bg: '#fce7f3', color: '#9d174d' },
  '스트레칭': { bg: '#f3f4f6', color: '#4b5563' },
  '복싱':     { bg: '#fee2e2', color: '#991b1b' },
  '클라이밍': { bg: '#ffedd5', color: '#c2410c' },
};

function getBadgeStyle(type) {
  const c = TYPE_COLORS[type] || { bg: '#f1f5f9', color: '#475569' };
  return { background: c.bg, color: c.color };
}

// 다크모드 시 뱃지 색상 보정
function getBadgeStyleDark(type) {
  const c = TYPE_COLORS[type] || { bg: '#1e293b', color: '#94a3b8' };
  return {
    background: c.bg.replace('#', '#') + '33',
    color: c.color
  };
}

// ─── 라우트 기반 종목 ─────────────────────────────────────
const selectedSportKey = computed(() => route.params.sportKey || '');
const selectedSport    = computed(() => SPORT_CATEGORIES[selectedSportKey.value] || null);
const availableTypes   = computed(() =>
  selectedSport.value
    ? selectedSport.value.types
    : [...new Set(store.workouts.map((w) => w.type))]
);
const isStrengthMode   = computed(() => selectedSport.value?.mode === 'strength');

onMounted(() => {
  if (store.workouts.length === 0) store.fetchWorkouts();
  if (selectedSport.value) localStorage.setItem('recentSportKey', selectedSport.value.key);
});

// ─── 필터 & 검색 & 정렬 ──────────────────────────────────
const filterType  = ref('');
const search      = ref('');
const sortKey     = ref('date');
const sortDir     = ref('desc');
const PAGE_SIZE   = 15;
const currentPage = ref(1);

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'desc';
  }
  currentPage.value = 1;
}

function sortIcon(key) {
  if (sortKey.value !== key) return 'fa-solid fa-sort';
  return sortDir.value === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
}

function resetPage() { currentPage.value = 1; }

const types = computed(() => availableTypes.value);

const filtered = computed(() => {
  let list = store.workouts
    .filter((w) => !selectedSport.value || selectedSport.value.types.includes(w.type))
    .filter((w) => !filterType.value || w.type === filterType.value)
    .filter((w) =>
      !search.value ||
      `${w.note || ''} ${w.exercise || ''} ${w.type}`
        .toLowerCase()
        .includes(search.value.toLowerCase())
    );

  list = list.slice().sort((a, b) => {
    let va = a[sortKey.value];
    let vb = b[sortKey.value];
    if (sortKey.value === 'date') {
      va = va || '';
      vb = vb || '';
    } else {
      va = Number(va) || 0;
      vb = Number(vb) || 0;
    }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1;
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filtered.value.slice(start, start + PAGE_SIZE);
});

// 페이지 번호 목록 (최대 7개 버튼)
const pageList = computed(() => {
  const total = totalPages.value;
  const cur   = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, cur]);
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) {
    pages.add(i);
  }
  return [...pages].sort((a, b) => a - b);
});

// ─── 삭제 ─────────────────────────────────────────────────
async function onDelete(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  await store.deleteWorkout(id);
  toast?.value?.show('기록이 삭제되었습니다.', 'warning');
}

// ─── 편집 모달 ────────────────────────────────────────────
const editTarget = ref(null);
function onEdit(workout)  { editTarget.value = { ...workout }; }
function onEditClose()    { editTarget.value = null; }
function onEditSaved()    {
  editTarget.value = null;
  toast?.value?.show('기록이 수정되었습니다!', 'success');
}

// ─── 컨디션 아이콘 ────────────────────────────────────────
function moodCfg(mood) {
  return MOOD_CONFIG[mood] || { icon: 'fa-solid fa-face-meh', color: 'text-secondary' };
}
</script>

<template>
  <div class="records-view">

    <!-- ── 헤더 ─────────────────────────────────────────── -->
    <div class="page-header mb-4">
      <div>
        <h2 class="mb-0">
          <i
            :class="selectedSport ? selectedSport.icon : 'fa-solid fa-list-check'"
            class="me-2"
            :style="selectedSport ? { color: selectedSport.color } : { color: 'var(--fit-success)' }"
          ></i>
          {{ selectedSport ? `${selectedSport.label} 기록` : '운동 기록' }}
        </h2>
        <p class="page-sub" v-if="selectedSport">{{ selectedSport.description }}</p>
      </div>

      <div class="sport-quick-nav">
        <RouterLink
          v-for="sport in SPORT_LIST" :key="sport.key"
          class="sport-chip"
          :class="{ active: selectedSportKey === sport.key }"
          :to="`/sports/${sport.key}`"
          :style="selectedSportKey === sport.key
            ? { borderColor: sport.color, color: sport.color, background: sport.color + '14' }
            : {}"
        >
          <i :class="sport.icon"></i>{{ sport.label }}
        </RouterLink>
        <RouterLink
          to="/records"
          class="sport-chip"
          :class="{ active: !selectedSportKey }"
        >
          <i class="fa-solid fa-list"></i>전체
        </RouterLink>
      </div>
    </div>

    <!-- ── 기록 추가 폼 ──────────────────────────────────── -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="form-card-header mb-3">
          <h6 class="form-card-title">
            <i class="fa-solid fa-plus-circle text-primary me-2"></i>새 기록 추가
          </h6>
        </div>
        <WorkoutForm
          :available-types="availableTypes"
          :default-type="selectedSport?.defaultType || types[0] || '러닝'"
          :mode="selectedSport?.mode || 'endurance'"
          :exercise-options="selectedSport?.exercises || []"
          :note-placeholder="
            selectedSport
              ? `${selectedSport.label} 세션 메모를 입력하세요`
              : '오늘 운동 메모를 남겨보세요'
          "
        />
      </div>
    </div>

    <!-- ── 기록 목록 ─────────────────────────────────────── -->
    <div class="card">
      <div class="card-body">

        <!-- 필터 바 -->
        <div class="filter-bar mb-3">
          <div class="filter-left">
            <select
              class="form-select form-select-sm filter-select"
              v-model="filterType"
              @change="resetPage"
            >
              <option value="">전체 종류</option>
              <option v-for="t in types" :key="t">{{ t }}</option>
            </select>
            <div class="search-wrap">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                class="form-control form-control-sm search-input"
                placeholder="종류·메모 검색..."
                v-model="search"
                @input="resetPage"
              />
              <button v-if="search" class="search-clear" @click="search = ''; resetPage()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="filter-right">
            <span class="records-count">
              총 <b>{{ filtered.length }}</b>건
            </span>
          </div>
        </div>

        <!-- 로딩 -->
        <div v-if="store.loading" class="text-center py-5">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span class="text-muted small ms-2">불러오는 중...</span>
        </div>

        <!-- 테이블 -->
        <div v-else class="table-responsive records-table-wrap">
          <table class="table table-hover align-middle records-table">
            <thead>
              <tr>
                <th class="th-sort" @click="setSort('date')">
                  날짜 <i :class="sortIcon('date')"></i>
                </th>
                <th>종류</th>
                <th v-if="isStrengthMode">종목</th>
                <th class="th-sort text-end" @click="setSort('duration')">
                  시간(분) <i :class="sortIcon('duration')"></i>
                </th>
                <th class="th-sort text-end" @click="setSort('calories')">
                  칼로리 <i :class="sortIcon('calories')"></i>
                </th>
                <th class="text-end" v-if="!isStrengthMode">거리(km)</th>
                <th class="text-end" v-if="isStrengthMode">무게(kg)</th>
                <th class="text-end" v-if="isStrengthMode">횟수</th>
                <th class="text-end" v-if="isStrengthMode">세트</th>
                <th class="th-sort text-end" @click="setSort('heartRate')">
                  심박 <i :class="sortIcon('heartRate')"></i>
                </th>
                <th>컨디션</th>
                <th class="col-note">메모</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in pagedRows" :key="w.id" class="record-row">
                <td class="fw-semibold date-cell">{{ w.date }}</td>
                <td>
                  <span class="type-badge" :style="getBadgeStyle(w.type)">{{ w.type }}</span>
                </td>
                <td v-if="isStrengthMode" class="small text-muted">{{ w.exercise || '—' }}</td>
                <td class="text-end fw-semibold">
                  {{ w.duration }}<span class="unit-txt">분</span>
                </td>
                <td class="text-end">
                  {{ w.calories.toLocaleString() }}<span class="unit-txt">kcal</span>
                </td>
                <td class="text-end" v-if="!isStrengthMode">
                  <span v-if="w.distance > 0">{{ w.distance }}<span class="unit-txt">km</span></span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="text-end" v-if="isStrengthMode">
                  <span v-if="w.weight != null">{{ w.weight }}<span class="unit-txt">kg</span></span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td class="text-end" v-if="isStrengthMode">{{ w.reps ?? '—' }}</td>
                <td class="text-end" v-if="isStrengthMode">{{ w.sets ?? '—' }}</td>
                <td class="text-end">
                  {{ w.heartRate }}<span class="unit-txt">bpm</span>
                </td>
                <td>
                  <span class="mood-chip">
                    <i :class="`${moodCfg(w.mood).icon} ${moodCfg(w.mood).color}`"></i>
                    <span class="small ms-1">{{ w.mood }}</span>
                  </span>
                </td>
                <td class="col-note small text-muted">{{ w.note }}</td>
                <td>
                  <div class="row-actions">
                    <button class="action-btn edit-btn" @click="onEdit(w)" title="수정">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn del-btn" @click="onDelete(w.id)" title="삭제">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="pagedRows.length === 0">
                <td :colspan="isStrengthMode ? 13 : 10" class="empty-row">
                  <i class="fa-solid fa-inbox fa-2x mb-2 d-block"></i>
                  {{ search || filterType ? '검색 결과가 없습니다.' : '아직 기록이 없습니다.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination-row mt-3" v-if="totalPages > 1">
          <button
            class="pg-btn"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <template v-for="(p, idx) in pageList" :key="p">
            <span
              v-if="idx > 0 && p - pageList[idx - 1] > 1"
              class="pg-ellipsis"
            >…</span>
            <button
              class="pg-btn"
              :class="{ active: p === currentPage }"
              @click="currentPage = p"
            >{{ p }}</button>
          </template>
          <button
            class="pg-btn"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
          <span class="pg-info">{{ currentPage }} / {{ totalPages }}</span>
        </div>

      </div>
    </div>

    <!-- ── 편집 모달 ─────────────────────────────────────── -->
    <EditModal
      v-if="editTarget"
      :workout="editTarget"
      @close="onEditClose"
      @saved="onEditSaved"
    />

  </div>
</template>

<style scoped>
/* 헤더 */
.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; flex-wrap: wrap; gap: 1rem;
}
.page-sub { font-size: 0.82rem; color: var(--fit-muted); margin: 0.2rem 0 0; }

/* 종목 칩 */
.sport-quick-nav {
  display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: flex-end;
}
.sport-chip {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.28rem 0.65rem; border-radius: 999px;
  border: 1px solid var(--fit-border); background: var(--fit-surface);
  color: var(--fit-muted); text-decoration: none;
  font-size: 0.76rem; font-weight: 600; transition: all 0.15s;
}
.sport-chip i { font-size: 0.7rem; }
.sport-chip:hover { border-color: var(--fit-primary); color: var(--fit-primary); background: rgba(59,130,246,0.07); }
.sport-chip.active { border-color: var(--fit-primary); color: var(--fit-primary); background: rgba(59,130,246,0.08); }

/* 폼 카드 */
.form-card-header { border-bottom: 1px solid var(--fit-border); padding-bottom: 0.7rem; }
.form-card-title  { font-size: 0.93rem; font-weight: 700; color: var(--fit-text); margin: 0; }

/* 필터 바 */
.filter-bar {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 0.6rem;
}
.filter-left  { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
.filter-right { display: flex; align-items: center; }
.filter-select { width: 120px; }

.search-wrap { position: relative; }
.search-icon {
  position: absolute; left: 0.6rem; top: 50%; transform: translateY(-50%);
  color: var(--fit-muted); font-size: 0.75rem; pointer-events: none;
}
.search-input { padding-left: 1.9rem; padding-right: 1.9rem; width: 210px; }
.search-clear {
  position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
  border: none; background: none; color: var(--fit-muted);
  cursor: pointer; font-size: 0.75rem; padding: 0;
}
.search-clear:hover { color: var(--fit-text); }

.records-count { font-size: 0.82rem; color: var(--fit-muted); }
.records-count b { color: var(--fit-text); font-weight: 700; }

/* 테이블 */
.records-table-wrap {
  border: 1px solid var(--fit-border);
  border-radius: 14px; overflow: hidden;
}
.records-table { margin: 0; }
.records-table thead tr { background: var(--fit-surface2); }
.records-table thead th {
  font-size: 0.74rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--fit-muted); border-bottom: 1px solid var(--fit-border);
  white-space: nowrap; padding: 0.7rem 0.75rem;
}
.th-sort { cursor: pointer; user-select: none; }
.th-sort:hover { color: var(--fit-primary); }
.th-sort i { font-size: 0.68rem; margin-left: 0.3rem; opacity: 0.7; }

.date-cell { white-space: nowrap; }
.unit-txt  { font-size: 0.7rem; color: var(--fit-muted); margin-left: 0.12rem; }

.type-badge {
  display: inline-block; font-size: 0.73rem; font-weight: 700;
  padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap;
}

.mood-chip  { display: inline-flex; align-items: center; white-space: nowrap; }
.col-note   { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 행 액션 */
.row-actions { display: flex; gap: 0.3rem; justify-content: flex-end; }
.action-btn {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid var(--fit-border); background: var(--fit-surface2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.72rem; color: var(--fit-muted);
  transition: all 0.15s;
}
.action-btn:hover { transform: translateY(-1px); }
.edit-btn:hover { border-color: var(--fit-primary); color: var(--fit-primary); background: rgba(59,130,246,0.1); }
.del-btn:hover  { border-color: var(--fit-danger);  color: var(--fit-danger);  background: rgba(239,68,68,0.1); }

/* 빈 상태 */
.empty-row {
  text-align: center; padding: 3rem 1rem;
  color: var(--fit-muted); font-size: 0.88rem;
}

/* 페이지네이션 */
.pagination-row {
  display: flex; align-items: center; justify-content: center;
  gap: 0.3rem; flex-wrap: wrap;
}
.pg-btn {
  width: 34px; height: 34px; border-radius: 9px;
  border: 1px solid var(--fit-border); background: var(--fit-surface);
  color: var(--fit-text2); font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.pg-btn:hover:not(:disabled) { border-color: var(--fit-primary); color: var(--fit-primary); }
.pg-btn.active { background: var(--fit-primary); border-color: var(--fit-primary); color: #fff; }
.pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pg-ellipsis  { color: var(--fit-muted); font-size: 0.82rem; padding: 0 0.15rem; }
.pg-info      { font-size: 0.76rem; color: var(--fit-muted); margin-left: 0.3rem; }

/* 반응형 */
@media (max-width: 640px) {
  .sport-quick-nav  { justify-content: flex-start; }
  .search-input     { width: 160px; }
}
</style>
