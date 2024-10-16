import axiosInstance from '@/api/axiosInstance';
import { defineStore } from 'pinia';

export const useFolderStore = defineStore('folder', {
  state: () => ({
    folderData: [], // 폴더 데이터를 저장할 배열
  }),
  actions: {
    // axiosInstance 폴더 조회
    async fetchFolders() {
      try {
        const response = await axiosInstance.get('/api/folders');
        this.folderData = response.data.totalFolderProjects;
      } catch (error) {
        console.error('폴더 데이터를 가져오는 중 오류 발생', error);
      }
    },

    // 폴더 생성
    async addNewFolder(newFolder) {
      try {
        const response = await axiosInstance.post('/api/folders', newFolder);

        if (response.data.status === 201) {
          console.log(response.data.message);

          const createdFolder = response.data.data;

          this.folderData.push({
            id: createdFolder.id,
            title: createdFolder.title,
            parentFolderId: createdFolder.parentFolderId || null,
            depth: createdFolder.depth || 1,
            seq: createdFolder.seq || 1,
            projectIds: [],
            children: [],
          });

          // 폴더 데이터를 다시 정렬하여 상태에 반영
          this.folderData = this.sortFoldersAndProjects(this.folderData);
        }
      } catch (error) {
        console.error('폴더 생성 중 오류 발생', error);
      }
    },

    // 폴더와 프로젝트를 구분하여 정렬하는 함수
    sortFoldersAndProjects(data) {
      return data
        .map((folder) => {
          if (folder.children && folder.children.length > 0) {
            // 하위 폴더와 프로젝트를 먼저 재귀적으로 정렬
            folder.children = this.sortFoldersAndProjects(folder.children);
          }
          return folder;
        })
        .sort((a, b) => {
          // 폴더는 seq 기준으로 우선 정렬
          if (a.children && b.children) {
            return a.seq - b.seq;
          }
          // 프로젝트는 title 기준으로 정렬 (children이 없는 경우 프로젝트로 간주)
          if (!a.children && !b.children) {
            return a.title.localeCompare(b.title);
          }
          // 폴더는 프로젝트보다 위에 위치하도록 설정
          return a.children ? -1 : 1;
        });
    },
    // 폴더 또는 프로젝트를 삭제하는 함수
    deleteByIdAndType(id, type) {
      console.log('폴더스토어 삭제 데이터: ', id, type);

      const deleteRecursive = (data) => {
        return data.filter((item) => {
          // 프로젝트나 폴더가 일치하지 않는 경우 유지
          if (item.id !== id || item.type !== type) {
            // 자식이 있는 폴더일 경우 하위 폴더/프로젝트도 확인
            if (item.children && item.children.length > 0) {
              item.children = deleteRecursive(item.children);
            }
            return true;
          }
          // 일치하는 경우 삭제
          return false;
        });
      };

      // 최상위 폴더 및 프로젝트에서 삭제 실행
      this.folderData = deleteRecursive(this.folderData);
    },
  },
});
