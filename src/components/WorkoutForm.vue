<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useWorkoutStore } from '../stores/workout.js';
import { MOOD_CONFIG } from '../constants/sports.js';

const props = defineProps({
  availableTypes: {
    type: Array,
    default: () => ['러닝','사이클링','수영','웨이트','요가','필라테스','클라이밍','복싱','HIIT','스트레칭']
  },
  defaultType:    { type: String, default: '러닝' },
  notePlaceholder:{ type: String, default: '오늘 컨디션이나 메모를 짧게 남겨보세요' },
  mode:           { type: String, default: 'endurance' },
  exerciseOptions:{ type: Array,  default: () => [] }
});

const store      = useWorkoutStore();
const toast      = inject('toast');
const moods      = Object.keys(MOOD_CONFIG);
const types      = computed(() => props.availableTypes.length ? props.availableTypes : ['러닝']);
const isStrength = computed(() => props.mode === 'strength');
const isMindBody = computed(() => props.mode === 'mindBody');
const availableExercises = computed(() => props.exerciseOptions.length ? props.exerciseOptions : ['기타']);

const initForm = () => ({
  type:      props.defaultType || '러닝',
  exercise:  '',
  date:      new Date().toISOString().slice(0, 10),
  duration:  30,
  calories:  200,
  distance:  0,
  heartRate: 120,
  weight:    20,
  reps:      10,
  sets:      3,
  mood:      '보통',
  note:      ''
});

const form       = ref(initForm());
const submitting = ref(false);
const errors     = ref({});

// props 변경 감지
watch(() => props.defaultType, (next) => {
  if (next && types.value.includes(next)) form.value.type = next;
});
watch(() => props.exerciseOptions, (next) => {
  if (isStrength.value && next.length && !next.includes(form.value.exercise)) {
    form.value.exercise = next[0];
  }
}, { immediate: true });

