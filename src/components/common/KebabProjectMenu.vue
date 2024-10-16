<template>
  <div class="kebab-menu" v-if="showMenu" ref="menu">
    <div class="menu-item" v-if="isProjectLeaderComputed" @click="manage">
      <font-awesome-icon :icon="['fas', 'gear']" class="icon" />
      <span class="menu-text">프로젝트 관리</span>
    </div>
    <div class="menu-item bracket" @click="leave">
      <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="icon" />
      <span class="menu-text">프로젝트 나가기</span>
    </div>

    <alert-ok-cancel :isVisible="isModalVisible" @ok="projectExit" @close="closeModal" message="해당 프로젝트를 나가시겠습니까?" locationFlag="project">
    </alert-ok-cancel>
    <alert-check-message :isVisible="isCheckMessageVisible" :message="'팀장권한을 이전해주세요.'" @close="checkAlertClose" />
    <!-- <ConfirmAlert :isVisible="isCheckProjectOut" message="프로젝트가 생성되었습니다." /> -->
  </div>
</template>

<script>
import axiosInstance from '@/api/axiosInstance';
import { useProjectStore } from '@/stores/projectStore';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AlertCheckMessage from './AlertCheckMessage.vue';
import AlertOkCancel from './AlertOkCancel.vue';

export default {
  name: 'kebabProjectMenu',
  props: {
    showMenu: Boolean,
    isProjectLeader: {
      type: Boolean,
      required: true,
    },
    locationFlag: {
      type: String,
      required: false,
    },
    projectId: {
      type: Number,
      required: false,
    },
    projectName: {
      type: String,
      required: false,
    },
  },
  components: {
    AlertOkCancel,
    AlertCheckMessage,
  },
  emits: ['closeMenu', 'projectDeleted'],
  setup(props, { emit }) {
    const router = useRouter();
    const isMenuReadyToClose = ref(false); // 외부 클릭 감지
    const menu = ref(null); // 메뉴 요소에 대한 참조
    const isModalVisible = ref(false); // 모달의 표시 여부
    const projectStore = useProjectStore(); // 프로젝트 스토어
    const isCheckMessageVisible = ref(false); // 팀장 권한 확인 여부
    // const isCheckProjectOut = ref(false); // 프로젝트 나가기 확인 여부

    // 프로젝트 관리
    const manage = () => {
      router.push({
        name: 'ManageProjectCompo',
        params: { projectId: props.projectId }, // 동적 경로 매개변수로 projectId 전달
        query: { projectName: props.projectName }, // 쿼리 파라미터로 projectName 전달
      });
      // router.replace('/move-to-move/manage-project');
    };

    // isProjectLeader를 computed로 선언하여 반응형으로 동작하도록 설정
    const isProjectLeaderComputed = computed(() => {
      return projectStore.projectData.projectLeaderYN;
    });

    // 프로젝트 나가기
    const leave = async () => {
      try {
        console.log('팀장 여부: ', projectStore.projectData.projectLeaderYN);
        console.log('프로젝트아이디: ', projectStore.projectData.id);

        // 팀장이라면
        if (projectStore.projectData.projectLeaderYN) {
          // 멤버 조회
          const response = await axiosInstance.get(`/api/projects/${projectStore.projectData.id}/members`);
          const isParticipants = response.data;

          // 자신을 제외한 다른 사람이 있다면
          if (isParticipants.length > 1) {
            isCheckMessageVisible.value = true;
            return;
          }
        }

        // 확인/취소 모달 띄우기
        isModalVisible.value = true;
      } catch (error) {
        console.error(error);
        return;
      }
    };

    // 프로젝트 나가기
    const projectExit = async () => {
      console.log('projectExit 호출됨');
      try {
        // 프로젝트 나가기
        const response = await axiosInstance.delete(`/api/projects/${projectStore.projectData.id}/${projectStore.projectData?.projectLeaderYN ? 'Y' : 'N'}`);
        if (response.status == 200) {
          // 프로젝트 나가기 했을때 알림창
          // isCheckProjectOut.value = true;

          // 모달 닫음
          isModalVisible.value = false;
          projectStore.clearProjectData(); // 프로젝트 내용 초기화

          // 이벤트를 부모로 전달하여 프로젝트 삭제 후의 상태를 알림
          emit('projectDeleted');
        }
      } catch (error) {
        console.error(error);
        return;
      }
    };

    // 닫기
    const closeModal = () => {
      isModalVisible.value = false;
    };

    // 팀장 권한 확인 Alert 닫기
    const checkAlertClose = () => {
      isCheckMessageVisible.value = false;
      isModalVisible.value = false;
    };

    // 외부 클릭 감지 준비
    watch(
      () => props.showMenu,
      (newVal) => {
        if (newVal) {
          setTimeout(() => {
            isMenuReadyToClose.value = true;
          }, 100);
        } else {
          isMenuReadyToClose.value = false;
        }
      },
    );

    // 외부 클릭 시 닫기
    const handleClickOutside = (event) => {
      if (!isMenuReadyToClose.value) {
        return;
      }
      if (menu.value && !menu.value.contains(event.target)) {
        emit('closeMenu');
      }
    };

    // 전역 클릭 이벤트 등록
    onMounted(() => {
      window.addEventListener('click', handleClickOutside);
    });

    // 전역 클릭 이벤트 제거
    onBeforeUnmount(() => {
      window.removeEventListener('click', handleClickOutside);
    });

    return {
      menu,
      isProjectLeaderComputed,
      isMenuReadyToClose,
      isModalVisible, // ok/no 메시지
      isCheckMessageVisible, // 팀장 권한 이전 메시지
      checkAlertClose, // 팀장 권한 확인 Alert 닫기
      manage,
      leave,
      projectExit, // 프로젝트 나가기
      closeModal,
    };
  },
};
</script>

<style scoped>
.kebab-menu {
  position: absolute;
  border-radius: 10px;
  width: 220px;
  background-color: #ffffff;
  border: 1.5px solid #6b9e9b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  top: 164px;
  right: 20px;
  z-index: 1000;
  padding: 10px 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.menu-item:hover {
  transform: scale(1.05);
}

.menu-text {
  margin-left: 10px;
  text-align: right;
  flex-grow: 1;
}

.bracket {
  color: #d63f3f;
}
</style>
