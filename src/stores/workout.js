import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' }
});

export const useWorkoutStore = defineStore('workout', () => {
  // ─── state ────────────────────────────────────────────────
  const workouts  = ref([]);
  const loading   = ref(false);
  const error     = ref(null);

  // 주간 목표 (localStorage 영속)
  const weeklyGoal = ref(
    JSON.parse(localStorage.getItem('weeklyGoal') || 'null') ||
    { sessions: 4, calories: 2000, duration: 180 }
  );

  function saveWeeklyGoal(goal) {
    weeklyGoal.value = goal;
    localStorage.setItem('weeklyGoal', JSON.stringify(goal));
  }

  // ─── 기본 getters ─────────────────────────────────────────
  const totalCount    = computed(() => workouts.value.length);
  const totalDuration = computed(() =>
    workouts.value.reduce((s, w) => s + Number(w.duration || 0), 0));
  const totalCalories = computed(() =>
    workouts.value.reduce((s, w) => s + Number(w.calories || 0), 0));
  const totalDistance = computed(() =>
    +workouts.value.reduce((s, w) => s + Number(w.distance || 0), 0).toFixed(2));

  // 운동 종류별 횟수
  const countByType = computed(() => {
    const map = {};
    workouts.value.forEach((w) => { map[w.type] = (map[w.type] || 0) + 1; });
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
    const sum = {}, cnt = {};
    workouts.value.forEach((w) => {
      sum[w.type] = (sum[w.type] || 0) + Number(w.duration || 0);
      cnt[w.type] = (cnt[w.type] || 0) + 1;
    });
    return Object.keys(sum).map((k) => [k, Math.round(sum[k] / cnt[k])]);
  });

  // ─── 주간 통계 ────────────────────────────────────────────
  function getWeekRange(offset = 0) {
    const now  = new Date();
    const day  = now.getDay(); // 0=일
    const mon  = new Date(now);
    mon.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
    mon.setHours(0, 0, 0, 0);
    const sun  = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59, 999);
    return { start: mon, end: sun };
  }

  const thisWeekWorkouts = computed(() => {
    const { start, end } = getWeekRange(0);
    return workouts.value.filter((w) => {
      const d = new Date(w.date);
      return d >= start && d <= end;
    });
  });

  const lastWeekWorkouts = computed(() => {
    const { start, end } = getWeekRange(-1);
    return workouts.value.filter((w) => {
      const d = new Date(w.date);
      return d >= start && d <= end;
    });
  });

  const weeklyStats = computed(() => {
    const tw = thisWeekWorkouts.value;
    const lw = lastWeekWorkouts.value;
    const sum = (arr, key) => arr.reduce((s, w) => s + Number(w[key] || 0), 0);
    return {
      sessions:  tw.length,
      calories:  sum(tw, 'calories'),
      duration:  sum(tw, 'duration'),
      distance:  +sum(tw, 'distance').toFixed(2),
      prevSessions: lw.length,
      prevCalories: sum(lw, 'calories'),
      prevDuration: sum(lw, 'duration'),
    };
  });

  // 주간 목표 달성률
  const weeklyProgress = computed(() => {
    const s = weeklyStats.value;
    const g = weeklyGoal.value;
    return {
      sessions:  Math.min(100, Math.round((s.sessions  / g.sessions)  * 100)),
      calories:  Math.min(100, Math.round((s.calories  / g.calories)  * 100)),
      duration:  Math.min(100, Math.round((s.duration  / g.duration)  * 100)),
    };
  });

  // ─── 월별 통계 ────────────────────────────────────────────
  const monthlyStats = computed(() => {
    const map = {};
    workouts.value.forEach((w) => {
      const m = w.date.slice(0, 7); // YYYY-MM
      if (!map[m]) map[m] = { month: m, sessions: 0, calories: 0, duration: 0 };
      map[m].sessions++;
      map[m].calories  += Number(w.calories  || 0);
      map[m].duration  += Number(w.duration  || 0);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  });

  // ─── 인사이트 ─────────────────────────────────────────────
  const topType = computed(() => {
    const entries = Object.entries(countByType.value);
    if (!entries.length) return null;
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  });

  const avgCaloriesPerSession = computed(() =>
    totalCount.value ? Math.round(totalCalories.value / totalCount.value) : 0);

  const avgHeartRate = computed(() => {
    const valid = workouts.value.filter((w) => w.heartRate > 0);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((s, w) => s + Number(w.heartRate), 0) / valid.length);
  });

  // 최근 7일 요일별 운동 여부 (heatmap용)
  const last7DaysActivity = computed(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = workouts.value.filter((w) => w.date === dateStr).length;
      result.push({ date: dateStr, count, label: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()] });
    }
    return result;
  });

  // ─── 월간 칼로리 차트 데이터 ──────────────────────────────
  const monthlyCaloriesChartData = computed(() => {
    const rows = monthlyStats.value.map((m) => [m.month, m.calories]);
    return [['월', '칼로리'], ...rows];
  });

  // ─── actions ──────────────────────────────────────────────
  async function fetchWorkouts() {
    loading.value = true;
    error.value   = null;
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
    workouts, loading, error,
    weeklyGoal, saveWeeklyGoal,
    totalCount, totalDuration, totalCalories, totalDistance,
    countByType, caloriesByDate, avgDurationByType,
    thisWeekWorkouts, lastWeekWorkouts,
    weeklyStats, weeklyProgress,
    monthlyStats, monthlyCaloriesChartData,
    topType, avgCaloriesPerSession, avgHeartRate,
    last7DaysActivity,
    fetchWorkouts, addWorkout, deleteWorkout, updateWorkout,
  };
});
