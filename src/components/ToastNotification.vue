<script setup>
import { ref, onUnmounted } from 'vue';

const toasts = ref([]);
let counter = 0;

function show(message, type = 'success', duration = 3000) {
  const id = ++counter;
  toasts.value.push({ id, message, type });
  setTimeout(() => remove(id), duration);
}

function remove(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

defineExpose({ show });
</script>

<template>
  <div class="toast-container">
    <Transition name="toast" v-for="t in toasts" :key="t.id">
      <div :class="`toast-item toast-${t.type}`" @click="remove(t.id)">
        <i :class="{
          'fa-solid fa-circle-check': t.type === 'success',
          'fa-solid fa-triangle-exclamation': t.type === 'warning',
          'fa-solid fa-circle-xmark': t.type === 'error',
          'fa-solid fa-circle-info': t.type === 'info',
        }"></i>
        <span>{{ t.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.1rem;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  min-width: 220px;
  max-width: 320px;
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  backdrop-filter: blur(8px);
}

.toast-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.toast-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.toast-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
.toast-info    { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }

:global(.dark) .toast-success { background: #14532d; color: #86efac; border-color: #166534; }
:global(.dark) .toast-error   { background: #7f1d1d; color: #fca5a5; border-color: #991b1b; }
:global(.dark) .toast-warning { background: #78350f; color: #fcd34d; border-color: #92400e; }
:global(.dark) .toast-info    { background: #1e3a8a; color: #93c5fd; border-color: #1e40af; }

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(60px) scale(0.92); }
.toast-leave-to     { opacity: 0; transform: translateX(60px); }
</style>
