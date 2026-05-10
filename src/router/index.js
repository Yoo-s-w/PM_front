//src\router\index.js
import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import RealtimeView from '@/views/RealtimeView.vue';
import InfoView from '@/views/InfoView.vue';
import LoginView from '@/views/LoginView.vue';
import MyProfileView from '@/views/MyProfileView.vue';

// (★추가★) '통계 분석' 뷰 import
import StatsView from '@/views/StatsView.vue';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: { requiresAuth: false },
    },
    {
        path: '/',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: DashboardView,
            },
            {
                path: '/realtime',
                name: 'Realtime',
                component: RealtimeView,
            },
            {
                path: '/info',
                name: 'Info',
                component: InfoView,
            },
            // (★추가★) '/stats' 경로
            {
                path: '/stats',
                name: 'Stats',
                component: StatsView,
            },
            {
                path: '/profile',
                name: 'MyProfile',
                component: MyProfileView,
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    linkActiveClass: 'router-link-active',
});

router.beforeEach((to, from, next) => {
    // 1. (★수정★) sessionStorage 대신 localStorage에서 'user' 객체를 확인
    const user = localStorage.getItem('user');
    const isLoggedIn = !!user; // user 문자열이 있으면 true

    if (to.meta.requiresAuth && !isLoggedIn) {
        // 2. (로그인 안 됨) 보호된 페이지 접근 시 -> 로그인 페이지로
        next('/login');
    } else if (to.path === '/login' && isLoggedIn) {
        // 3. (로그인 됨) 로그인 페이지 접근 시 -> 메인 페이지로
        next('/');
    } else {
        // 4. (그 외) 정상 이동
        next();
    }
});

export default router;
