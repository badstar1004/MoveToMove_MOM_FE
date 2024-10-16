<template>
  <div>
    <h2>Chat Component</h2>
    <input v-model="message" @keyup.enter="sendMessage" placeholder="Type your message..." />
    <button @click="sendMessage">Send</button>

    <div v-if="receivedMessages.length">
      <h3>Received Messages:</h3>
      <ul>
        <li v-for="(msg, index) in receivedMessages" :key="index">{{ msg }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWebSocketStore } from '@/stores/webSocketStore';

export default {
  setup() {
    const message = ref('');
    const webSocketStore = useWebSocketStore();

    // WebSocket 연결
    onMounted(() => {
      webSocketStore.connect();
    });

    // WebSocket 연결 해제
    onUnmounted(() => {
      webSocketStore.disconnect();
    });

    // 메시지 전송 함수
    const sendMessage = () => {
      if (message.value.trim() !== '') {
        webSocketStore.sendMessage(message.value); // 서버로 메시지 전송
        message.value = ''; // 입력 필드 초기화
      }
    };

    // Pinia 스토어의 상태를 반응형으로 사용
    const receivedMessages = computed(() => webSocketStore.receivedMessages);

    return {
      message,
      sendMessage,
      receivedMessages, // 반응형 상태
    };
  },
};
</script>

<style scoped>
/* 스타일 추가 */
</style>
