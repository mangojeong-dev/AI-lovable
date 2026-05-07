<script setup>
import { ref, computed, watch } from 'vue';
import { useWorkoutStore } from '../stores/workout.js';

const props = defineProps({
  availableTypes: {
    type: Array,
    default: () => ['러닝','사이클링','수영','웨이트','요가','필라테스','클라이밍','복싱','HIIT','스트레칭']
  },
  defaultType: {
    type: String,
    default: '러닝'
  },
  notePlaceholder: {
    type: String,
    default: '오늘 컨디션이나 메모를 짧게 남겨보세요'
  },
  mode: {
    type: String,
    default: 'endurance'
  },
  exerciseOptions: {
    type: Array,
    default: () => []
  }
});

const store = useWorkoutStore();
const moods = ['상쾌함','보통','피곤함','매우좋음','지침'];
const types = computed(() => props.availableTypes.length ? props.availableTypes : ['러닝']);
const isStrengthMode = computed(() => props.mode === 'strength');
const availableExercises = computed(() => props.exerciseOptions.length ? props.exerciseOptions : ['기타']);

const form = ref({
  type: props.defaultType || '러닝',
  exercise: '',
  date: new Date().toISOString().slice(0, 10),
  duration: 30,
  calories: 200,
  distance: 0,
  heartRate: 120,
  weight: 20,
  reps: 10,
  sets: 3,
  mood: '보통',
  note: ''
});

const submitting = ref(false);

watch(
  () => props.defaultType,
  (next) => {
    if (next && types.value.includes(next)) form.value.type = next;
  }
);

watch(
  () => props.exerciseOptions,
  (next) => {
    if (isStrengthMode.value && next.length && !next.includes(form.value.exercise)) {
      form.value.exercise = next[0];
    }
  },
  { immediate: true }
);

async function onSubmit() {
  submitting.value = true;
  try {
    await store.addWorkout({ ...form.value });
    form.value.note = '';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="row g-2 workout-form">
    <div class="col-md-2">
      <label class="form-label small mb-1 fw-semibold">종류</label>
      <select class="form-select form-select-sm" v-model="form.type">
        <option v-for="t in types" :key="t">{{ t }}</option>
      </select>
    </div>
    <div class="col-md-2" v-if="isStrengthMode">
      <label class="form-label small mb-1 fw-semibold">운동 종목</label>
      <select class="form-select form-select-sm" v-model="form.exercise">
        <option v-for="exercise in availableExercises" :key="exercise">{{ exercise }}</option>
      </select>
    </div>
    <div class="col-md-2">
      <label class="form-label small mb-1 fw-semibold">날짜</label>
      <input type="date" class="form-control form-control-sm" v-model="form.date" required />
    </div>
    <div class="col-md-1">
      <label class="form-label small mb-1 fw-semibold">시간(분)</label>
      <input type="number" class="form-control form-control-sm" v-model.number="form.duration" min="1" />
    </div>
    <div class="col-md-1">
      <label class="form-label small mb-1 fw-semibold">칼로리</label>
      <input type="number" class="form-control form-control-sm" v-model.number="form.calories" min="0" />
    </div>
    <div class="col-md-1" v-if="!isStrengthMode">
      <label class="form-label small mb-1 fw-semibold">거리(km)</label>
      <input type="number" step="0.1" class="form-control form-control-sm" v-model.number="form.distance" min="0" />
    </div>
    <div class="col-md-1" v-if="isStrengthMode">
      <label class="form-label small mb-1 fw-semibold">무게(kg)</label>
      <input type="number" step="0.5" class="form-control form-control-sm" v-model.number="form.weight" min="0" />
    </div>
    <div class="col-md-1" v-if="isStrengthMode">
      <label class="form-label small mb-1 fw-semibold">횟수</label>
      <input type="number" class="form-control form-control-sm" v-model.number="form.reps" min="1" />
    </div>
    <div class="col-md-1" v-if="isStrengthMode">
      <label class="form-label small mb-1 fw-semibold">세트</label>
      <input type="number" class="form-control form-control-sm" v-model.number="form.sets" min="1" />
    </div>
    <div class="col-md-1">
      <label class="form-label small mb-1 fw-semibold">심박</label>
      <input type="number" class="form-control form-control-sm" v-model.number="form.heartRate" min="0" />
    </div>
    <div class="col-md-2">
      <label class="form-label small mb-1 fw-semibold">컨디션</label>
      <select class="form-select form-select-sm" v-model="form.mood">
        <option v-for="m in moods" :key="m">{{ m }}</option>
      </select>
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-primary btn-sm w-100" :disabled="submitting">
        <i class="fa-solid fa-plus me-1"></i> 추가
      </button>
    </div>
    <div class="col-12">
      <input
        type="text"
        class="form-control form-control-sm"
        :placeholder="notePlaceholder"
        v-model.trim="form.note"
      />
    </div>
  </form>
</template>

<style scoped>
.workout-form .form-label {
  color: #4f5f7c;
}

.workout-form input,
.workout-form select {
  min-height: 34px;
}
</style>
