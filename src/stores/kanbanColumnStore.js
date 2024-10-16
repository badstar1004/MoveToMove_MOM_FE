// src/stores/kanbanColumnStore.js
import axiosInstance from '@/api/axiosInstance'; // 인증이 설정된 axios 인스턴스 가져오기
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKanbanColumnStore = defineStore('kanbanColumn', () => {
  const columns = ref([]);

  // 서버에서 컬럼 데이터 로드
  const loadColumns = async (projectId) => {
    try {
      // console.log('store', projectId);

      const response = await axiosInstance.get(`/api/projects/${projectId}/kanban-columns`); // axiosInstance 사용
      columns.value = response.data;
      // console.log('서버 요청으로 가지고 온 컬럼데이터 입니다.', columns.value[1]);
    } catch (error) {
      console.error('Failed to load columns:', error);
    }
  };
  // 컬럼 추가 요청
  const addColumn = async (kanbanColumnForms) => {
    columns.value.push(kanbanColumnForms);
    console.log(kanbanColumnForms);
    try {
      await axiosInstance.patch(`/api/kanban-columns`,columns.value);
      await loadColumns(kanbanColumnForms.projectId);
    } catch (e) {
      console.log('Failed to add column',e);
    }
  };
  // 컬럼 삭제 요청
  const removeColumn = async (columnId) => {

      try {
        // 디비 먼저 삭제
        await axiosInstance.delete(`/api/kanban-columns/${columnId}`);
        // 서버 요청이 성공하였을 때에만 피니아 배열에서 데이터 삭제합니다.
        // columns.value = columns.value.filter((col) => col.kanbanColumnId !== columnId);
      } catch (error) {
        console.error(`Failed to load columns: `, error);
      }
  };
  const moveColumn = async (kanbanColumnId, projectId, newIndex) => {
    try {
      const kanbanColumnMoveRequestForm = {
        projectId : projectId,
        newPosition : newIndex,
      };

       await axiosInstance.patch(`/api/kanban-columns/${kanbanColumnId}`, kanbanColumnMoveRequestForm);
    } catch (e) {
      console.error(e);
    }
  };
  return {
    columns,
    loadColumns,
    addColumn,
    removeColumn,
    moveColumn,
  };
});
