<template>
  <transition name="slide" class="contains">
    <div v-if="isVisible" class="slide-container">
      <div class="header-contains">
        <font-awesome-icon :icon="['fas', 'xmark']" class="close-icon" @click="closeSlide" />
        <div class="title-section">
          <template v-if="isEditingTitle">
            <input v-model="modifyTitle" class="card-title card-title-input" />
            <div class="edit-card-button-group">
              <round-button-item :width="50" :height="28" :borderRadius="5" :fontSize="12" @click="saveTitle(card.id, 'title', modifyTitle)"
                >저장</round-button-item
              >
              <round-button-item :width="50" :height="28" :borderRadius="5" :fontSize="12" :backgroundColor="'cancel'" @click="cancelEditTitle"
                >취소</round-button-item
              >
            </div>
          </template>
          <template v-else>
            <h2 class="card-title">{{ card.title }}</h2>
            <button class="edit-card-title" @click="editTitle">제목 수정</button>
          </template>
        </div>

        <div class="info-section">
          <span class="status-badge">{{ card.columnName }}</span>
          <!-- <span class="nickname">닉네임</span> -->
          <span class="title-date">{{ daysDifference }}일 전</span>
        </div>
      </div>

      <div class="underline"></div>

      <div class="content-contains">
        <!-- 왼쪽 이미지 및 텍스트 설명 -->
        <div class="left-content">
          <div class="card-content">
            <div class="card-header">
              <!-- 수정 버튼 또는 저장/취소 버튼 -->
              <template v-if="isEditingContent">
                <round-button-item :width="50" :height="25" :borderRadius="5" :fontSize="12" @click="saveContent(card.id, 'content', modifyContent)"
                  >저장</round-button-item
                >
                <round-button-item
                  :width="50"
                  :height="25"
                  :borderRadius="5"
                  :fontSize="12"
                  :backgroundColor="'cancel'"
                  @click="cancelEditContent"
                  class="edit-card-cancel"
                  >취소</round-button-item
                >
              </template>
              <template v-else>
                <button class="edit-card-content" @click="editContent">수정</button>
              </template>
            </div>
            <template v-if="isEditingContent">
              <textarea v-model="modifyContent" class="card-content-input"></textarea>
            </template>
            <template v-else>
              <p>{{ card.content }}</p>
            </template>
          </div>

          <!-- 코멘트 -->
          <CardComments :commentList="comment" @delete-comment="handleDeleteComment" />

          <!-- 코멘트 작성 -->
          <CardCommentForm :cardId="card.id" />
        </div>

        <!-- 세로선 -->
        <div class="vertical-line"></div>

        <!-- 오른쪽 카드 정보 -->
        <div class="right-content">
          <div class="card-details">
            <!-- 담당자 선택 -->
            <div class="assignee-container">
              <div class="modal-trigger" @click="openAssigneeModal">
                <div class="division-member">
                  <span class="division-name-member">담당자</span>
                  <div class="assignee-list">
                    <div class="assignee-info" v-for="member in card.members" :key="member.memberId">
                      <ProfileImage :src="member.profileUrl" :alt="member.nickName + ' Avatar'" :width="25" :height="25" />
                      {{ member.nickName }}
                    </div>
                  </div>
                </div>
                <CardCommonModal
                  v-show="currentModal === 'assigneeModal'"
                  :isVisible="true"
                  :title="modalTitle"
                  :items="modalItems"
                  :multiple="true"
                  @close="closeModal"
                  @confirm="handleConfirm"
                  class="modal-position"
                />
              </div>
            </div>

            <!-- 우선순위 -->
            <div class="modal-trigger" @click="openOptionModal('우선순위 선택', priorities, 'priorityModal')">
              <div class="division">
                <span class="division-name">우선순위</span>
                <span class="priority" :style="priorityStyle">{{ priorityText }}</span>
              </div>
              <CardCommonModal
                v-show="currentModal === 'priorityModal'"
                :isVisible="true"
                :title="modalTitle"
                :items="modalItems"
                :multiple="false"
                @close="closeModal"
                @confirm="handleConfirm"
                class="modal-position"
              />
            </div>

            <!-- 작업크기 -->
            <div class="modal-trigger" @click="openOptionModal('작업크기 선택', sizes, 'sizeModal')">
              <div class="division">
                <span class="division-name">작업크기</span>
                <span class="size" :style="taskSizeStyle">{{ taskSizeText }}</span>
              </div>
              <CardCommonModal
                :isVisible="currentModal === 'sizeModal'"
                :title="modalTitle"
                :items="modalItems"
                :multiple="false"
                @close="closeModal"
                @confirm="handleConfirm"
                class="modal-position"
              />
            </div>
            <div class="division">
              <span class="division-name">시작날짜</span>
              <input type="date" v-model="startAtFormat" @change="updateStartAt(startAtFormat)" id="start-date" class="date-input" />
            </div>
            <div class="division">
              <span class="division-name">종료날짜</span>
              <input type="date" v-model="endAtFormat" @change="updateEndAt(endAtFormat)" id="end-date" class="date-input" />
            </div>
          </div>

          <div class="delete-button">
            <round-button-item :width="130" :height="30" :borderRadius="5" :fontSize="12" @click="deleteCard">카드 삭제</round-button-item>
          </div>
        </div>
      </div>
      <alert-check-message :isVisible="isStartAt" :message="'종료날짜와 같거나 작아야합니다.'" @close="checkAlertClose" />
      <alert-check-message :isVisible="isEndAt" :message="'시작날짜와 같거나 커야합니다.'" @close="checkAlertClose" />
      <alert-ok-cancel
        :isVisible="isDeleteCard"
        @ok="agreeDeleteCard"
        @close="checkAlertClose"
        message="해당 칸반 카드를 삭제하시겠습니까?"
        locationFlag="member-leader"
      >
      </alert-ok-cancel>
      <alert-check-message :isVisible="successDelete" :message="'칸반 카드 삭제 완료 되었습니다.'" @close="deleteAlertClose" />
    </div>
  </transition>
