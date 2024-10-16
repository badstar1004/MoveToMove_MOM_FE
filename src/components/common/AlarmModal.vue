<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="container">
      <div class="header">
        <div :class="['section', { active: selected === 'project' }]" @click="selectSection('project')">프로젝트</div>
        <div :class="['section', { active: selected === 'chat' }]" @click="selectSection('chat')">채팅</div>
      </div>
      <div class="content">
        <div v-if="selected === 'project'">
          <alarm-message v-for="(msg, index) in messages" :key="index" :message="msg.text" :date="msg.date"></alarm-message>
        </div>
        <div v-if="selected === 'chat'"></div>
      </div>
    </div>
  </div>
</template>

<script>
import AlarmMessage from '@/components/common/AlarmMessage.vue';

export default {
  components: { AlarmMessage },

  data() {
    return {
      selected: 'project',
      messages: [
        { text: '프로젝트 명 1의 xxxxxxxx이 변경되었습니다.', date: '2024.08.28' },
        { text: '프로젝트 명 2의 yyyyyyyy이 업데이트 되었습니다.', date: '2024.08.29' },
      ],
    };
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    selectSection(section) {
      this.selected = section;
    },
    closeModal() {
      this.$emit('close');
    },
    confirm() {
      this.$emit('confirm');
    },
  },
};
</script>

<style scoped>
.container {
  width: 300px;
  height: 400px;
  border: 1.5px solid #6b9e9b;
  border-radius: 10px;
  background-color: #f0f8ff;
  padding: 5px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px;
  border-radius: 10px;
  border: 1px solid #6b9e9b;
  background-color: #ffffff;
}

.section {
  flex: 1;
  text-align: center;
  padding: 5px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  background-color: #ffffff;
  color: #000000;
  transition: background-color 0.3s, color 0.3s;
}

.section.active {
  background-color: #6b9e9b;
  color: #ffffff;
}
</style>
