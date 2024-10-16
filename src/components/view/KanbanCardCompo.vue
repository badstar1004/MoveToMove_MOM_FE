<template>
  <div class="contains" @click="cardClick">
    <div class="card-member">
      <ProfileImage v-for="(member, index) in card.members" :key="index" :src="member.profileUrl" :alt="member.nickName + ' Avatar'" :width="25" :height="25" />
    </div>
    <div class="card-info">
      <div class="card-title">{{ card.title }}</div>
      <div class="card-labels">
        <span class="label" :style="priorityStyle">{{ priorityText }}</span>
        <span class="label" :style="taskSizeStyle">{{ taskSizeText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import ProfileImage from '../common/item/ProfileImageItem.vue';

export default {
  components: {
    ProfileImage,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    // 카드 클릭 시 이벤트 핸들러
    const cardClick = () => {
      emit('card-click', props.card);
    };

    // priority에 따른 배경색 및 텍스트 결정
    const priorityStyle = computed(() => {
      let backgroundColor;
      let color = '#000000'; // 기본 텍스트 색상
      switch (props.card.priority) {
        case 3: // 낮음
          backgroundColor = '#9BF09B';
          break;
        case 2: // 중간
          backgroundColor = '#9BB8F0';
          break;
        case 1: // 높음
          backgroundColor = '#E99BF0';
          break;
        case 0: // 긴급
          backgroundColor = '#E45959';
          color = '#ffffff'; // 긴급일 때 흰색 텍스트
          break;
        default:
          backgroundColor = '#e0e0e0'; // 기본 색상
      }
      return { backgroundColor, color };
    });

    const priorityText = computed(() => {
      switch (props.card.priority) {
        case 3:
          return '낮음';
        case 2:
          return '중간';
        case 1:
          return '높음';
        case 0:
          return '긴급';
        default:
          return '알 수 없음';
      }
    });

    // task_size에 따른 배경색 및 텍스트 결정
    const taskSizeStyle = computed(() => {
      let backgroundColor;
      switch (props.card.taskSize) {
        case 0: // Small
          backgroundColor = '#CEF2CE';
          break;
        case 1: // Medium
          backgroundColor = '#CEE0F2';
          break;
        case 2: // Large
          backgroundColor = '#E0CEF2';
          break;
        case 3: // Extra Large
          backgroundColor = '#F2CECE';
          break;
        default:
          backgroundColor = '#e0e0e0'; // 기본 색상
      }
      return { backgroundColor };
    });

    const taskSizeText = computed(() => {
      switch (props.card.taskSize) {
        case 0:
          return 'Small';
        case 1:
          return 'Medium';
        case 2:
          return 'Large';
        case 3:
          return 'Extra Large';
        default:
          return 'Unknown';
      }
    });

    return {
      priorityStyle,
      priorityText,
      taskSizeStyle,
      taskSizeText,
      cardClick,
    };
  },
};
</script>

<style scoped>
.contains {
  /* background: #f0f8ff; */
  border: 1px solid #6b9e9b;
  padding: 10px;
  margin-top: 10px;
  border-radius: 10px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
}

.card-member {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.card-info {
  margin-top: 10px;
  text-align: left;
}

.card-title {
  font-weight: bold;
  font-size: 18px;
}

.card-labels {
  margin-top: 15px;
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.label {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid #6b9e9b;
}
</style>
