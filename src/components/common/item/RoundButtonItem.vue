<template>
  <v-btn :style="buttonStyle">
    <slot class="defaultText">
      {{ defaultText }}
    </slot>
  </v-btn>
</template>

<script>
import { computed, toRefs } from 'vue';

export default {
  props: {
    defaultText: {
      type: String,
      default: '기본값',
    },
    width: {
      type: Number,
      default: 380,
    },
    height: {
      type: Number,
      default: 72,
    },
    fontSize: {
      type: Number,
      default: 16, // 기본 글자 크기 (px)
    },
    fontColor: {
      // 기본 글자 색
      type: String,
      default: '#ffffff',
    },
    borderRadius: {
      type: Number,
      default: 10, // 기본 둥근 모서리 (px)
    },
    backgroundColor: {
      type: String,
      default: '', // 빈 문자열로 기본값 설정
    },
  },
  setup(props) {
    const { width, height, fontSize, fontColor, borderRadius, backgroundColor } = toRefs(props);

    // props에 따라 buttonStyle을 계산
    const buttonStyle = computed(() => {
      let bgColor;

      // backgroundColor 값에 따라 배경색 설정
      if (backgroundColor.value === 'cancel') {
        bgColor = '#6B9E9B';
      } else if (backgroundColor.value === 'etc') {
        bgColor = '#F0F8FF';
      } else {
        // 아무 값도 전달되지 않았을 때 기본값 설정
        bgColor = 'linear-gradient(to right, #5A6D8C, #112F4E)';
      }

      return {
        width: width.value + 'px',
        height: height.value + 'px',
        fontSize: fontSize.value + 'px', // 글자 크기 설정
        color: fontColor.value, // 글자 색
        borderRadius: borderRadius.value + 'px', // 둥근 모서리 크기
        display: 'flex',
        alignItems: 'center', // 수직 중앙 정렬
        justifyContent: 'center', // 수평 중앙 정렬
        border: 'none', // 테두리 제거
        fontWeight: 'bold', // 글자 굵기
        background: bgColor, // 동적으로 결정된 배경색
      };
    });

    return {
      buttonStyle,
    };
  },
};
</script>

<style scoped></style>
