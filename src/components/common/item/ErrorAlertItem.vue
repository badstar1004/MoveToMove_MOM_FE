<template>
  <div v-if="show" class="alert-overlay">
    <div class="alert-content">
      <p class="alert-message">{{ message }}</p>
      <!-- 공용 버튼으로 수정 -->
      <CommonButton @click="closeAlert" :width="100" :height="30" :fontSize="20" class="info-button" default-text="확인" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import CommonButton from '@/components/common/item/RoundButtonItem.vue';

export default {
  components: {
    CommonButton,
  },
  setup() {
    // 상태 관리
    const show = ref(false); // 알림창 보임 여부
    const message = ref(''); // 알림창 메시지

    // 메서드 정의
    const openAlert = (newMessage) => {
      message.value = newMessage;
      show.value = true;
    };

    const closeAlert = () => {
      show.value = false;
    };

    // 상태와 메서드를 반환하여 템플릿에서 사용 가능하게 함
    return {
      show,
      message,
      openAlert,
      closeAlert,
    };
  },
};
</script>

<style scoped>
/* 알림창을 띄우는 위치 조절 */
.alert-overlay {
  position: fixed; /* 화면에 고정 */
  top: 0;
  left: 0;
  width: 100vw; /* 전체 화면 너비 */
  height: 100vh; /* 전체 화면 높이 */
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; /* Flexbox 사용 */
  align-items: center; /* 수직 중앙 정렬 */
  justify-content: center; /* 수평 중앙 정렬 */
  z-index: 1000; /* 다른 요소보다 앞에 보이도록 설정 */
}

.alert-content {
  background-color: #f0f8ff; /* 알림창 배경색 */
  width: 500px; /* 알림창 너비 설정 */
  height: 250px; /* 알림창 높이 설정 */
  padding: 20px; /* 내부 여백 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  text-align: center; /* 텍스트 중앙 정렬 */
  display: flex; /* Flexbox 사용 */
  flex-direction: column; /* 세로 정렬 */
  justify-content: center; /* 내용 수직 중앙 정렬 */
  align-items: center; /* 내용 수평 중앙 정렬 */
}

.alert-message {
  margin: 0; /* 기본 마진 제거 */
  padding-top: 30px; /* 메시지 위에 패딩 추가 */
  padding-bottom: 20px; /* 버튼과 메시지 사이에 여백 추가 */
  font-size: 14px; /* 메시지의 글꼴 크기 */
  flex-grow: 1; /* 남은 공간을 모두 차지하도록 설정 */
  font-weight: 800;
  font-size: larger;
}

.info-button {
  background-color: transparent !important; /* 공용 버튼의 배경색은 이미 설정되어 있으므로 투명으로 */
  border: none !important;
}
</style>