// ─── 유효성 검사 ──────────────────────────────────────────
function validate() {
  const e = {};
  if (!form.value.date)                          e.date     = '날짜를 선택하세요';
  if (!form.value.duration || form.value.duration < 1) e.duration  = '1분 이상 입력하세요';
  if (form.value.calories < 0)                   e.calories = '0 이상 입력하세요';
  if (form.value.heartRate < 0)                  e.heartRate= '0 이상 입력하세요';
  if (isStrength.value && form.value.weight < 0) e.weight   = '0 이상 입력하세요';
  if (isStrength.value && form.value.reps < 1)   e.reps     = '1 이상 입력하세요';
  if (isStrength.value && form.value.sets < 1)   e.sets     = '1 이상 입력하세요';
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await store.addWorkout({ ...form.value });
    // 메모만 초기화 (나머지는 유지 → 연속 입력 편의)
    form.value.note = '';
    errors.value = {};
    toast?.value?.show('운동 기록이 추가되었습니다!', 'success');
  } catch {
    toast?.value?.show('저장 중 오류가 발생했습니다.', 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="workout-form" novalidate>

    <!-- 1행: 종류 / 종목 / 날짜 -->
    <div class="form-grid-top">
      <div class="fg-cell">
        <label class="flabel">종류</label>
        <select class="form-select form-select-sm" v-model="form.type">
          <option v-for="t in types" :key="t">{{ t }}</option>
        </select>
      </div>
      <div class="fg-cell" v-if="isStrength">
        <label class="flabel">운동 종목</label>
        <select class="form-select form-select-sm" v-model="form.exercise">
          <option v-for="ex in availableExercises" :key="ex">{{ ex }}</option>
        </select>
      </div>
      <div class="fg-cell">
        <label class="flabel">날짜</label>
        <input type="date" class="form-control form-control-sm" :class="{ 'is-invalid': errors.date }" v-model="form.date" required />
        <div class="invalid-feedback" v-if="errors.date">{{ errors.date }}</div>
      </div>
    </div>

    <!-- 2행: 수치 입력 -->
    <div class="form-grid-nums">
      <div class="fg-cell">
        <label class="flabel">시간(분)</label>
        <input type="number" class="form-control form-control-sm" :class="{ 'is-invalid': errors.duration }" v-model.number="form.duration" min="1" />
        <div class="invalid-feedback" v-if="errors.duration">{{ errors.duration }}</div>
      </div>
      <div class="fg-cell">
        <label class="flabel">칼로리</label>
        <input type="number" class="form-control form-control-sm" v-model.number="form.calories" min="0" />
      </div>
      <div class="fg-cell" v-if="!isStrength && !isMindBody">
        <label class="flabel">거리(km)</label>
        <input type="number" step="0.1" class="form-control form-control-sm" v-model.number="form.distance" min="0" />
      </div>
      <div class="fg-cell" v-if="isStrength">
        <label class="flabel">무게(kg)</label>
        <input type="number" step="0.5" class="form-control form-control-sm" :class="{ 'is-invalid': errors.weight }" v-model.number="form.weight" min="0" />
      </div>
      <div class="fg-cell" v-if="isStrength">
        <label class="flabel">횟수</label>
        <input type="number" class="form-control form-control-sm" v-model.number="form.reps" min="1" />
      </div>
      <div class="fg-cell" v-if="isStrength">
        <label class="flabel">세트</label>
        <input type="number" class="form-control form-control-sm" v-model.number="form.sets" min="1" />
      </div>
      <div class="fg-cell">
        <label class="flabel">심박수</label>
        <input type="number" class="form-control form-control-sm" v-model.number="form.heartRate" min="0" />
      </div>
    </div>

    <!-- 3행: 컨디션 선택 (아이콘 버튼) -->
    <div>
      <label class="flabel mb-2">컨디션</label>
      <div class="mood-row">
        <button
          v-for="m in moods" :key="m" type="button"
          :class="['mood-btn', { active: form.mood === m }]"
          @click="form.mood = m"
        >
          <i :class="MOOD_CONFIG[m].icon"></i>
          <span>{{ MOOD_CONFIG[m].label }}</span>
        </button>
      </div>
    </div>

    <!-- 4행: 메모 + 제출 -->
    <div class="form-bottom-row">
      <input
        type="text"
        class="form-control form-control-sm note-input"
        :placeholder="notePlaceholder"
        v-model.trim="form.note"
      />
      <button class="btn btn-primary btn-sm submit-btn" :disabled="submitting">
        <span v-if="submitting">
          <i class="fa-solid fa-spinner fa-spin me-1"></i>저장 중...
        </span>
        <span v-else>
          <i class="fa-solid fa-plus me-1"></i>기록 추가
        </span>
      </button>
    </div>

  </form>
</template>

<style scoped>
.workout-form { display: flex; flex-direction: column; gap: 0.85rem; }

.form-grid-top,
.form-grid-nums {
  display: flex; flex-wrap: wrap; gap: 0.6rem;
}
.fg-cell { flex: 1 1 100px; min-width: 90px; }

.flabel {
  display: block; font-size: 0.76rem; font-weight: 700;
  color: var(--fit-muted); margin-bottom: 0.25rem; letter-spacing: 0.01em;
}

/* 컨디션 */
.mood-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.mood-btn {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.28rem 0.7rem; border-radius: 999px;
  border: 1px solid var(--fit-border);
  background: var(--fit-surface2);
  font-size: 0.78rem; font-weight: 600;
  color: var(--fit-muted); cursor: pointer;
  transition: all 0.15s ease;
}
.mood-btn:hover { border-color: var(--fit-primary); color: var(--fit-primary); background: rgba(59,130,246,0.07); }
.mood-btn.active { border-color: var(--fit-primary); background: rgba(59,130,246,0.12); color: var(--fit-primary); }

/* 메모 + 제출 행 */
.form-bottom-row { display: flex; gap: 0.6rem; align-items: center; }
.note-input { flex: 1; }
.submit-btn { white-space: nowrap; flex-shrink: 0; padding: 0.42rem 1rem; }
</style>
