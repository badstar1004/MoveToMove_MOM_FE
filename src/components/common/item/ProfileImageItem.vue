<template>
  <img :src="computedSrc" :alt="computedAlt" :style="avatarStyle" class="avatar" />
</template>

<script>
import defaultImage from '@/assets/basic-profile.png';
import { computed, toRefs } from 'vue';

export default {
  props: {
    src: {
      type: [String, null],
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 24,
    },
    height: {
      type: Number,
      default: 24,
    },
  },
  setup(props) {
    const { width, height } = toRefs(props);

    // src가 없을 때 기본 이미지로 대체
    const computedSrc = computed(() => {
      return props.src ? props.src : defaultImage;
    });

    // width와 height를 기반으로 아바타 스타일을 계산
    const avatarStyle = computed(() => {
      return {
        width: width.value + 'px',
        height: height.value + 'px',
      };
    });

    const computedAlt = computed(() => {
      return props.alt || 'Default Alt Text';
    });

    return {
      computedSrc,
      avatarStyle,
      computedAlt,
      ...toRefs(props), // props를 반환하여 템플릿에서 직접 사용 가능하게 함
    };
  },
};
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  object-fit: cover;
}
</style>
