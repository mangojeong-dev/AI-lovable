import { createRouter, createWebHashHistory } from 'vue-router';
import Landing from '../views/Landing.vue';
import Dashboard from '../views/Dashboard.vue';
import Records from '../views/Records.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'landing', component: Landing },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/records', name: 'records', component: Records },
    {
      path: '/sports/:sportKey',
      name: 'sport-records',
      component: Records,
      props: true,
    },
  ],
});

export default router;
