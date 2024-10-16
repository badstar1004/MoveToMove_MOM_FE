<template>
  <div>
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-container" @input="closeAlert">
        <div class="modal-content">
          <p>{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onBeforeUnmount, watch } from 'vue';

export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },

  setup(props, { emit }) {
    let timer = null;

    // 닫기
    const closeAlert = () => {
      emit('close');
    };

    // 타이머 설정
    const startTimer = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        closeAlert();
      }, 800); // 0.8 초
    };

    // isVisible 값이 변경될 때마다 타이머를 다시 설정
    watch(
      () => props.isVisible,
      (newValue) => {
        if (newValue) {
          startTimer();
        } else if (timer) {
          clearTimeout(timer);
        }
      },
    );

    // 타이머 제거
    onBeforeUnmount(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });

    return {
      closeAlert,
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
  font-size: 18px;
  color: #333;
  font-weight: bold;
}
</style>
