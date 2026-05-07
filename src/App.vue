<script setup>
import { ref, onMounted, provide } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import ToastNotification from './components/ToastNotification.vue';

// ─── 다크모드 ─────────────────────────────────────────────
const isDark = ref(localStorage.getItem('theme') === 'dark');

function toggleTheme() {
  isDark.value = !isDark.value;
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', isDark.value);
}

onMounted(() => {
  document.documentElement.classList.toggle('dark', isDark.value);
});

// ─── 토스트 ───────────────────────────────────────────────
const toast = ref(null);
provide('toast', toast);

// ─── 모바일 메뉴 ──────────────────────────────────────────
const menuOpen = ref(false);
</script>

<template>
  <div class="app-shell" :class="{ dark: isDark }">

    <!-- ── Navbar ── -->
    <nav class="app-navbar">
      <div class="nav-inner">
        <!-- 브랜드 -->
        <RouterLink to="/" class="app-brand" @click="menuOpen = false">
          <span class="brand-icon"><i class="fa-solid fa-dumbbell"></i></span>
          <span class="brand-text">FitTracker</span>
        </RouterLink>

        <!-- 데스크탑 링크 -->
        <div class="nav-links desktop-only">
          <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <i class="fa-solid fa-house"></i><span>홈</span>
          </RouterLink>
          <RouterLink to="/dashboard" class="nav-link" :class="{ active: $route.path === '/dashboard' }">
            <i class="fa-solid fa-chart-line"></i><span>대시보드</span>
          </RouterLink>
          <RouterLink to="/records" class="nav-link" :class="{ active: $route.path.startsWith('/records') || $route.path.startsWith('/sports') }">
            <i class="fa-solid fa-list-check"></i><span>기록</span>
          </RouterLink>
        </div>

        <!-- 우측 액션 -->
        <div class="nav-right">
          <button class="icon-btn" @click="toggleTheme" :title="isDark ? '라이트 모드' : '다크 모드'">
            <i :class="isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
          </button>
          <!-- 모바일 햄버거 -->
          <button class="icon-btn mobile-only" @click="menuOpen = !menuOpen">
            <i :class="menuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>
      </div>

      <!-- 모바일 드롭다운 -->
      <Transition name="menu-slide">
        <div class="mobile-menu" v-if="menuOpen">
          <RouterLink to="/" class="mobile-link" @click="menuOpen = false">
            <i class="fa-solid fa-house"></i> 홈
          </RouterLink>
          <RouterLink to="/dashboard" class="mobile-link" @click="menuOpen = false">
            <i class="fa-solid fa-chart-line"></i> 대시보드
          </RouterLink>
          <RouterLink to="/records" class="mobile-link" @click="menuOpen = false">
            <i class="fa-solid fa-list-check"></i> 기록 관리
          </RouterLink>
        </div>
      </Transition>
    </nav>

    <!-- ── Main ── -->
    <main class="app-main">
      <div class="container py-4">
        <RouterView />
      </div>
    </main>

    <!-- ── Footer ── -->
    <footer class="app-footer">
      <span><i class="fa-solid fa-dumbbell me-1"></i>FitTracker</span>
      <span class="footer-sep">·</span>
      <span>Vue 3 + Pinia + JSON Server</span>
      <span class="footer-sep">·</span>
      <span><i class="fa-solid fa-heart text-danger me-1"></i>건강한 하루</span>
    </footer>

    <!-- ── Toast ── -->
    <ToastNotification ref="toast" />
  </div>
</template>

