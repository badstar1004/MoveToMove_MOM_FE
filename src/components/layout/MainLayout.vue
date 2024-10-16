<template>
  <div class="main-layout">
    <!-- 사이드바 -->
    <aside class="sidebar">
      <!-- 로그아웃 및 알림 컨테이너 -->
      <div class="top-bar">
        <!-- 로그아웃 버튼 -->
        <div class="logout-button-container" @click="logout">
          <span class="material-symbols-outlined logout-icon">logout</span>
          <span class="logout-text">로그아웃</span>
        </div>

        <!-- 알림 아이콘 -->
        <div class="notification-container">
          <span class="material-symbols-outlined notification-icon">notifications</span>
          <!-- 알림 상태에 따른 동그라미 -->
          <span :class="['notification-dot', { active: navigationStore.hasNotification }]"></span>
        </div>
      </div>

      <div class="sidebar-header">
        <!-- 로고 및 사용자 정보 -->
        <img src="../../assets/move-to-move-logo2.png" @click="navigateToHome" alt="Logo" class="logo" />

        <!-- 상단 hr 선 -->
        <hr class="divider" />

        <div class="user-info">
          <!-- 프로필 이미지와 사용자 정보 -->
          <div class="user-info-content">
            <img :src="userProfileUrl" alt="User Avatar" class="avatar" />

            <div class="user-details">
              <!-- 현재 회원으로 변경해야함 -->
              <span class="user-email">{{ userEmail }}</span>
              <span class="user-nickname">{{ userNickName }}</span>
              <!-- 버튼 -->
              <div class="user-info-buttons">
                <round-button-item @click="toInfoModify" :width="60" :height="20" :fontSize="10" :fontColor="'#112f4e'" :borderRadius="5" backgroundColor="etc"
                  >정보수정</round-button-item
                >
                <round-button-item @click="toWithdraw" :width="60" :height="20" :fontSize="10" :fontColor="'#112f4e'" :borderRadius="5" backgroundColor="etc"
                  >회원탈퇴</round-button-item
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 hr 선 -->
        <hr class="divider" />
      </div>

      <!-- 네비게이션 메뉴 -->
      <nav class="nav-menu">
        <router-link
          to="/move-to-move/mypage"
          class="nav-item"
          :class="{ active: navigationStore.activeItem === 'mypage' }"
          @click="navigationStore.setActiveItem('mypage')"
        >
          <!-- 아이콘과 텍스트를 별도의 flexbox로 구성 -->
          <div class="nav-icon-container">
            <span class="material-symbols-outlined nav-icon">dashboard</span>
          </div>
          <span class="nav-text">마이페이지</span>
        </router-link>
        <router-link
          to="/move-to-move/kanban"
          class="nav-item"
          :class="{ active: navigationStore.activeItem === 'kanban' }"
          @click="navigationStore.setActiveItem('kanban')"
        >
          <div class="nav-icon-container">
            <font-awesome-icon icon="fa-solid fa-clone" class="nav-icon" />
          </div>
          <span class="nav-text">칸반보드</span>
        </router-link>
        <router-link
          to="/move-to-move/chat"
          class="nav-item"
          :class="{ active: navigationStore.activeItem === 'chat' }"
          @click="navigationStore.setActiveItem('chat')"
          style="display: none"
        >
          <div class="nav-icon-container">
            <font-awesome-icon icon="fa-regular fa-comments" class="nav-icon" style="display: none" />
          </div>
          <span class="nav-text" style="display: none">채팅</span>
        </router-link>
      </nav>
    </aside>

    <!-- 메인 콘텐츠 -->
    <main class="content">
      <div class="content-header">
        <!-- 수평선을 위한 div -->
        <div class="line"></div>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script>
