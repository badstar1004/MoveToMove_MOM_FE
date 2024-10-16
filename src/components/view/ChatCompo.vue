<template>
  <div class="mypage">
    <h1>채팅</h1>
    <!-- 마이페이지 내용 -->
    <div class="sub-content">
      <v-card-content> 여기에 이제 content를 개발하세요 </v-card-content>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyPageCompo',
};
</script>

<style scoped>
.mypage {
  background-color: #f0f8ff;
  border-radius: 8px;
  height: 970px;
  border: 1px solid #000;
}

h1 {
  font-size: 32px;
  text-align: left;
  border: 1px solid #000;
  margin: 0;
}

.sub-content {
  margin-top: 20px;
  border: 1px solid #000;
  /* 추가적인 스타일 적용 */
}
</style>