<style>
/* ════ CSS 변수 (라이트) ════════════════════════════════ */
:root {
  --fit-bg:            #f4f7fb;
  --fit-surface:       #ffffff;
  --fit-surface2:      #f8faff;
  --fit-text:          #0f172a;
  --fit-text2:         #334155;
  --fit-muted:         #64748b;
  --fit-border:        #e2e8f0;
  --fit-primary:       #3b82f6;
  --fit-primary-dark:  #2563eb;
  --fit-accent:        #06b6d4;
  --fit-success:       #10b981;
  --fit-danger:        #ef4444;
  --fit-warning:       #f59e0b;
  --fit-shadow:        0 4px 24px rgba(15,23,42,0.08);
  --fit-shadow-lg:     0 12px 40px rgba(15,23,42,0.13);
  --nav-bg:            linear-gradient(120deg, #0f172a 0%, #1e293b 60%, #1b2b49 100%);
  --nav-height:        60px;
}

/* ════ CSS 변수 (다크) ══════════════════════════════════ */
html.dark {
  --fit-bg:            #0b1120;
  --fit-surface:       #111827;
  --fit-surface2:      #1a2235;
  --fit-text:          #f1f5f9;
  --fit-text2:         #cbd5e1;
  --fit-muted:         #94a3b8;
  --fit-border:        #1e293b;
  --fit-primary:       #60a5fa;
  --fit-primary-dark:  #3b82f6;
  --fit-accent:        #22d3ee;
  --fit-success:       #34d399;
  --fit-danger:        #f87171;
  --fit-warning:       #fbbf24;
  --fit-shadow:        0 4px 24px rgba(0,0,0,0.35);
  --fit-shadow-lg:     0 12px 40px rgba(0,0,0,0.5);
  --nav-bg:            linear-gradient(120deg, #060d1a 0%, #0f172a 60%, #0d1f38 100%);
}

/* ════ 전역 기본 ════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--fit-bg);
  color: var(--fit-text);
  font-family: "Pretendard", "Inter", "Noto Sans KR", "Segoe UI", sans-serif;
  transition: background 0.25s, color 0.25s;
  -webkit-font-smoothing: antialiased;
}

/* ════ App Shell ════════════════════════════════════════ */
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }

/* ════ Navbar ════════════════════════════════════════════ */
.app-navbar {
  position: sticky; top: 0; z-index: 1000;
  background: var(--nav-bg);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 4px 20px rgba(0,0,0,0.28);
}

.nav-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center;
  padding: 0 1.25rem; height: var(--nav-height);
  gap: 1.2rem;
}

/* 브랜드 */
.app-brand {
  display: flex; align-items: center; gap: 0.5rem;
  text-decoration: none; flex-shrink: 0;
}
.brand-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; color: #fff;
  box-shadow: 0 4px 12px rgba(59,130,246,0.4);
}
.brand-text {
  font-size: 1.05rem; font-weight: 800; color: #f8fbff;
  letter-spacing: -0.02em;
}
.brand-badge {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.05em;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff; padding: 0.1rem 0.35rem; border-radius: 999px;
  line-height: 1.4;
}

/* 데스크탑 링크 */
.nav-links {
  display: flex; align-items: center; gap: 0.9rem; flex: 1;
}
.nav-link {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.46rem 1.05rem; border-radius: 12px;
  text-decoration: none; font-size: 0.87rem; font-weight: 600;
  color: rgba(248,251,255,0.88);
  border: 1px solid transparent;
  transition: all 0.18s ease;
}
.nav-link:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border-color: rgba(255,255,255,0.18);
}
.nav-link.active {
  background: linear-gradient(135deg, rgba(59,130,246,0.35), rgba(6,182,212,0.3));
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
}
.nav-link i { font-size: 0.82rem; }

/* 우측 */
.nav-right { margin-left: auto; display: flex; align-items: center; gap: 0.6rem; }

