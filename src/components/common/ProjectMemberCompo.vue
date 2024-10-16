<template>
  <div>
    <v-expansion-panels v-model="panel" multiple>
      <v-expansion-panel class="member-contains">
        <v-expansion-panel-title>
          <div class="header">
            <span>참여자 ({{ joinMemberStore.joinMembers?.length }})</span>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="user-list" v-if="joinMemberStore.joinMembers?.length > 0">
            <UserItem
              v-for="user in joinMemberStore.joinMembers"
              :key="user.memberId"
              :user="user"
              @transferLeader="handleTransferLeader"
              @projectOut="projectOut"
            />
          </div>
          <!-- 초대 버튼 -->
          <div class="invite-button">
            <round-button-item v-if="isLeader" type="button" :width="180" :height="30" :borderRadius="5" :fontSize="13" @click.stop="addMemberInvite">
              참여자 초대 +
            </round-button-item>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <project-member-invite :isInviteModalOpen="isInviteModalOpen" @closeModal="closeModal" />
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue'; // Vue의 ref를 가져옵니다.

import { useJoinMemberStore } from '@/stores/joinMemberStore';
import { useAuthStore } from '@/stores/memberStore'; // 로그인 정보 가져오기
import { useProjectStore } from '@/stores/projectStore';
import UserItem from '../common/combine/UserListItem.vue';
import ProjectMemberInvite from './ProjectMemberInvite.vue';

export default {
  components: {
    UserItem,
    ProjectMemberInvite,
  },
  emits: ['projectOut'],
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const panel = ref([0]); // 첫 번째 패널을 기본적으로 열려 있게 설정
    const isInviteModalOpen = ref(false);
    const joinMemberStore = useJoinMemberStore();
    const projectStore = useProjectStore();
    const authStore = useAuthStore(); // 로그인 정보 가져오기
    const isLeader = ref(false);
    const sendProjectId = ref(null);

    onMounted(() => {
      if (props.projectId) {
        joinMemberStore.fetchMembers(props.projectId); // projectId가 존재할 때만 데이터를 조회합니다.

        // projectStore에서 projectData를 가져와서 팀장 여부 확인
        const projectData = projectStore.projectData;
        if (projectData && projectData.projectLeaderYN) {
          isLeader.value = projectData.projectLeaderYN;
          sendProjectId.value = projectData.projectId;
        }
      }
    });

    // 로그인된 유저와 joinMemberStore의 멤버 비교 후 팀장 여부 설정
    const checkLeaderStatus = () => {
      if (joinMemberStore.joinMembers?.length > 0 && authStore.user) {
        const currentUser = joinMemberStore.joinMembers.find((member) => member.memberId === authStore.user.memberId);

        if (currentUser && currentUser.projectLeaderYN === 'Y') {
          isLeader.value = true;
        } else {
          isLeader.value = false;
        }
      }
    };

    // projectId가 변경될 때마다 멤버 조회를 다시 수행
    watch(
      () => props.projectId,
      (newProjectId) => {
        if (newProjectId) {
          joinMemberStore.fetchMembers(newProjectId);

          checkLeaderStatus(); // 멤버 정보 가져온 후 팀장 여부 확인
        }
      },
      { immediate: true }, // 처음 컴포넌트가 마운트될 때도 실행
    );

    // 프로젝트 리더 여부를 감지하는 watch
    watch(
      () => joinMemberStore.joinMembers,
      (newMembers) => {
        if (newMembers) {
          checkLeaderStatus(); // 멤버 정보 변경 시 팀장 여부 확인
        }
      },
      { immediate: true }, // 처음에도 실행
    );

    // 팀장 권한 이전 함수 -> 스토어 전달
    const handleTransferLeader = async (memberId) => {
      await joinMemberStore.transferLeader(props.projectId, memberId);

      // 프로젝트 스토어 수정
      projectStore.changeProjectLeader(props.projectId);
    };

    // 프로젝트 내보내기 한다는 전달
    const projectOut = async (memberId) => {
      await joinMemberStore.releaseMember(props.projectId, memberId);

      console.log(`부모컴포 전달 프로젝트에서 내보내기 할 멤버: `, memberId);
    };

    // 프로젝트 멤버 초대 모달 열기
    const addMemberInvite = (event) => {
      event.stopPropagation(); // 이벤트 버블링 방지
      isInviteModalOpen.value = true;
    };

    // 프로젝트 멤버 초대 모달 닫기
    const closeModal = () => {
      isInviteModalOpen.value = false;
    };

    return {
      panel,
      isInviteModalOpen, // 프로젝트 초대 모달 여부
      addMemberInvite, // 프로젝트 초대 함수
      projectOut, // 프로젝트에서 내보내기 함수
      closeModal, // 프로젝트 초대 모달 닫기
      handleTransferLeader, // 권한 이전 함수
      joinMemberStore, // Pinia 스토어
      isLeader, // template에서 사용 가능
      sendProjectId,
    };
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.member-contains {
  border-radius: 10px;
  margin-top: 10px;
}

.user-list {
  padding: 8px 0;
  max-height: 250px; /* 원하는 높이 설정 */
}

.invite-button {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
