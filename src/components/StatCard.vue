<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon:    String,
  label:   String,
  value:   [String, Number],
  unit:    { type: String, default: '' },
  color:   { type: String, default: 'primary' },
  prev:    { type: Number, default: null },   // 이전 기간 값 (트렌드용)
  trend:   { type: Boolean, default: false }, // 트렌드 배지 표시 여부
});

const trendDiff = computed(() => {
  if (!props.trend || props.prev === null || props.prev === undefined) return null;
  const cur = Number(props.value) || 0;
  if (props.prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - props.prev) / props.prev) * 100);
});

const colorMap = {
  primary: { bg: '#eff6ff', icon: '#3b82f6', dark: '#1e3a8a' },
  success: { bg: '#f0fdf4', icon: '#10b981', dark: '#14532d' },
  danger:  { bg: '#fff1f2', icon: '#ef4444', dark: '#7f1d1d' },
  warning: { bg: '#fffbeb', icon: '#f59e0b', dark: '#78350f' },
  info:    { bg: '#f0f9ff', icon: '#0ea5e9', dark: '#0c4a6e' },
};

const colorStyle = computed(() => colorMap[props.color] || colorMap.primary);
</script>

<template>
  <div class="stat-card card h-100">
    <div class="card-body d-flex align-items-center gap-3">
      <div class="stat-icon" :style="{ background: colorStyle.bg, color: colorStyle.icon }">
        <i :class="icon"></i>
      </div>
      <div class="stat-body">
        <div class="stat-label">{{ label }}</div>
        <div class="stat-value">
          {{ typeof value === 'number' ? value.toLocaleString() : value }}
          <span class="stat-unit">{{ unit }}</span>
        </div>
      </div>
      <!-- 트렌드 배지 -->
      <div v-if="trend && trendDiff !== null" class="stat-trend" :class="trendDiff >= 0 ? 'up' : 'down'">
        <i :class="trendDiff >= 0 ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
        {{ Math.abs(trendDiff) }}%
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--fit-shadow-lg) !important;
}

.stat-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; flex-shrink: 0;
}

.stat-body  { flex: 1; min-width: 0; }
.stat-label { font-size: 0.74rem; font-weight: 600; color: var(--fit-muted); letter-spacing: 0.01em; margin-bottom: 0.15rem; }
.stat-value { font-size: 1.45rem; font-weight: 800; color: var(--fit-text); letter-spacing: -0.03em; line-height: 1.1; }
.stat-unit  { font-size: 0.78rem; font-weight: 500; color: var(--fit-muted); margin-left: 0.15rem; }

.stat-trend {
  font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; gap: 0.2rem;
  padding: 0.22rem 0.5rem; border-radius: 999px;
  white-space: nowrap; flex-shrink: 0;
}
.stat-trend.up   { background: rgba(16,185,129,0.12); color: #10b981; }
.stat-trend.down { background: rgba(239,68,68,0.12);  color: #ef4444; }
</style>
