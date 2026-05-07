<script setup>
defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  unit: { type: String, default: '' },
  color: { type: String, default: 'primary' }
});
</script>

<template>
  <div class="card stat-card border-0 h-100">
    <div class="card-body d-flex align-items-center">
      <div :class="`stat-icon rounded-circle d-flex align-items-center justify-content-center me-3 bg-${color} bg-opacity-10`"
           style="width:56px;height:56px;">
        <i :class="`${icon} fa-lg text-${color}`"></i>
      </div>
      <div>
        <div class="text-muted small stat-label">{{ label }}</div>
        <div class="fs-4 fw-bold stat-value">{{ value }}<span class="fs-6 text-muted ms-1">{{ unit }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(30, 41, 59, 0.13) !important;
}

.stat-icon {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
}

.stat-label {
  font-weight: 500;
  letter-spacing: 0.01em;
}

.stat-value {
  letter-spacing: -0.02em;
}
</style>