import axios from '@/api/axiosInstance.js';
import { useAuthStore } from '@/stores/memberStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'MainLayout',
  setup() {
    const navigationStore = useNavigationStore(); // Pinia store 사용
    const authStore = useAuthStore(); // Pinia store 사용
    const router = useRouter(); // Vue Router 사용

    // 유저 정보 가져오기
    onMounted(async () => {
      await authStore.fetchUser();
    });

    // 유저 정보 설정
    const userEmail = computed(() => authStore.user?.email || 'unknown');
    const userNickName = computed(() => authStore.user?.nickName || 'User');
    const userProfileUrl = computed(() => {
      if (authStore.user?.profileUrl) {
        return `${authStore.user.profileUrl}?t=${new Date().getTime()}`;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userNickName.value)}&background=random`;
    });

    const navigateToHome = () => {
      navigationStore.setActiveItem('mypage');
      router.push('/move-to-move/mypage');
    };

    const toInfoModify = () => {
      navigationStore.setActiveItem('mypage');
      router.push('/move-to-move/profile');
    };

    const toWithdraw = () => {
      navigationStore.setActiveItem('mypage');
      router.push('/move-to-move/withdraw');
    };

    // 로그아웃 메서드
    const logout = async () => {
      try {
        const response = await axios.post('/api/members/logout', {}, { withCredentials: true }); // 로그아웃 API 호출

        if (response.status === 200) {
          authStore.logout(); // Pinia 스토어의 로그아웃 함수 호출
          // 로그아웃 후 리디렉션 ,
          router.push('/');
        } else {
          console.error('로그아웃 실패', response);
        }
      } catch (error) {
        console.error('로그아웃하는 동안 오류가 났습니다.', error);
      }
    };

    return {
      navigationStore,
      userEmail,
      userNickName,
      userProfileUrl,
      navigateToHome,
      toInfoModify,
      toWithdraw,
      logout,
    };
  },
};
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 800px;
  background-color: #f0f8ff;
}

.sidebar {
  width: 300px;
  height: 1000px;
  background-color: #6b9e9b;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  border-top-right-radius: 20px;
  position: relative;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
}

.logout-button-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logout-icon {
  font-size: 24px;
  color: white;
  margin-right: 5px;
}

.logout-text {
  font-size: 12px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.notification-container {
  position: relative; /* 자식 요소의 절대 위치 설정을 위한 상대적 위치 */
  /* display: inline-block; */
  display: none;
}

.notification-icon {
  font-size: 20px;
  color: white;
  position: relative; /* 아이콘의 위치 설정 */
  cursor: pointer;
}

.notification-dot {
  position: absolute;
  top: -5px; /* 알림 아이콘의 위쪽에 배치 */
  right: 0px; /* 알림 아이콘의 오른쪽에 배치 */
  width: 8px; /* 동그라미 크기 */
  height: 8px; /* 동그라미 크기 */
  border-radius: 50%;
  background-color: gray; /* 알림이 없을 때 */
}

.notification-dot.active {
  background-color: #d63f3f; /* 알림이 있을 때 빨간색 */
}

.sidebar-header {
  padding: 10px;
  text-align: center;
  margin-top: 20px;
}

.logo {
  width: 200px;
  height: 100px;
  margin-bottom: 10px;
  cursor: pointer;
}

.divider {
  width: 100%;
  border: none;
  border-top: 1px solid white;
  margin: 10px 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.user-info-content {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid white;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
}

.user-email {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-nickname {
  font-size: 12px;
  color: white;
}

.user-info-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.nav-menu {
  width: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px;
  height: 80px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  background-color: #6b9e9b;
  transition: background 0.3s ease;
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 30px;
}

.nav-icon {
  margin-right: 10px;
  font-size: 30px;
}

.nav-text {
  flex: 1;
  text-align: center;
}

.nav-item:hover {
  background-color: #4a7875;
}

.nav-item.active {
  background: linear-gradient(135deg, #5a6d8c, #112f4e);
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #f0f8ff;
}

.content-header {
  margin-bottom: 20px;
}

.line {
  border-top: 1px solid black;
  margin-bottom: 20px;
}
</style>
