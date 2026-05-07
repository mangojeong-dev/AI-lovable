<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="app-shell">
  <nav class="navbar navbar-expand-lg app-navbar">
    <div class="container">
      <RouterLink to="/" class="navbar-brand fw-bold app-brand">
        <i class="fa-solid fa-dumbbell me-2"></i>
        운동 기록 대시보드
      </RouterLink>
      <div class="d-flex gap-2 nav-actions">
        <RouterLink to="/" class="btn btn-sm nav-pill" active-class="active">
          <i class="fa-solid fa-house me-1"></i> 시작
        </RouterLink>
        <RouterLink to="/dashboard" class="btn btn-sm nav-pill" active-class="active">
          <i class="fa-solid fa-chart-line me-1"></i> 대시보드
        </RouterLink>
        <RouterLink to="/records" class="btn btn-sm nav-pill" active-class="active">
          <i class="fa-solid fa-list me-1"></i> 기록 관리
        </RouterLink>
      </div>
    </div>
  </nav>
  <main class="container py-4 app-main">
    <RouterView />
  </main>
  <footer class="text-center py-4 small app-footer">
    <i class="fa-solid fa-heart me-1"></i> Vue 3 + Pinia + JSON Server
  </footer>
  </div>
</template>

<style>
:root {
  --fit-bg: #f4f7fb;
  --fit-surface: #ffffff;
  --fit-text: #152036;
  --fit-muted: #6c7892;
  --fit-border: #e5eaf2;
  --fit-primary: #3b82f6;
  --fit-primary-strong: #2563eb;
  --fit-accent: #10b981;
  --fit-danger: #ef4444;
  --fit-warning: #f59e0b;
  --fit-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

body {
  margin: 0;
  background: radial-gradient(circle at 10% 10%, #eef4ff 0%, var(--fit-bg) 36%, #f7f9fc 100%);
  color: var(--fit-text);
  font-family: "Inter", "Pretendard", "Noto Sans KR", "Segoe UI", sans-serif;
}

.app-shell {
  min-height: 100vh;
}

.app-navbar {
  background: linear-gradient(120deg, #0f172a, #1e293b 62%, #1b2b49);
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 8px 22px rgba(2, 6, 23, 0.24);
}

.app-navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.app-brand {
  color: #f8fbff !important;
  letter-spacing: 0.2px;
}

.app-brand i {
  color: #22d3ee;
}

.nav-pill {
  border-radius: 999px;
  border: 1px solid rgba(125, 211, 252, 0.7);
  color: #f8fbff;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.32), rgba(14, 165, 233, 0.3));
  min-width: 92px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 8px 18px rgba(2, 6, 23, 0.22);
  transition: all 0.2s ease;
}

.nav-pill:hover,
.nav-pill.active {
  color: #ffffff;
  border-color: #22d3ee;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 10px 22px rgba(6, 182, 212, 0.35);
  transform: translateY(-2px);
}

.nav-pill:focus-visible {
  outline: none;
  box-shadow: 0 0 0 0.22rem rgba(34, 211, 238, 0.35), 0 10px 22px rgba(6, 182, 212, 0.32);
}

.nav-pill i {
  color: #e0f2fe;
}

.app-main {
  padding-top: 1.8rem !important;
  padding-bottom: 1.8rem !important;
}

h2 {
  font-size: clamp(1.2rem, 1rem + 1vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.card {
  border-radius: 16px;
  border: 1px solid var(--fit-border);
  box-shadow: var(--fit-shadow) !important;
  background: var(--fit-surface);
}

.card-body {
  padding: 1.15rem 1.2rem;
}

.btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: all 0.18s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--fit-primary), var(--fit-primary-strong));
  border-color: var(--fit-primary-strong);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
}

.btn-outline-primary {
  color: var(--fit-primary-strong);
  border-color: #bfd4ff;
}

.btn-outline-primary:hover {
  background-color: #e7f0ff;
  border-color: #9dc0ff;
  color: #1d4ed8;
}

.form-control,
.form-select {
  border-radius: 10px;
  border-color: #d5dfec;
}

.form-control:focus,
.form-select:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.18);
}

.table {
  margin-bottom: 0;
}

.table > :not(caption) > * > * {
  padding: 0.78rem 0.7rem;
  border-bottom-color: #e9edf4;
}

.table-hover tbody tr:hover {
  --bs-table-accent-bg: #f3f7ff;
}

.badge {
  border-radius: 999px;
  padding: 0.35rem 0.55rem;
}

.app-footer {
  color: var(--fit-muted);
}

.app-footer i {
  color: #f97316;
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .nav-actions {
    margin-top: 0.75rem;
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .card-body {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .app-brand {
    font-size: 1rem;
  }

  .nav-actions {
    justify-content: stretch;
  }

  .nav-pill {
    flex: 1 1 calc(50% - 0.25rem);
  }
}
</style>