</template>

<script>
import axiosInstance from '@/api/axiosInstance';
import AlertCheckMessage from '@/components/common/AlertCheckMessage.vue';
import AlertOkCancel from '@/components/common/AlertOkCancel.vue';
import CardCommentForm from '@/components/common/CardCommentForm.vue';
import CardComments from '@/components/common/CardComments.vue';
import CardCommonModal from '@/components/common/item/CardCommonModal.vue';
import ProfileImage from '@/components/common/item/ProfileImageItem.vue';
import { useCommentStore } from '@/stores/commentStore';
import { useKanbanCardStore } from '@/stores/kanbanCardStore';
import { useProjectStore } from '@/stores/projectStore'; // 프로젝트 스토어
import { computed, ref, watch, watchEffect } from 'vue';
import { useWebSocketStore } from '@/stores/webSocketStore';

export default {
  components: {
    CardCommonModal,
    CardCommentForm,
    CardComments,
    ProfileImage,
    AlertCheckMessage,
    AlertOkCancel,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    card: {
      type: Object,
      default: () => ({}), // 기본값을 빈 객체로 설정
    },
    projectId: {
      type: Number,
      default: null,
    },
  },

  emits: ['close', 'delete-card'],

  setup(props, { emit }) {
    // 메시지
    const isStartAt = ref(false);
    const isEndAt = ref(false);
    const successDelete = ref(false);

    // 메시지 닫기
    const checkAlertClose = () => {
      isStartAt.value = false;
      isEndAt.value = false;
      isDeleteCard.value = false;
    };

    // 닫기
    const closeSlide = () => {
      emit('close');
    };

    // 조회
    const projectJoinMember = async (projectId) => {
      try {
        const response = await axiosInstance.get(`/api/projects/${projectId}/members`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    };

    // 카드 생성 일자
    const daysDifference = computed(() => {
      const createdAtDate = new Date(props.card.createdAt);
      const currentDate = new Date();

      const timeDifference = currentDate.getTime() - createdAtDate.getTime();
      const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

      return dayDifference;
    });

    // priority
    const priorityText = computed(() => {
      switch (props.card.priority) {
        case 3:
          return '낮음';
        case 2:
          return '중간';
        case 1:
          return '높음';
        case 0:
          return '긴급';
        default:
          return '알 수 없음';
      }
    });

    const priorityStyle = computed(() => {
      let backgroundColor;
      let color = '#000000'; // 기본 텍스트 색상
      switch (props.card.priority) {
        case 3: // 낮음
          backgroundColor = '#9BF09B';
          break;
        case 2: // 중간
          backgroundColor = '#9BB8F0';
          break;
        case 1: // 높음
          backgroundColor = '#E99BF0';
          break;
        case 0: // 긴급
          backgroundColor = '#E45959';
          color = '#ffffff'; // 긴급일 때 흰색 텍스트
          break;
        default:
          backgroundColor = '#e0e0e0'; // 기본 색상
      }
      return { backgroundColor, color };
    });

    // task_size
    const taskSizeText = computed(() => {
      switch (props.card.taskSize) {
        case 0:
          return 'Small';
        case 1:
          return 'Medium';
        case 2:
          return 'Large';
        case 3:
          return 'Extra Large';
        default:
          return 'Unknown';
      }
    });

    const taskSizeStyle = computed(() => {
      let backgroundColor;
      switch (props.card.taskSize) {
        case 0: // Small
          backgroundColor = '#CEF2CE';
          break;
        case 1: // Medium
          backgroundColor = '#CEE0F2';
          break;
        case 2: // Large
          backgroundColor = '#E0CEF2';
          break;
        case 3: // Extra Large
          backgroundColor = '#F2CECE';
          break;
        default:
          backgroundColor = '#e0e0e0'; // 기본 색상
      }
      return { backgroundColor };
    });

    // 시작 날짜
    const startAtFormat = ref('');

    // 시작 날짜를 업데이트 체크
    const updateStartAt = async (newValue) => {
      if (!props.card.endAt) {
        // endAt이 null이므로 비교 없이 바로 업데이트
        await kanbanCardStore.updateKanbanCard(props.card.id, 'start_at', newValue);
        await webSocketStore.sendUpdateCardInfoMessage({
          projectId: props.projectId,
          type: 'updateCardInfo',
        });
        return;
      }

      // endAt이 존재할 때만 비교
      if (new Date(newValue) > new Date(props.card.endAt.split('T')[0])) {
        isStartAt.value = true;
        startAtFormat.value = props.card.startAt ? props.card.startAt.split('T')[0] : ''; // 안전하게 split 호출
        return;
      }

      // 비교를 통과했을 때 업데이트
      kanbanCardStore.updateKanbanCard(props.card.id, 'start_at', newValue);
      await webSocketStore.sendUpdateCardInfoMessage({
        projectId: props.projectId,
        type: 'updateCardInfo',
      });
    };

    // 종료 날짜
    const endAtFormat = ref('');

    // 종료 날짜를 업데이트 체크
    const updateEndAt = async (newValue) => {
      if (!props.card.startAt) {
        // startAt이 null이므로 비교 없이 바로 업데이트
        await kanbanCardStore.updateKanbanCard(props.card.id, 'end_at', newValue);
        await webSocketStore.sendUpdateCardInfoMessage({
          projectId: props.projectId,
          type: 'updateCardInfo',
        });
        return;
      }

      // startAt이 존재할 때만 비교
      if (new Date(newValue) < new Date(props.card.startAt.split('T')[0])) {
        isEndAt.value = true;
        endAtFormat.value = props.card.endAt ? props.card.endAt.split('T')[0] : ''; // 안전하게 split 호출
        return;
      }

      // 비교를 통과했을 때 업데이트
      await kanbanCardStore.updateKanbanCard(props.card.id, 'end_at', newValue);
      await webSocketStore.sendUpdateCardInfoMessage({
        projectId: props.projectId,
        type: 'updateCardInfo',
      });
    };

    // 저장 및 수정
    const kanbanCardStore = useKanbanCardStore();
    const commentStore = useCommentStore();
    const projectStore = useProjectStore();
    const modifyTitle = ref('');
    const isEditingTitle = ref(false);
    const modifyContent = ref('');
    const isEditingContent = ref(false);

    // 제목 수정
    const editTitle = () => {
      modifyTitle.value = props.card.title;
      isEditingTitle.value = true;
    };

    // 제목 저장
    const saveTitle = async (cardId, updateColumn, updateData) => {
      await kanbanCardStore.updateKanbanCard(cardId, updateColumn, updateData);

      // 웹소켓
      await webSocketStore.sendUpdateCardInfoMessage({
        projectId: props.projectId,
        type: 'updateCardInfo',
      });
      isEditingTitle.value = false;
    };

    // 제목 취소
    const cancelEditTitle = () => {
      modifyTitle.value = props.card.title;
      isEditingTitle.value = false;
    };

    // 내용 수정
    const editContent = () => {
      modifyContent.value = props.card.content;
      isEditingContent.value = true;
    };

    // 내용 저장
    const saveContent = async (cardId, updateColumn, updateData) => {
      await kanbanCardStore.updateKanbanCard(cardId, updateColumn, updateData);
      await webSocketStore.sendUpdateCardInfoMessage({
        projectId: props.projectId,
        type: 'updateCardInfo',
      });
      isEditingContent.value = false;
    };

    // 내용 취소
    const cancelEditContent = () => {
      modifyContent.value = props.card.content;
      isEditingContent.value = false;
    };

    // 모달 관련
    const users = ref([]);
    const currentModal = ref('');
    const modalTitle = ref('');
    const modalItems = ref([]);
    const isMultiple = ref(false);

    // 담당자 모달
    const openAssigneeModal = async () => {
      modalTitle.value = '담당자 선택';
      isMultiple.value = true;

      const users = await projectJoinMember(projectStore.projectData.id);

      // card.members가 undefined인 경우 빈 배열로 처리
      const cardMembers = props.card.members || [];

      modalItems.value = users.map((user) => ({
        id: user.memberId,
        name: user.nickName,
        avatar: user.profileUrl,
        email: user.email,
        selected: cardMembers.some((member) => member.memberId === user.memberId),
      }));

      currentModal.value = 'assigneeModal';
    };

    const priorities = ref([
      { id: 3, name: '낮음', color: '#9BF09B' },
      { id: 2, name: '중간', color: '#9BB8F0' },
      { id: 1, name: '높음', color: '#E99BF0' },
      { id: 0, name: '긴급', color: '#E45959' },
    ]);

    const sizes = ref([
      { id: 0, name: 'Small', color: '#CEF2CE' },
      { id: 1, name: 'Medium', color: '#CEE0F2' },
      { id: 2, name: 'Large', color: '#E0CEF2' },
      { id: 3, name: 'Extra Large', color: '#F2CECE' },
    ]);

    // 우선순위, 작업크기 모달
    const openOptionModal = (title, items, current) => {
      modalTitle.value = title;
      isMultiple.value = false;

      const selectedValue = current === 'priorityModal' ? props.card.priority : props.card.taskSize;

      modalItems.value = items.map((item) => ({
        ...item,
        selected: item.id === selectedValue,
      }));

      currentModal.value = current;
    };

    // 모달 확인
    const handleConfirm = async (selectedItems) => {
      if (modalTitle.value === '담당자 선택') {
        await kanbanCardStore.updateKanbanCardMember(props.card.id, selectedItems);
      } else if (modalTitle.value === '우선순위 선택') {
        await kanbanCardStore.updateKanbanCard(props.card.id, 'priority', selectedItems[0].id);
      } else if (modalTitle.value === '작업크기 선택') {
        await kanbanCardStore.updateKanbanCard(props.card.id, 'task_size', selectedItems[0].id);
      }

      // 웹소켓
      await webSocketStore.sendUpdateCardInfoMessage({
        projectId: props.projectId,
        type: 'updateCardInfo',
      });
      closeModal();
    };

    // 모달 취소
    const closeModal = () => {
      currentModal.value = '';
    };

    // 카드 삭제
    const isDeleteCard = ref(false);

    const deleteCard = () => {
      isDeleteCard.value = true;
    };

    const agreeDeleteCard = async () => {
      isDeleteCard.value = false;
      await kanbanCardStore.deleteKanbanCard(props.card.id);
      // 웹소켓
      await webSocketStore.connect(props.projectId);
      await webSocketStore.sendDeleteKanbanCardMessage({
        projectId: props.projectId,
        type: 'deleteCard',
      });
      successDelete.value = true;
    };

    const deleteAlertClose = () => {
      successDelete.value = false;
      emit('delete-card', projectStore.projectData.id);
      emit('close');
    };

    // 코멘트
    const comment = ref([]);

    const handleDeleteComment = () => {
      comment.value = commentStore.comments;
    };

    // 프로젝트 스토어 변경 감지
    watch(
      () => projectStore.projectData.id, // 감시할 값: projectStore의 프로젝트 ID
      async (newProjectId, oldProjectId) => {
        if (newProjectId !== oldProjectId) {
          // 프로젝트 ID가 변경되었을 때 새로운 프로젝트 멤버를 다시 로드하고 users에 저장
          try {
            const response = await projectJoinMember(newProjectId); // 멤버 데이터를 불러옴
            users.value = response; // users 변수에 불러온 멤버 데이터를 저장
          } catch (error) {
            console.error('Failed to load project members:', error);
          }
        }
      },
      { immediate: true }, // 컴포넌트 로드시에도 watch가 즉시 실행되도록 설정
    );

    // store 확인
    watch(
      () => kanbanCardStore.cards,
      (modifyCards) => {
        if (props.card && props.card.id) {
          const updatedCard = modifyCards.find((c) => c.id === props.card.id);
          if (updatedCard) {
            Object.assign(props.card, updatedCard);
          }
        }
      },
      { deep: true },
    );

    // 시작날짜 변경 확인
    watchEffect(() => {
      if (props.card && props.card.startAt) {
        startAtFormat.value = props.card.startAt.split('T')[0];
      } else {
        // startAt이 null이거나 없는 경우 처리
        startAtFormat.value = ''; // 기본값을 빈 문자열로 설정
      }
    });

    // 종료날짜 변경 확인
    watchEffect(() => {
      if (props.card && props.card.endAt) {
        endAtFormat.value = props.card.endAt.split('T')[0];
      } else {
        // endAt이 null이거나 없는 경우 처리
        endAtFormat.value = ''; // 기본값을 빈 문자열로 설정
      }
    });

    // 카드 확인 후 코멘트
    watch(
      () => props.card?.id,
      (newCardId) => {
        if (newCardId) {
          commentStore.selectComment(newCardId).then(() => {
            comment.value = commentStore.comments;
          });
        }
      },
    );

    // 웹소켓 스토어
    const webSocketStore = useWebSocketStore();

    return {
      isStartAt,
      isEndAt,
      checkAlertClose,
      successDelete,

      closeSlide,

      daysDifference,
      priorityText,
      priorityStyle,
      taskSizeText,
      taskSizeStyle,
      startAtFormat,
      updateStartAt,
      endAtFormat,
      updateEndAt,

      modifyTitle,
      isEditingTitle,
      editTitle,
      saveTitle,
      cancelEditTitle,
      modifyContent,
      isEditingContent,
      editContent,
      saveContent,
      cancelEditContent,

      openAssigneeModal,
      openOptionModal,
      projectJoinMember,
      users,
      sizes,
      priorities,
      currentModal,
      modalTitle,
      modalItems,
      isMultiple,
      handleConfirm,
      closeModal,

      isDeleteCard,
      deleteCard,
      agreeDeleteCard,
      deleteAlertClose,

      comment,
      handleDeleteComment,
    };
  },
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

.contains {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  border: 1.5px solid #6b9e9b;
}

/* 슬라이드의 기본 스타일 */
.slide-container {
  position: fixed;
  bottom: 0;
  right: 0;
  margin-top: 109px;
  width: 60%;
  height: 88.1%;
  z-index: 1000;
}

/* 타이틀 */
.header-contains {
  position: relative;
  padding: 10px;
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  color: #d63f3f;
  cursor: pointer;
}

.title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.card-title {
  height: 35px;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #000;
}

.card-title-input {
  font-size: 19px;
  width: 70%;
  padding: 5px;
  border-radius: 10px;
  border: 1.5px solid #6b9e9b;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  outline: none;
}

.edit-card-title {
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  font-size: 14px;
}

.edit-card-button-group {
  display: flex;
  gap: 5px;
}

.info-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  font-weight: bolder;
}

.status-badge {
  background: #6b9e9b;
  color: white;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 10px;
}

.nickname {
  font-size: 14px;
  color: #000;
}

.title-date {
  font-size: 10px;
  color: #a0a0a0;
}

.underline {
  width: 100%;
  margin: 10px auto auto auto;
  border-bottom: 2px solid #6b9e9b;
}

.vertical-line {
  width: 2px;
  background-color: #6b9e9b;
  margin: 0 15px;
}

/* 내용 */
.content-contains {
  display: flex;
  align-items: stretch;
}

/* 왼쪽 내용 */
.left-content {
  width: 70%;
  padding: 15px;
  height: calc(100vh - 240px); /* 고정된 헤더 아래로 남은 공간을 채우도록 높이 설정 */
  overflow-y: auto; /* 스크롤 가능하게 설정 */
  padding: 15px;
}

.card-content {
  overflow: hidden;
  height: 360px;
}

.edit-card-content {
  color: white;
  border: 1px solid #ffffff;
  padding: 2px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}

.edit-card-content:hover {
  background-color: white;
  color: #6b9e9b;
}

.edit-card-cancel {
  margin-left: 5px;
  border: 1px solid #ffffff !important;
}

.card-header {
  display: flex;
  height: 35px;
  padding: 0 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  justify-content: flex-end;
  align-items: center;
  background-color: #6b9e9b;
}

.card-content-input,
.card-content p {
  width: 100%;
  height: 300px;
  padding: 10px;
  margin-bottom: 30px;
  font-size: 15px;
  text-align: justify;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background-color: white;
  border: 1.5px solid #6b9e9b;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}

.card-content-input {
  resize: none;
  outline: none;
}

/* 오른쪽 내용 */
.right-content {
  width: 30%;
  padding: 15px;
}

.card-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 205px;
  border-radius: 5px;
  background-color: white;
  border: 1px solid #6b9e9b;
}

.division,
.division-member {
  display: flex;
  align-items: center;
  margin-left: 10px;
  margin-bottom: 15px;
}

.division-member {
  align-items: flex-start;
}

.division-name,
.division-name-member {
  font-size: 15px;
  font-weight: bold;
  width: 80px;
  text-align: left;
}

.division-name-member {
  margin-top: 5px;
}

/* 이미지 */
.avatar {
  margin-right: 10px;
  border: 1.5px solid #6b9e9b;
}

/* 담당자 */
.assignee-container {
  display: flex;
  width: 100%;
}

.assignee-list {
  display: flex;
  flex-direction: column;
}

.assignee-info {
  display: flex;
  align-items: center;
  padding: 4px 0px;
}

/* 우선순위 */
.priority {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  background-color: #9bb8f0;
  border: 1.5px solid #6b9e9b;
}

/* 작업크기 */
.size {
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  background-color: #e0cef2;
  border: 1.5px solid #6b9e9b;
}

/* 날짜 */
.date {
  font-weight: bold;
  padding: 4px 8px;
}

/* 모달 */
.modal-trigger {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.modal-position {
  position: absolute;
  width: 100%;
  border: 2px solid #6b9e9b;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  padding: 10px;
}

/* 삭제 */
.delete-button {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
