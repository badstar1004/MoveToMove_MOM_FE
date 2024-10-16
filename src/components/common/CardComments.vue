<template>
  <div class="card-comments">
    <h3 v-if="commentList.length > 0">코멘트</h3>
    <div class="comment" v-for="comment in commentList" :key="comment.commentId">
      <div class="comment-header">
        <ProfileImage :src="comment.profileUrl" :alt="comment.nickName + ' Avatar'" :width="25" :height="25" class="avatar" />
        <div class="comment-info">
          <span class="author">{{ comment.nickName }}</span>
          <span class="date">{{ formatDateTime(comment.createdAt) }}</span>
          <button v-if="comment.nickName === member.nickName && !isEditing(comment.commentId)" @click="startEdit(comment.commentId)" class="edit-button">
            수정
          </button>
          <button v-if="comment.nickName === member.nickName && !isEditing(comment.commentId)" @click="deleteComment(comment.commentId)" class="delete-button">
            삭제
          </button>
          <round-button-item
            :width="50"
            :height="20"
            :borderRadius="5"
            :fontSize="11"
            v-if="comment.nickName === member.nickName && isEditing(comment.commentId)"
            @click="updateEdit(comment.commentId)"
            >저장</round-button-item
          >
          <round-button-item
            :width="50"
            :height="20"
            :borderRadius="5"
            :fontSize="11"
            :backgroundColor="'cancel'"
            class="edit-card-cancel"
            v-if="comment.nickName === member.nickName && isEditing(comment.commentId)"
            @click="cancelEdit(comment.commentId)"
            >취소</round-button-item
          >
        </div>
        <div class="comment-actions">팀원</div>
      </div>
      <div class="comment-body">
        <textarea
          v-if="isEditing(comment.commentId)"
          v-model="editContent[comment.commentId]"
          @input="autoResize(comment.commentId)"
          class="edit-textarea"
          :ref="setTextareaRef(comment.commentId)"
          placeholder="코멘트를 작성하세요."
          :class="{ 'error-placeholder': isInvalid && editContent[comment.commentId] === '' }"
        ></textarea>
        <p v-else class="comment-content">{{ comment.content }}</p>
      </div>
    </div>
    <alert-ok-cancel
      :isVisible="isDeleteComment"
      @ok="agreeDeleteComment"
      @close="checkAlertClose"
      message="해당 코멘트를 삭제하시겠습니까?"
      locationFlag="member-leader"
    >
    </alert-ok-cancel>
  </div>
</template>

<script>
import { computed, ref, nextTick } from 'vue';
import { useAuthStore } from '@/stores/memberStore';
import { useCommentStore } from '@/stores/commentStore';
import ProfileImage from '@/components/common/item/ProfileImageItem.vue';
import AlertOkCancel from '@/components/common/AlertOkCancel.vue';

export default {
  name: 'CardComments',
  components: {
    ProfileImage,
    AlertOkCancel,
  },
  props: {
    commentList: {
      type: Array,
      required: true,
    },
  },
  emits: ['delete-comment'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const commentStore = useCommentStore();
    const member = computed(() => authStore.getUser);
    const editingCommentId = ref(null);
    const editContent = ref({});
    const textareaRefs = ref({});
    const isInvalid = ref(false);
    const isDeleteComment = ref(false);
    const deleteCommentId = ref('');

    // 등록 날짜
    const formatDateTime = (date) => {
      if (!date) return '';
      const [datePart, timePart] = date.split('T');
      const time = timePart.substring(0, 5);
      return `${datePart} ${time}`;
    };

    // 수정 전환 확인
    const isEditing = (commentId) => {
      return editingCommentId.value === commentId;
    };

    // 수정 전환
    const startEdit = (commentId) => {
      editingCommentId.value = commentId;
      const comment = props.commentList.find((c) => c.commentId === commentId);
      editContent.value[commentId] = comment.content;
      isInvalid.value = false;
      nextTick(() => autoResize(commentId)); // nextTick 이후에 textarea 크기 조정
    };

    // 수정 취소
    const cancelEdit = (commentId) => {
      editContent.value[commentId] = '';
      editingCommentId.value = null;
      isInvalid.value = false;
    };

    // 수정 저장
    const updateEdit = (commentId) => {
      const updatedContent = editContent.value[commentId];

      if (!updatedContent.trim()) {
        editContent.value[commentId] = '';
        isInvalid.value = true;
        return;
      }

      commentStore.updateComment(commentId, updatedContent);
      editingCommentId.value = null; // 수정 모드 종료
      isInvalid.value = false; // 저장 후 상태 초기화
    };

    // 코멘트 삭제
    const deleteComment = (commentId) => {
      isDeleteComment.value = true;
      deleteCommentId.value = commentId;
    };

    const agreeDeleteComment = async () => {
      isDeleteComment.value = false;
      await commentStore.deleteComment(deleteCommentId.value);
      deleteCommentId.value = '';
      emit('delete-comment');
    };

    const checkAlertClose = () => {
      isDeleteComment.value = false;
      deleteCommentId.value = '';
    };

    // textarea 자동 크기 조정
    const autoResize = (commentId) => {
      nextTick(() => {
        const textarea = textareaRefs.value[commentId]; // Vue의 ref로 접근
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      });
    };

    // ref 설정 함수
    const setTextareaRef = (commentId) => (el) => {
      if (el) {
        textareaRefs.value[commentId] = el;
      }
    };

    return {
      member,
      editContent,
      isInvalid,
      isDeleteComment,
      formatDateTime,

      isEditing,
      startEdit,
      cancelEdit,
      updateEdit,
      deleteComment,
      agreeDeleteComment,
      checkAlertClose,

      autoResize,
      setTextareaRef,
    };
  },
};
</script>

<style scoped>
h3 {
  text-align: left;
  font-size: 18px;
  margin: 5px;
}

.comment {
  text-align: left;
  border-radius: 5px;
  margin-bottom: 20px;
  background-color: white;
  border: 1px solid #6b9e9b;
  overflow: hidden;
}

.comment-header {
  display: flex;
  height: 35px;
  padding: 0 10px;
  justify-content: flex-end;
  align-items: center;
  background-color: #6b9e9b;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #ffffff;
}

.comment-info {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.author {
  color: white;
  margin-right: 10px;
}

.date {
  font-size: 12px;
  color: white;
  margin: 2px 10px 0px 0px;
}

.edit-button,
.delete-button {
  color: white;
  padding: 2px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  margin-right: 5px;
  border: 1px solid white;
}

.edit-button:hover,
.delete-button:hover {
  background-color: white;
  color: #6b9e9b;
}

.comment-actions {
  margin-left: auto;
  color: white;
  padding: 2px 10px;
  border-radius: 5px;
  font-size: 12px;
  border: 1px solid #ffffff;
}

.comment-content {
  padding: 10px;
  margin-top: 5px;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

.edit-textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  font-size: 14px;
  outline: none;
  resize: none;
  overflow: hidden;
}

.error-placeholder::placeholder {
  color: red;
}

.edit-card-cancel {
  margin-left: 5px;
  border: 1px solid #ffffff !important;
}
</style>
