<template>
  <div>
    <div class="assign-details">
      <!-- 담당자와 선택된 요소들을 Flexbox로 배치 -->
      <div class="assignee-container">
        <!-- 담당자 선택 버튼 -->
        <div class="modal-trigger" @click="openModal('담당자 선택', users, 'assigneeModal', true)">
          <p>
            <strong>담당자</strong>
          </p>
          <!-- 선택된 담당자 목록 -->
          <div class="assignee-list">
            <div class="assignee-info" v-for="assignee in assignee.selectedAssignees" :key="assignee.name">
              <img :src="assignee.avatar" alt="Avatar" class="avatar" />
              {{ assignee.name }}
            </div>
          </div>
          <!-- 담당자 선택 모달 -->
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
      <div class="modal-trigger" @click="openModal('우선순위 선택', priorities, 'priorityModal', false)">
        <p>
          <strong>우선순위</strong>
          <span class="priority">
            {{ assignee.priority }}
          </span>
        </p>
        <!-- 우선순위 선택 모달 -->
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
      <div class="modal-trigger" @click="openModal('작업크기 선택', sizes, 'sizeModal', false)">
        <p>
          <strong>작업크기</strong>
          <span class="size">{{ assignee.size }}</span>
        </p>
        <!-- 작업크기 선택 모달 -->
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

      <!-- 시작날짜 -->
      <p>
        <strong>시작날짜</strong>
        <input type="date" v-model="assignee.startDate" class="date-input" />
      </p>

      <!-- 종료날짜 -->
      <p>
        <strong>종료날짜</strong>
        <input type="date" v-model="assignee.endDate" class="date-input" />
      </p>
    </div>

    <!-- 카드 삭제 버튼 -->
    <div class="delete-button">
      <CustomButton :default-text="`카드 삭제`" :width="130" :height="35" font-size="18" @click="deleteCard"></CustomButton>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import CustomButton from '@/components/common/item/RoundButtonItem.vue';
import CardCommonModal from './item/CardCommonModal.vue';

export default {
  name: 'AssignInfo',
  components: {
    CustomButton,
    CardCommonModal,
  },
  setup() {
    const assignee = ref({
      selectedAssignees: [
        {
          name: '팬텀',
          avatar: 'https://over-clock-s3.s3.ap-northeast-2.amazonaws.com//img/60409475-953c-4658-8fb4-7807c0c379a0.jpg',
        },
      ], // 여러 명의 담당자를 저장
      priority: '중간',
      size: 'Large',
      startDate: '2024-08-13',
      endDate: '2024-08-23',
    });

    const modalTitle = ref('');
    const modalItems = ref([]);
    const currentModal = ref('');
    const isMultiple = ref(false);  // 다중 선택 여부를 위한 변수 추가

    const users = ref([
      { id: 1, name: '팬텀', avatar: 'https://over-clock-s3.s3.ap-northeast-2.amazonaws.com//img/60409475-953c-4658-8fb4-7807c0c379a0.jpg' },
      { id: 2, name: '오동나무', avatar: 'https://over-clock-s3.s3.ap-northeast-2.amazonaws.com//img/5e56fa91-f87d-4f4b-86f0-c46d5cbaace4.png' },
      { id: 3, name: '백제신라고구려', avatar: 'https://over-clock-s3.s3.ap-northeast-2.amazonaws.com//img/5e56fa91-f87d-4f4b-86f0-c46d5cbaace4.png' },
      { id: 4, name: '은나라금나라', avatar: 'https://over-clock-s3.s3.ap-northeast-2.amazonaws.com//img/5e56fa91-f87d-4f4b-86f0-c46d5cbaace4.png' },
    ]);

    const priorities = ref([
      { id: 1, name: '낮음', avatar: 'https://via.placeholder.com/30' },
      { id: 2, name: '중간', avatar: 'https://via.placeholder.com/30' },
      { id: 3, name: '높음', avatar: 'https://via.placeholder.com/30' },
      { id: 4, name: '긴급', avatar: 'https://via.placeholder.com/30' },
    ]);

    const sizes = ref([
      { id: 1, name: 'Small', avatar: 'https://via.placeholder.com/30' },
      { id: 2, name: 'Medium', avatar: 'https://via.placeholder.com/30' },
      { id: 3, name: 'Large', avatar: 'https://via.placeholder.com/30' },
      { id: 4, name: 'Extra Large', avatar: 'https://via.placeholder.com/30' },
    ]);

    const openModal = (title, items, modalId, multiple) => {
      modalTitle.value = title;
      modalItems.value = items.map((item) => ({
        ...item,
        selected:
          modalId === 'assigneeModal'
            ? assignee.value.selectedAssignees.some((assignee) => assignee.id === item.id)
            : item.name === assignee.value.priority || item.name === assignee.value.size,
      }));
      currentModal.value = modalId;
      isMultiple.value = multiple;  // multiple 값을 설정
    };

    const closeModal = () => {
      currentModal.value = '';
    };

    const handleConfirm = (selectedItems) => {
      console.log('선택된 항목:', selectedItems);
      if (modalTitle.value === '담당자 선택') {
        // 여러 명의 담당자를 선택하도록 수정
        assignee.value.selectedAssignees = selectedItems.map((item) => ({
          id: item.id,
          name: item.name,
          avatar: item.avatar,
        }));
      } else if (modalTitle.value === '우선순위 선택') {
        assignee.value.priority = selectedItems[0]?.name; // 첫 번째 선택된 항목만 저장
      } else if (modalTitle.value === '작업크기 선택') {
        assignee.value.size = selectedItems[0]?.name; // 첫 번째 선택된 항목만 저장
      }
      closeModal();
    };

    const deleteCard = () => {
      console.log('카드가 삭제되었습니다');
    };

    return {
      assignee,
      modalTitle,
      modalItems,
      users,
      priorities,
      sizes,
      openModal,
      closeModal,
      handleConfirm,
      deleteCard,
      currentModal,
      isMultiple,  // isMultiple을 반환하여 사용 가능하도록 설정
    };
  },
};
</script>



