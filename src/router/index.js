// routers/index.js
import routes from '@/router/router';
import { createRouter, createWebHistory } from 'vue-router';
import PageNotFound from '../components/page/PageNotFound.vue';

// 404 페이지를 처리하기 위한 기본 라우터 설정
const base_router = [
  {
    path: '/:pathMatch(.*)*',
    component: PageNotFound,
  },
];

// 라우터 인스턴스를 생성합니다.
const router = createRouter({
  history: createWebHistory(),
  routes: [...routes, ...base_router],
});

export default router; // 라우터 인스턴스 export
