<template>
  <div class="user-item" v-if="user">
    <!-- 사용자 이미지 -->
    <ProfileImageItem :src="userData.profileUrl" :alt="userData.nickName" :width="40" :height="40" />

    <!-- 닉네임 -->
    <span class="nickname">{{ userData.nickName }}</span>
    <!-- 팀장 여부 -->
    <font-awesome-icon :icon="['fas', 'crown']" class="leader-icon" v-if="userData.projectLeaderYN === 'Y'" />

    <!-- 매뉴 -->
    <font-awesome-icon
      :icon="['fas', 'ellipsis-vertical']"
      class="dots-menu"
      ref="dotsMenuIcon"
      v-if="userData.projectLeaderYN === 'N' && userData.memberId !== authStore.user?.memberId"
      @click="kebabMenu(userData.memberId)"
    />

    <KebabMemberMenu
      :showMenu="showMenu"
      @transferLeader="transferLeader"
      @projectOut="projectOut"
      @closeMenu="closeMenu"
      :isProjectLeader="userData.projectLeaderYN"
      class="kebab-menu"
    />
  </div>
</template>

<script>
import { ref, toRefs } from 'vue';
import ProfileImageItem from '../item/ProfileImageItem.vue';
import KebabMemberMenu from '../KebabMemberMenu.vue';

import { useAuthStore } from '@/stores/memberStore'; // Pinia 스토어에서 유저 정보 가져오기

export default {
  name: 'UserItem',
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  components: {
    ProfileImageItem,
    KebabMemberMenu,
  },
  setup(props, { emit }) {
    const { user } = toRefs(props);
    const showMenu = ref(false);
    // 클릭된 멤버 ID 저장
    const clickedMemberId = ref(null);

    // Pinia 스토어 사용
    const authStore = useAuthStore(); // authStore를 가져옵니다.

    // 케밥 메뉴 클릭된 멤버
    const kebabMenu = (memberId) => {
      try {
        showMenu.value = !showMenu.value;
        clickedMemberId.value = memberId; // 클릭된 memberId
        console.log('클릭된 멤버: ', clickedMemberId.value);

        // 부모폼인 ProjectMemberCompo.vue 로 전달
        emit('memberSelected', memberId);
      } catch (error) {
        console.error('Error in kebabMenu:', error); // 오류를 콘솔에 출력
      }
    };

    // 팀장 권한 이전 전달
    const transferLeader = () => {
      console.log('팀장 권한 이전 전달: ', clickedMemberId.value);
      emit('transferLeader', clickedMemberId.value);
    };

    // 프로젝트 내보내기 전달
    const projectOut = () => {
      console.log('프로젝트 내보내기 전달: ', clickedMemberId.value);
      emit('projectOut', clickedMemberId.value);
    };

    // 케밥 메뉴 닫기
    const closeMenu = () => {
      showMenu.value = false;
    };

    // user를 userData라는 새로운 이름으로 반환
    return {
      userData: user,
      authStore,
      showMenu,
      kebabMenu,
      transferLeader, // 팀장 권한 이전 선택 전달
      projectOut, // 프로젝트 내보내기 선택 전달
      closeMenu,
    };
  },
};
</script>

<style scoped>
.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-weight: bold;
  position: relative;
  z-index: 1000; /* 스크롤바보다 높은 z-index */
}

.nickname {
  margin-left: 10px;
  font-size: 16px;
}

.leader-icon {
  color: gold;
  margin-left: 8px;
}

.dots-menu {
  width: 10px;
  margin-left: auto;
  cursor: pointer;
}

.kebab-menu {
  z-index: 1000; /* z-index 값을 높게 설정하여 메뉴가 상단에 표시되도록 */
}
</style>