<style scoped>
.assign-details {
  background-color: white;
  padding: 20px;
  border: 1px solid #6b9e9b;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px; /* 카드 삭제 버튼과의 간격 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 350px; /* 박스 최소 너비 */
  min-height: 250px; /* 박스 최소 높이 */
}
.assignee-container {
  display: flex; /* 가로로 정렬 */
  align-items: center; /* 수직 가운데 정렬 */
  gap: 20px; /* 담당자 선택 버튼과 선택된 목록 사이 간격 */
  width: 100%; /* 부모 너비에 맞춤 */
  margin-bottom: 15px; /* 아래 요소와 간격 추가 */
}
.modal-trigger {
  position: relative; /* 부모 컨테이너에 상대적인 위치 */
  width: 100%;
  cursor: pointer;
}

.modal-position {
  position: absolute; /* 모달을 부모 컨테이너에 대해 위치 지정 */
  top: 100%; /* 클릭된 요소 바로 아래에 모달을 표시 */
  left: 0; /* 왼쪽 정렬 */
  width: 100%; /* 부모의 너비에 맞춤 */
  border: 2px solid #6b9e9b;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000; /* 모달을 다른 요소 위에 표시 */
  padding: 10px;
}

.assign-details p {
  margin: 10px 0; /* 요소 간의 간격을 넓게 설정 */
  font-size: 16px; /* 글자 크기 키우기 */
  display: flex; /* 텍스트와 데이터를 수평으로 정렬 */
  width: 100%; /* 요소의 너비를 부모에 맞춤 */
  line-height: 1.5; /* 줄 간격 설정 */
}
.avatar {
  width: 30px; /* 이미지 너비 */
  height: 30px; /* 이미지 높이 */
  border-radius: 50%; /* 원형으로 표시 */
  margin-right: 8px; /* 텍스트와 이미지 사이 간격 */
}
.delete-button {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 20px;
}

.assign-details p strong {
  width: 100px; /* 레이블의 고정 너비 설정 (글자 5자 정도) */
  font-weight: bold;
  font-size: 18px; /* 라벨의 글자 크기 키우기 */
  text-align: left; /* 레이블 왼쪽 정렬 */
  margin-right: 10px; /* 레이블과 값 사이의 간격 */
}

.assignee-list {
  display: flex;
  flex-direction: column; /* 세로로 정렬 */
  gap: 10px; /* 요소 간의 간격 */
  margin-top: 10px; /* 목록 위쪽에 간격 추가 */
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 10px; /* 이미지와 텍스트 사이 간격 */
  padding: 4px 8px;
  border-radius: 8px; /* 둥근 모서리 */
}
.priority {
  display: inline-block;
  padding: 4px 8px;
  background-color: #9bb8f0; /* 배경색 설정 */
  border-radius: 8px; /* 둥근 모서리 설정 */
  margin-left: 10px;
  font-weight: bold;
}
.size {
  display: inline-block;
  padding: 4px 8px;
  background-color: #e0cef2; /* 배경색 설정 */
  border-radius: 8px; /* 둥근 모서리 설정 */
  margin-left: 10px;
  font-weight: bold;
}
.date {
  font-weight: bold;
  padding: 4px 8px;
}
.delete-button {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 20px;
}
.modal {
  margin: 10px;
}
</style>
