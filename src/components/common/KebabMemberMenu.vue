<template>
  <div class="kebab-menu" v-if="showMenu" ref="menu">
    <div class="menu-item" v-if="isProjectLeader === 'N'" @click="leader">
      <font-awesome-icon :icon="['fas', 'crown']" class="icon" />
      <span class="menu-text">팀장 권한 이전</span>
    </div>
    <div class="menu-item bracket" @click="leave">
      <font-awesome-icon :icon="['fas', 'right-from-bracket']" />
      <span class="menu-text">내보내기</span>
    </div>

    <alert-ok-cancel :isVisible="isLeader" @ok="transferLeader" @close="closeLeader" message="팀장 권한을 이전 하시겠습니까?" locationFlag="member-leader">
    </alert-ok-cancel>
    <alert-ok-cancel :isVisible="isLeave" @ok="projectOut" @close="closeLeave" message="프로젝트에서 내보시내겠습니까?" locationFlag="member-leave">
    </alert-ok-cancel>
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AlertOkCancel from './AlertOkCancel.vue';

export default {
  inheritAttrs: false,
  props: {
    showMenu: Boolean,
    isProjectLeader: {
      type: String,
      required: true,
    },
    locationFlag: {
      type: String,
      required: false,
    },
  },
  components: {
    AlertOkCancel,
  },

  emits: ['closeMenu', 'transferLeader', 'projectOut'],

  setup(props, { emit }) {
    const isMenuReadyToClose = ref(false); // 외부 클릭 감지
    const menu = ref(null); // 메뉴 요소에 대한 참조
    const isLeader = ref(false); // 리더이전 모달
    const isLeave = ref(false); // 내보내기 모달

    // 팀장 권한이전 확정
    const transferLeader = () => {
      emit('transferLeader');
      isLeader.value = false;
    };

    // 프로젝트 내보내기
    const projectOut = () => {
      emit('projectOut');
      isLeave.value = false;
    };

    // 팀장 권한 이전
    const leader = () => {
      isLeader.value = true;
    };

    // 프로젝트 나가기
    const leave = () => {
      isLeave.value = true;
    };

    // 닫기
    const closeLeader = () => {
      isLeader.value = false;
    };

    // 닫기
    const closeLeave = () => {
      isLeave.value = false;
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
      isMenuReadyToClose,
      transferLeader, // 팀장 권한 이전 함수
      projectOut, // 프로젝트 내보내기 함수
      isLeader,
      isLeave,
      leader,
      leave,
      closeLeader,
      closeLeave,
    };
  },
};
</script>

<style scoped>
.kebab-menu {
  position: absolute;
  border-radius: 10px;
  width: 180px;
  background-color: #ffffff;
  border: 1.5px solid #6b9e9b;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  top: -2px;
  left: 248px;
  z-index: 2000;
  padding: 10px 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 5px 0;
  font-size: 16px;
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

.icon {
  color: gold;
}

.bracket {
  color: #d63f3f;
}
</style>
