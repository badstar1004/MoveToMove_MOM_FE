<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content">
        <p>{{ message }}</p>
      </div>
      <div class="button-container">
        <round-button-item class="home-button" type="button" :width="175" :height="40" @click="ok">확인</round-button-item>
        <round-button-item class="home-button" type="button" :width="175" :height="40" @click="close" :backgroundColor="'cancel'">취소</round-button-item>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: true,
    },
    locationFlag: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    // 확인 (locationFlag 기준으로 각각 개발 진행)
    const ok = () => {
      emit('ok');
    };

    // 닫기
    const close = () => {
      emit('close');
    };

    return {
      ok,
      close,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1500;
}

.modal-container {
  background: #f0f8ff;
  border: 2px solid #6b9e9b;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  z-index: 2000;
}
.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.modal-content p {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}
</style>
