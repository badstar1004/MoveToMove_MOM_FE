<template>
  <div class="kanban-card-header">
    <!-- 닫기 버튼 컨테이너 -->
    <div class="button-container top-button">
      <button class="close-button" @click.stop="closeCard">
        <font-awesome-icon :icon="['fas', 'xmark']" class="icon" />
      </button>
      <!-- 정보 수정 버튼 -->
      <button class="edit-info-button">제목 수정</button>
    </div>

    <!-- 제목 및 정보 -->
    <div class="title-container">
      <h1>{{ cardData.title }}</h1>
      <div class="card-info">
        <p class="status">{{ cardData.status }}</p>
        <p class="nickname">{{ cardData.nickname }}</p>
        <p class="date">{{ cardData.date }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useNavigationStore } from '@/stores/navigationStore'; // Navigation Store 가져오기
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CardHeader',
  props: {
    cardData: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const router = useRouter();
    const navigationStore = useNavigationStore();

    const closeCard = () => {
      console.log('카드 Close');
      // 라우터 이동
      navigationStore.setActiveItem('kanban');
      router.push('/move-to-move/kanban');
    };

    return {
      closeCard,
    };
  },
});
</script>

<style scoped>
.kanban-card-header {
  display: flex;
  flex-direction: column; /* 세로로 정렬 */
  align-items: flex-start; /* 왼쪽 정렬 */
  gap: 10px; /* 요소 간의 간격 */
  position: relative; /* 닫기 버튼의 위치 조정을 위해 */
}

.title-container {
  align-self: stretch; /* 제목이 너비를 모두 차지하도록 */
  margin-top: 20px; /* 상단 여백 추가 */
}

h1 {
  text-align: left;
  margin: 0;
}

.card-info {
  display: flex;
  align-items: flex-end;
}

p {
  margin: 5px;
}
.status {
  background-color: #6b9e9b; /* 예시: 녹색 배경 */
  color: white;
  padding: 2px 15px;
  border-radius: 20px;
}

.nickname {
  color: #333;
  font-weight: bold;
}

.date {
  color: #888;
  font-size: 12px; /* 작은 글씨 */
}

.button-container {
  display: flex;
  flex-direction: column; /* 세로로 정렬 */
  align-items: flex-end; /* 버튼을 오른쪽으로 배치 */
  position: absolute; /* 절대 위치 */
  top: 10px; /* 상단에서의 거리 */
  right: 10px; /* 오른쪽에서의 거리 */
}

.close-button {
  background-color: red;
  border: none;
  width: 20px; /* 버튼의 너비 */
  height: 20px; /* 버튼의 높이 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  color: white;
  margin-bottom: 10px; /* 버튼 간의 간격 추가 */
}

.close-button {
  background-color: red;
}

.edit-info-button {
  border: none;
  /* padding: 5px 10px; 버튼의 크기 */
  border-radius: 5px;
  color: gray;
  cursor: pointer;
}

.icon {
  font-size: 16px;
}
</style>
