<template>
  <div>
    <div class="comment-label">
      <ProfileImage :src="member.profileUrl" :alt="member.nickName + ' Avatar'" :width="50" :height="50" />
      <h3 class="comment-header">코멘트 작성</h3>
    </div>

    <div class="card-comment-form">
      <div class="header-container">
        <h3 class="header-title">작성</h3>
        <round-button-item :width="50" :height="25" :borderRadius="5" :fontSize="12" @click="insertComment">등록</round-button-item>
      </div>
      <textarea
        v-model="newComment"
        placeholder="코멘트를 작성하세요."
        class="comment-input"
        :class="{ 'error-placeholder': isInvalid }"
        @input="autoResize"
        ref="textarea"
      ></textarea>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/memberStore';
import { useCommentStore } from '@/stores/commentStore';
import ProfileImage from '@/components/common/item/ProfileImageItem.vue';

export default {
  name: 'CardCommentForm',
  components: {
    ProfileImage,
  },
  props: {
    cardId: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const authStore = useAuthStore();
    const commentStore = useCommentStore();
    const member = computed(() => authStore.getUser);

    const textarea = ref(null);
    const newComment = ref('');
    const isInvalid = ref(false);

    const autoResize = () => {
      textarea.value.style.height = 'auto';
      textarea.value.style.height = `${textarea.value.scrollHeight}px`;
    };

    // 코멘트 저장
    const insertComment = () => {
      if (newComment.value.trim() === '') {
        isInvalid.value = true;
        newComment.value = '';
        return;
      }

      commentStore.insertComment(props.cardId, newComment.value);
      newComment.value = '';
      isInvalid.value = false;
    };

    onMounted(() => {
      if (textarea.value) {
        autoResize();
      }
    });

    return {
      member,
      newComment,
      isInvalid,
      autoResize,
      textarea,
      insertComment,
    };
  },
};
</script>

<style scoped>
.comment-label {
  display: flex;
  align-items: center;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0px 20px 5px 0px;
  border: 1px solid #6b9e9b;
}

.comment-header {
  font-size: 20px;
  font-weight: bold;
}

.card-comment-form {
  text-align: left;
  border-radius: 5px;
  background-color: white;
  border: 1px solid #6b9e9b;
  overflow: hidden;
}

.header-container {
  display: flex;
  height: 35px;
  padding: 0 10px;
  justify-content: space-between;
  align-items: center;
  background-color: #6b9e9b;
}

.header-title {
  color: white;
  font-size: 17px;
  font-weight: bold;
}

.comment-input {
  width: 100%;
  padding: 10px;
  font-size: 13px;
  background-color: white;
  outline: none;
  resize: none;
  overflow: hidden;
}

.comment-input.error-placeholder::placeholder {
  color: red;
}
</style>
