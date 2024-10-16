<template>
  <div></div>
  <!-- 빈 div, SweetAlert는 JavaScript로 생성 -->
</template>

<script>
import Swal from 'sweetalert2';
import { defineComponent, onMounted, watch } from 'vue';

export default defineComponent({
  name: 'AlertDialog',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: '인증번호 발송!',
    },
    text: {
      type: String,
      default: '이메일로 인증번호가 발송되었습니다.',
    },
    timer: {
      type: Number,
      default: 2000, // 2초 후 자동 닫힘
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const showAlert = () => {
      Swal.fire({
        title: props.title,
        text: props.text,
        icon: 'success', // 체크마크 아이콘을 사용
        timer: props.timer,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-custom-popup', // z-index를 수정할 클래스 추가
        },
        position: 'center',
        allowOutsideClick: false,
        didOpen: () => {
          // 알림이 열리면 모달을 숨김 처리
          document.querySelectorAll('.v-overlay').forEach((el) => (el.style.zIndex = '1000'));
        },
      }).then(() => {
        emit('close'); // 알림창이 닫히면 이벤트 발생
      });
    };

    // show prop이 변경될 때마다 알림 표시
    watch(
      () => props.show,
      (newVal) => {
        if (newVal) {
          showAlert();
        }
      },
    );

    // 컴포넌트가 처음 마운트될 때 알림 표시 (필요 시)
    onMounted(() => {
      if (props.show) {
        showAlert();
      }
    });

    return {};
  },
});
</script>

<style scoped>
.swal2-custom-popup {
  z-index: 10000 !important; /* SweetAlert 알림창의 z-index를 더 높게 설정 */
  border-radius: 12px; /* 모서리를 둥글게 */
  width: 300px; /* 정사각형 크기 설정 */
  height: 300px; /* 정사각형 크기 설정 */
  display: flex;
  align-items: center; /* 가운데 정렬 */
  justify-content: center; /* 가운데 정렬 */
}
</style>
