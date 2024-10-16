import axiosInstance from '@/api/axiosInstance';
import { defineStore } from 'pinia';

export const useJoinMemberStore = defineStore('joinMemberStore', {
  // 전통적인 state 속성
  state: () => ({
    joinMembers: [], // 멤버 리스트
    isLoading: false, // 로딩 상태
  }),

  // actions에 함수를 정의하여 상태를 변경하는 로직 구현
  actions: {
    // 프로젝트 참여자 조회
    async fetchMembers(projectId) {
      this.isLoading = true;
      try {
        if (projectId) {
          const response = await axiosInstance.get(`/api/projects/${projectId}/members`);
          this.joinMembers = response.data;
        }
      } catch (e) {
        console.error('Error occurred during fetching users', e);
      } finally {
        this.isLoading = false;
      }
    },

    // 팀장 권한 이전
    async transferLeader(projectId, memberId) {
      try {
        const response = await axiosInstance.patch(`/api/projects/${projectId}/project-join/${memberId}/transfer-leader`);
        if (response.status === 200) {
          console.log('권한 이전 성공', response.data);
          await this.fetchMembers(projectId); // 권한 이전 후 멤버 목록 다시 조회
        }
      } catch (e) {
        console.error('Error occurred during transferring leader', e);
      }
    },

    // 프로젝트 내보내기
    async releaseMember(projectId, memberId) {
      try {
        console.log('내보내기 시작', projectId, memberId);

        const response = await axiosInstance.delete(`/api/projects/${projectId}/release/${memberId}`);
        if (response.status === 200) {
          console.log('내보내기 성공', response.data);
          await this.fetchMembers(projectId); // 권한 이전 후 멤버 목록 다시 조회
        }
      } catch (e) {
        console.error('Error occurred during transferring leader', e);
      }
    },

    reset() {
      this.joinMembers = []; // 상태 초기화
    },
  },
});
