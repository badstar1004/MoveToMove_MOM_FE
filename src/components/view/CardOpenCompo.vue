<template>
  <div class="content-wrapper">
    <!-- 좌 -->
    <ContentLeft class="content-left" />

    <!-- 구분선 -->
    <div class="divider"></div>

    <!-- 우 -->
    <ContentRight class="content-right" />
  </div>
</template>

<script>
import ContentLeft from '@/components/common/CardContentLeft.vue';
import ContentRight from '@/components/common/CardContentRight.vue';
export default {
  name: 'KanbanCardCompo',
  components: {
    ContentLeft,
    ContentRight,
  },
  setup() {
    return {};
  },
};
</script>

<style scoped>
.content-wrapper {
  display: flex; /* Flexbox 사용 */
  justify-content: space-between; /* 좌우 요소 간 간격을 고르게 배치 */
}
.content-left {
  flex: 3;
  padding: 10px;
}
.content-right {
  flex: 1;
  padding: 20px;
}
.divider {
  width: 2px; /* 선의 너비 */
  background-color: #6b9e9b; /* 선의 색상 */
  margin: 0 20px; /* 좌우 여백 */
}
</style>
