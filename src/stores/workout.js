// Pinia store: axios를 이용해 json-server(REST API)와 통신합니다.
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' }
});

export const useWorkoutStore = defineStore('workout', () => {
  // state
  const workouts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // getters
  const totalCount = computed(() => workouts.value.length);
  const totalDuration = computed(() =>
    workouts.value.reduce((sum, w) => sum + Number(w.duration || 0), 0)
  );
  const totalCalories = computed(() =>
    workouts.value.reduce((sum, w) => sum + Number(w.calories || 0), 0)
  );
  const totalDistance = computed(() =>
    +workouts.value.reduce((sum, w) => sum + Number(w.distance || 0), 0).toFixed(2)
  );

  // 운동 종류별 횟수
  const countByType = computed(() => {
    const map = {};
    workouts.value.forEach((w) => {
      map[w.type] = (map[w.type] || 0) + 1;
    });
    return map;
  });

  // 일자별 칼로리 합계
  const caloriesByDate = computed(() => {
    const map = {};
    workouts.value.forEach((w) => {
      map[w.date] = (map[w.date] || 0) + Number(w.calories || 0);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  });

  // 운동 종류별 평균 시간
  const avgDurationByType = computed(() => {
    const sum = {};
    const cnt = {};
    workouts.value.forEach((w) => {
      sum[w.type] = (sum[w.type] || 0) + Number(w.duration || 0);
      cnt[w.type] = (cnt[w.type] || 0) + 1;
    });
    return Object.keys(sum).map((k) => [k, Math.round(sum[k] / cnt[k])]);
  });

  // actions
  async function fetchWorkouts() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get('/workouts');
      workouts.value = data;
    } catch (e) {
      error.value = e.message;
      console.error('fetchWorkouts error:', e);
    } finally {
      loading.value = false;
    }
  }

  async function addWorkout(payload) {
    try {
      const { data } = await api.post('/workouts', payload);
      workouts.value.push(data);
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteWorkout(id) {
    try {
      await api.delete(`/workouts/${id}`);
      workouts.value = workouts.value.filter((w) => w.id !== id);
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function updateWorkout(id, payload) {
    try {
      const { data } = await api.put(`/workouts/${id}`, payload);
      const idx = workouts.value.findIndex((w) => w.id === id);
      if (idx !== -1) workouts.value[idx] = data;
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  return {
    workouts,
    loading,
    error,
    totalCount,
    totalDuration,
    totalCalories,
    totalDistance,
    countByType,
    caloriesByDate,
    avgDurationByType,
    fetchWorkouts,
    addWorkout,
    deleteWorkout,
    updateWorkout
  };
});
