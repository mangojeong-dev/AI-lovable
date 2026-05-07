<script setup>
import { ref, watch, computed } from 'vue';
import { useWorkoutStore } from '../stores/workout.js';
import { ALL_WORKOUT_TYPES, MOOD_CONFIG } from '../constants/sports.js';

const props = defineProps({
  workout: { type: Object, default: null }
});
const emit = defineEmits(['close', 'saved']);

const store = useWorkoutStore();
const submitting = ref(false);
const moods = Object.keys(MOOD_CONFIG);

const form = ref({});

watch(() => props.workout, (w) => {
  if (w) form.value = { ...w };
}, { immediate: true });

const isStrength = computed(() =>
  ['웨이트', 'HIIT', '크로스핏'].includes(form.value.type)
);
const isEndurance = computed(() =>
  ['러닝', '사이클링', '수영'].includes(form.value.type)
);

async function onSave() {
  submitting.value = true;
  try {
    await store.updateWorkout(form.value.id, form.value);
    emit('saved');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-box">
        <div class="modal-header-row">
          <h5 class="modal-title-text">
            <i class="fa-solid fa-pen-to-square me-2 text-primary"></i>기록 수정
          </h5>
          <button class="modal-close-btn" @click="emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form @submit.prevent="onSave" class="modal-form">
          <div class="form-row-2">
            <div>
              <label class="flabel">종류</label>
              <select class="form-select form-select-sm" v-model="form.type">
                <option v-for="t in ALL_WORKOUT_TYPES" :key="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="flabel">날짜</label>
              <input type="date" class="form-control form-select-sm" v-model="form.date" required />
            </div>
          </div>

          <div class="form-row-3">
            <div>
              <label class="flabel">시간(분)</label>
              <input type="number" class="form-control form-control-sm" v-model.number="form.duration" min="1" />
            </div>
            <div>
              <label class="flabel">칼로리</label>
              <input type="number" class="form-control form-control-sm" v-model.number="form.calories" min="0" />
            </div>
            <div>
              <label class="flabel">심박수</label>
              <input type="number" class="form-control form-control-sm" v-model.number="form.heartRate" min="0" />
            </div>
          </div>

          <div class="form-row-3" v-if="isStrength">
            <div>
              <label class="flabel">무게(kg)</label>
              <input type="number" step="0.5" class="form-control form-control-sm" v-model.number="form.weight" min="0" />
            </div>
            <div>
              <label class="flabel">횟수</label>
              <input type="number" class="form-control form-control-sm" v-model.number="form.reps" min="1" />
            </div>
            <div>
              <label class="flabel">세트</label>
              <input type="number" class="form-control form-control-sm" v-model.number="form.sets" min="1" />
            </div>
          </div>

          <div v-if="isEndurance">
            <label class="flabel">거리(km)</label>
            <input type="number" step="0.1" class="form-control form-control-sm" v-model.number="form.distance" min="0" />
          </div>

          <div>
            <label class="flabel">컨디션</label>
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

          <div>
            <label class="flabel">메모</label>
            <input type="text" class="form-control form-control-sm" v-model.trim="form.note" placeholder="메모를 입력하세요" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="emit('close')">취소</button>
            <button type="submit" class="btn btn-sm btn-primary" :disabled="submitting">
              <span v-if="submitting"><i class="fa-solid fa-spinner fa-spin me-1"></i>저장 중...</span>
              <span v-else><i class="fa-solid fa-check me-1"></i>저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(10, 18, 40, 0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 3000;
  padding: 1rem;
  animation: fadeIn 0.18s ease;
}
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

.modal-box {
  background: var(--fit-surface);
  border-radius: 20px;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  overflow: hidden;
  animation: slideUp 0.22s cubic-bezier(.34,1.56,.64,1);
}
@keyframes slideUp { from { transform: translateY(30px); opacity:0 } to { transform: translateY(0); opacity:1 } }

.modal-header-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 1.3rem 0.8rem;
  border-bottom: 1px solid var(--fit-border);
}
.modal-title-text { font-size: 1rem; font-weight: 700; margin: 0; color: var(--fit-text); }

.modal-close-btn {
  border: none; background: none; width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; color: var(--fit-muted);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.modal-close-btn:hover { background: var(--fit-border); }

.modal-form {
  padding: 1.1rem 1.3rem 1.3rem;
  display: flex; flex-direction: column; gap: 0.85rem;
}

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.7rem; }

.flabel {
  display: block; font-size: 0.78rem; font-weight: 600;
  color: var(--fit-muted); margin-bottom: 0.25rem;
}

.mood-row {
  display: flex; flex-wrap: wrap; gap: 0.4rem;
}
.mood-btn {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.3rem 0.7rem; border-radius: 999px;
  border: 1px solid var(--fit-border); background: var(--fit-bg);
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  color: var(--fit-muted); transition: all 0.15s;
}
.mood-btn:hover, .mood-btn.active {
  border-color: var(--fit-primary); background: #eff6ff; color: var(--fit-primary);
}
:global(.dark) .mood-btn:hover,
:global(.dark) .mood-btn.active { background: #1e3a8a; color: #93c5fd; border-color: #3b82f6; }

.modal-actions {
  display: flex; justify-content: flex-end; gap: 0.6rem;
  padding-top: 0.3rem;
}
</style>
