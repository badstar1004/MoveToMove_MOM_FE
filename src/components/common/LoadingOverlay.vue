<template>
  <v-overlay :value="isVisible" :z-index="9000" class="v-overlay__content">
    <v-progress-circular indeterminate color="teal" size="64"></v-progress-circular>
    <span class="loading-text">메일 전송 중...</span>
  </v-overlay>
</template>

<script>
import { useVerificationCodeStore } from '@/stores/VerificationCodeStore';
import { ref, watch } from 'vue';

export default {
  setup() {
    const verificationCodeStore = useVerificationCodeStore();

    const isVisible = ref(false); // 로딩 오버레이의 표시 여부

    // verificationCodeStore.isLoading이 변할 때마다 감지
    watch(
      () => verificationCodeStore.isLoading,
      (newValue) => {
        isVisible.value = newValue; // 새로운 값으로 업데이트
        console.log('qwer: ', isVisible.value);
      },
    );
    console.log('fff: ', verificationCodeStore.isLoading);

    return {
      verificationCodeStore,
      isVisible,
    };
  },
};
</script>

<style scoped>
/* 스피너와 텍스트를 중앙에 배치 */
.v-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fa1010;
}

/* 로딩 텍스트 스타일 */
.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: #e01818;
}
</style>
