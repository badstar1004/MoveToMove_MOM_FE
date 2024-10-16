import { defineStore } from 'pinia';

// 네비게이션 메뉴 상태성 `localStorage` 에 저장
export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    activeItem: localStorage.getItem('activeItem') || '', // localStorage 에서 초기화
    hasNotifications: JSON.parse(localStorage.getItem('hasNotifications')) || false, // 알림 상태 초기화 (안 읽음이 기본값)
  }),
  actions: {
    setActiveItem(item) {
      this.activeItem = item;
      localStorage.setItem('activeItem', item); // localStorage 에 activeItem 저장
    },
    setNotificationStatus(status) {
      this.hasNotifications.setItem('hasNotifications', JSON.parse(status)); // 알림 상태를 localStorage에 저장
    },
  },
});
