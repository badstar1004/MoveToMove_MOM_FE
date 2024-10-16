import AuthLayout from '../components/layout/AuthLayout.vue';
import MainLayout from '../components/layout/MainLayout.vue';
import MyPage from '../components/view/MyPageCompo.vue';
import KanbanBoard from '../components/view/KanbanBoardCompo.vue';
import Chat from '../components/view/ChatCompo.vue';
import Profile from '../components/view/ProfileCompo.vue';
import Withdraw from '../components/view/WithdrawCompo.vue';
import SocialLoginCallback from '@/components/common/SocialLoginCallback.vue';
import KanbanCard from '@/components/layout/KanbanCardLayout.vue';
import NewProject from '@/components/view/NewProjectCompo.vue';
import ManageProject from '@/components/view/ManageProjectCompo.vue';
import KanbanCardOpen from '@/components/view/KanbanCardOpenCompo.vue';

const routes = [
  {
    path: '/',
    name: 'Auth',
    component: AuthLayout,
  },
  {
    path: '/move-to-move',
    component: MainLayout,
    children: [
      {
        path: 'mypage',
        name: 'MyPageCompo',
        component: MyPage,
      },
      {
        path: 'kanban',
        name: 'KanbanBoardCompo',
        component: KanbanBoard,
      },
      {
        path: 'chat',
        name: 'ChatCompo',
        component: Chat,
      },
      {
        path: 'profile',
        name: 'ProfileCompo',
        component: Profile,
      },
      {
        path: 'withdraw',
        name: 'WithdrawCompo',
        component: Withdraw,
      },
      //칸반 카드 open
      {
        path: 'kanbanCard',
        name: 'KanbanCardCompo',
        component: KanbanCard,
        props: (route) => ({ id: route.query.id, title: route.query.title }), // query 파라미터로 카드 ID와 제목 전달
      },
      {
        path: 'kanban-card',
        name: 'KanbanCardOpenCompo',
        component: KanbanCardOpen,
      },
      {
        path: 'new-project',
        name: 'NewProjectCompo',
        component: NewProject,
      },
      {
        path: 'manage-project/:projectId',  // 동적 매개변수 :projectId 추가
        name: 'ManageProjectCompo',
        component: ManageProject,
        props: true,
      },
    ],
  },
  {
    path: '/social-login/callback',
    name: 'SocialLoginCallback',
    component: SocialLoginCallback,
  },
];

export default routes;
