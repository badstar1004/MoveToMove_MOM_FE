<template>
  <div class="kanban-card-content">
    <h2>칸반 카드 내용</h2>
    <div class="card-content">
      <!-- 상단 바  -->
      <div class="card-header">
        <button class="edit-button">수정</button>
      </div>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardContent',
  setup() {
    const description = '칸반 보드는 작업을 시작하고, 진행 중인 작업을 계획하여 효율을 최대화하는 애자일 프로젝트 관리 도구입니다.';

    return {
      description,
    };
  },
};
</script>

<style scoped>
.kanban-card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 중앙 정렬 */
  width: 100%;
  padding: 5px;
}
.card-content {
  background-color: white;
  border: 1.5px solid #6b9e9b;
  border-radius: 8px;
  padding: 0; /* 전체 패딩 제거 */
  overflow: hidden; /* 모서리 넘침 방지 */
  width: 100%; /* 부모 너비에 맞춤 */
}
.card-header {
  background-color: #6b9e9b; /* 상단 바 배경색 */
  height: 35px; /* 높이 조절 */
  border-bottom: 1.5px solid #6b9e9b; /* 하단 경계선 추가 */
  display: flex;
  justify-content: flex-end; /* 우측 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  padding: 0 10px; /* 패딩 추가 */
  margin: 0; /* 여백 제거 */
}
.edit-button {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 2px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}
.edit-button:hover {
  background-color: white;
  color: #6b9e9b;
}

.card-content p {
  margin: 10px; /* 텍스트 주변 간격 */
  padding: 10px;
  font-size: 16px; /* 글꼴 크기 */
  line-height: 1.6; /* 줄 간격 설정 */
  color: #333; /* 텍스트 색상 */
  text-align: justify; /* 텍스트 양쪽 정렬 */
  border-radius: 4px; /* 텍스트 배경의 모서리 둥글게 */
}
</style>
