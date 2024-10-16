import axiosInstance from '@/api/axiosInstance';
import { defineStore } from 'pinia';

export const useProjectStore = defineStore('project', {
  state: () => ({
    // 프로젝트를 데이터를 저장할 객체
    projectData: {
      projectId: null,
      projectName: '',
      projectDescription: '',
      startAt: null,
      endAt: null,
      projectLeaderYN: 'N',
      type: '',
      createdAt: null,
      deletedAt: null,
    },
  }),
  actions: {
    // 프로젝트 데이터 설정
    setProjectData(project) {
      this.projectData = { ...project }; // 프로젝트 데이터를 객체로 저장
    },
    clearProjectData() {
      this.projectData = {
        projectId: null,
        projectName: '',
        projectDescription: '',
        startAt: null,
        endAt: null,
        projectLeaderYN: 'N',
        type: '',
        createdAt: null,
        deletedAt: null,
      }; // 프로젝트 데이터를 초기화
    },

    // 프로젝트 팀장 변경
    changeProjectLeader(projectId) {
      // 새로운 projectData 객체를 생성하여 반응성을 유지
      const updatedProjectData = { ...this.projectData };

      // 팀장 여부 변경
      updatedProjectData.projectLeaderYN = projectId === updatedProjectData.projectId ? false : true;

      // 반응형으로 변경된 객체를 스토어에 할당
      this.projectData = updatedProjectData;
    },

    // 프로젝트 데이터를 새로 서버에서 로드
    // 프로젝트 데이터를 로드하는 함수
    async loadProject(projectId) {
      try {
        const response = await axiosInstance.get(`/api/projects/${projectId}`); // 서버에서 프로젝트 데이터를 가져옴
        this.setProjectData(response.data); // 프로젝트 데이터를 상태에 저장
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    },
    // 프로젝트 수정
    async updateProject(projectForm) {
      try {
        await axiosInstance.put(`/api/projects/${projectForm.projectId}`, projectForm);
      } catch (e) {
        console.error('Failed to update project data: ', e);
      }
    },
  },
});
