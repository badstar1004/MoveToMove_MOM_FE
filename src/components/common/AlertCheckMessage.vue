<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content">
        <!-- props.message를 그대로 사용 -->
        <p>{{ message }}</p>
        <round-button-item class="home-button" type="button" :width="200" :height="40" @click="closeMessage">{{ buttonText }}</round-button-item>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: false,
      default: '동의하기를 확인해주세요.',
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const buttonText = '확인';

    const closeMessage = () => {
      emit('close'); // 부모에게 닫기 이벤트 전달
    };

    return {
      ...props, // props로 받은 message 사용
      buttonText,
      closeMessage,
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
}

.modal-container {
  background: #f0f8ff;
  border: 2px solid #6b9e9b;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
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

.home-button {
  margin-top: 30px;
}
</style>
