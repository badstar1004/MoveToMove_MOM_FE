import { ref } from 'vue';
import { defineStore } from 'pinia';
import axiosInstance from '@/api/axiosInstance';

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([]);

  // 코멘트 조회
  const selectComment = async (cardId) => {
    try {
      const response = await axiosInstance.get(`/api/kanban-cards/${cardId}/comments`);
      comments.value = response.data;
      console.log('데이터 가져옴 : ', comments.value);
    } catch (error) {
      console.error(error);
    }
  };

  // 코멘트 저장
  const insertComment = async (cardId, content) => {
    try {
      const form = {
        commentId: -1,
        content: content,
      };

      const response = await axiosInstance.post(`/api/kanban-cards/${cardId}/comments`, form);
      comments.value.push(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 코멘트 수정
  const updateComment = async (commentId, content) => {
    try {
      const form = {
        commentId: -1,
        content: content,
      };

      await axiosInstance.patch(`/api/comments/${commentId}`, form);

      const index = comments.value.findIndex((comment) => comment.commentId === commentId);
      if (index !== -1) {
        comments.value[index].content = content;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 코멘트 수정
  const deleteComment = async (commentId) => {
    try {
      console.log(commentId);
      await axiosInstance.delete(`/api/comments/${commentId}`);
      comments.value = comments.value.filter((comment) => comment.commentId !== commentId);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    comments,
    selectComment,
    insertComment,
    updateComment,
    deleteComment,
  };
});
