<template>
  <div>
    <!-- 카드 헤더 컴포넌트에 props로 데이터 전달 -->
    <CardHeader v-if="cardData" :cardData="cardData"></CardHeader> <!-- v-if를 사용하여 cardData가 있을 때만 렌더링 -->

    <!-- 구분선 -->
    <hr class="custom-divider" />

    <!-- 카드 내용 컴포넌트 -->
    <div class="card-content">
      <ContentCompo></ContentCompo>
    </div>
  </div>
</template>

<script>
import CardHeader from "@/components/common/CardHeader.vue";
import ContentCompo from "@/components/view/CardOpenCompo.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

export default {
  name: "KanbanCardCompo",
  components: {
    CardHeader,
    ContentCompo,
  },

  setup() {
    const route = useRoute();

    // 라우터에서 전달받은 데이터를 사용하여 카드 데이터 설정
    const cardData = computed(() => ({
      id: route.query.id, // 전달된 ID 사용
      title: route.query.title || '기본 제목', // 전달된 제목 또는 기본값
      status: '진행중', // 예시로 고정된 값 사용
      nickname: '닉네임', // 예시로 고정된 값 사용
      date: '2달전', // 예시로 고정된 값 사용
    }));

    return { cardData };
  },
};
</script>

<style>
.custom-divider {
  border: none;
  border-top: 3px solid #6b9e9b;
  margin-top: 10px;
}
</style>