.icon-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.08);
  color: rgba(248,251,255,0.8);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.9rem;
  transition: all 0.18s ease;
}
.icon-btn:hover { background: rgba(255,255,255,0.18); color: #fff; border-color: rgba(255,255,255,0.35); }

/* 모바일 메뉴 */
.mobile-menu {
  display: flex; flex-direction: column;
  padding: 0.5rem 1rem 0.8rem;
  border-top: 1px solid rgba(255,255,255,0.07);
  gap: 0.2rem;
}
.mobile-link {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.7rem 0.8rem; border-radius: 10px;
  text-decoration: none; font-size: 0.9rem; font-weight: 600;
  color: rgba(248,251,255,0.8);
  transition: background 0.15s;
}
.mobile-link:hover, .mobile-link.router-link-active {
  background: rgba(255,255,255,0.1); color: #fff;
}

.desktop-only { display: flex; }
.mobile-only  { display: none; }

@media (max-width: 640px) {
  .desktop-only { display: none; }
  .mobile-only  { display: flex; }
  .nav-inner    { padding: 0 1rem; }
}

/* 메뉴 애니메이션 */
.menu-slide-enter-active { transition: all 0.22s ease; }
.menu-slide-leave-active { transition: all 0.16s ease; }
.menu-slide-enter-from,
.menu-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ════ Main ══════════════════════════════════════════════ */
.app-main { flex: 1; }

/* ════ Footer ════════════════════════════════════════════ */
.app-footer {
  display: flex; align-items: center; justify-content: center;
  gap: 0.6rem; flex-wrap: wrap;
  padding: 1.2rem 1rem;
  font-size: 0.8rem; color: var(--fit-muted);
  border-top: 1px solid var(--fit-border);
}
.footer-sep { color: var(--fit-border); }

/* ════ 공통 카드 ══════════════════════════════════════════ */
.card {
  background: var(--fit-surface);
  border: 1px solid var(--fit-border);
  border-radius: 16px;
  box-shadow: var(--fit-shadow);
  transition: background 0.25s, border-color 0.25s;
}
.card-body { padding: 1.2rem 1.25rem; }

/* ════ 공통 버튼 ══════════════════════════════════════════ */
.btn {
  border-radius: 10px; font-weight: 600;
  letter-spacing: 0.01em; transition: all 0.18s ease;
}
.btn-primary {
  background: linear-gradient(135deg, var(--fit-primary), var(--fit-primary-dark));
  border-color: var(--fit-primary-dark); color: #fff;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(59,130,246,0.35);
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border-color: #3b82f6; color: #fff;
}
.btn-outline-primary {
  color: var(--fit-primary); border-color: var(--fit-primary);
  background: transparent;
}
.btn-outline-primary:hover {
  background: rgba(59,130,246,0.1);
  border-color: var(--fit-primary); color: var(--fit-primary);
}
.btn-outline-danger { color: var(--fit-danger); border-color: var(--fit-danger); background: transparent; }
.btn-outline-danger:hover { background: rgba(239,68,68,0.1); border-color: var(--fit-danger); color: var(--fit-danger); }
.btn-outline-secondary { color: var(--fit-muted); border-color: var(--fit-border); background: transparent; }
.btn-outline-secondary:hover { background: var(--fit-border); color: var(--fit-text); }

/* ════ 공통 폼 ════════════════════════════════════════════ */
.form-control, .form-select {
  background: var(--fit-surface);
  border-color: var(--fit-border);
  color: var(--fit-text);
  border-radius: 10px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.form-control:focus, .form-select:focus {
  border-color: var(--fit-primary);
  box-shadow: 0 0 0 0.2rem rgba(59,130,246,0.15);
  background: var(--fit-surface); color: var(--fit-text);
}
.form-control::placeholder { color: var(--fit-muted); }
.form-label { color: var(--fit-text2); font-weight: 600; }

/* ════ 테이블 ════════════════════════════════════════════ */
.table { color: var(--fit-text); --bs-table-bg: transparent; }
.table > :not(caption) > * > * { padding: 0.78rem 0.7rem; border-bottom-color: var(--fit-border); }
.table-hover tbody tr:hover { --bs-table-accent-bg: var(--fit-surface2); }
.table-light { --bs-table-bg: var(--fit-surface2); color: var(--fit-muted); }

/* ════ 뱃지 ══════════════════════════════════════════════ */
.badge { border-radius: 999px; padding: 0.3rem 0.55rem; font-weight: 600; }

/* ════ 알럿 ══════════════════════════════════════════════ */
.alert { border-radius: 12px; }
.alert-danger { background: rgba(239,68,68,0.08); color: var(--fit-danger); border-color: rgba(239,68,68,0.25); }

/* ════ h2 타이틀 ══════════════════════════════════════════ */
h2 {
  font-size: clamp(1.15rem, 1rem + 1vw, 1.5rem);
  font-weight: 800; letter-spacing: -0.03em;
  color: var(--fit-text);
}

/* ════ 반응형 ════════════════════════════════════════════ */
@media (max-width: 768px) {
  .container { padding-left: 1rem; padding-right: 1rem; }
  .card-body { padding: 1rem; }
}
</style>
