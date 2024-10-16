<template>
  <div class="content-left-wrapper">
    <!-- 내용 컴포넌트 -->
    <CardContent />

    <!-- 코멘트 컴포넌트 -->
    <CardComments />

    <!-- 코멘트 작성 컴포넌트 -->
    <CardCommentForm />
  </div>
</template>

<script>
import CardCommentForm from './CardCommentForm.vue';
import CardComments from './CardComments.vue';
import CardContent from './CardContent.vue';

export default {
  name: 'ContentLeft',
  components: {
    CardContent,
    CardComments,
    CardCommentForm,
  },
};
</script>

<style>
.content-left-wrapper {
  display: flex;
  flex-direction: column; /* 세로로 정렬 */
  gap: 20px; /* 각 컴포넌트 사이의 간격 */
}
</style>
