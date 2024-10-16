<template>
  <v-app>
    <!-- 메인 콘텐츠 영역 -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const route = useRoute();

    // 로그인 상태에 따라 AppBar와 Footer 표시 여부 결정
    const showAppBar = computed(() => route.name !== 'Auth');

    return {
      showAppBar,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #f0f8ff;
  height: 900px;
}
</style>
