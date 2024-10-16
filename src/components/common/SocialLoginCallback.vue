<template>
  <div class="callback-container">
    <div class="loading-content">
      <!-- 로딩 애니메이션을 보여주기 위해 spinner를 사용하거나 로그인 처리 중 메시지를 표시합니다 -->
      <div class="spinner"></div>
      <p>로그인 처리 중입니다. 잠시만 기다려 주세요...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/memberStore'; // Pinia 스토어 임포트

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore(); // Pinia 스토어 사용

const handleLogin = async () => {
  // 쿼리 파라미터에서 액세스 토큰 가져오기
  const accessToken = route.query.accessToken;

  if (accessToken) {
    // 액세스 토큰을 로컬 스토리지에 저장 - access 토큰 이름 변경할 수 있음
    localStorage.setItem('accessToken', accessToken);
    authStore.login({ accessToken }); // Pinia 스토어에 액세스 토큰 저장

    try {
      // 스토어에서 유저 정보 요청
      await authStore.fetchUser();

      router.push('/move-to-move/mypage'); // 성공 후 페이지 이동
    } catch (err) {
      console.error('API 요청 실패:', err);
      router.push('/login'); // 실패 시 로그인 페이지로 리다이렉트
    }
  } else {
    console.error('로그인 실패: 액세스 토큰이 없습니다.');
    router.push('/login'); // 실패 시 로그인 페이지로 리다이렉트
  }
};

// 컴포넌트가 로드될 때 handleLogin 함수 호출
onMounted(() => {
  handleLogin();
});
</script>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh; /* 화면 전체를 사용 */
  background-color: #F0F8FF;
}
.loading-content {
  text-align: center;
}
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid#6b9e9b;
  border-top: #F0F8FF;
  border-radius: 50%;
  animation: spin 1s linear infinite; /* 로딩 애니메이션 */
  margin-bottom: 20px; /* 간격 추가 */
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>