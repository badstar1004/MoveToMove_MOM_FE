<template>
  <div>
    <h1>프로젝트 관리</h1>

    <div class="new-project-contains">
      <div class="project-content">
        <div class="content-group">
          <label>프로젝트명</label>
          <div class="vertical-line"></div>
          <div class="input-container">
            <input type="text" id="nickName" placeholder="프로젝트명" v-model="projectData.title" />
            <div class="error-message"></div>
          </div>
        </div>
        <div class="content-group-area">
          <label>프로젝트 설명</label>
          <div class="vertical-line-area"></div>
          <div class="input-container">
            <textarea id="projectDescription" placeholder="프로젝트 설명" v-model="projectData.projectDescription" ></textarea>
            <div class="error-message"></div>
          </div>
        </div>
        <div class="content-group">
          <label><font-awesome-icon :icon="['far', 'calendar-check']" class="icon" /> 시작일시</label>
          <div class="vertical-line"></div>
          <div class="input-container">
            <input type="date" id="nickName" v-model="projectData.startAt" placeholder="시작일시" />
            <div class="error-message"></div>
          </div>
        </div>
        <div class="content-group">
          <label><font-awesome-icon :icon="['far', 'calendar-check']" class="icon" /> 종료일시</label>
          <div class="vertical-line"></div>
          <div class="input-container">
            <input type="date" id="nickName" v-model="projectData.endAt" placeholder="종료일시" />
            <div class="error-message"></div>
          </div>
        </div>
        <div class="content-button">
          <round-button-item type="button" class="save-btn" :width="120" :height="30" :fontSize="14" @click="saveProject">저장</round-button-item>
        </div>

        <div class="underline"></div>

        <div class="content-group-area">
          <label><font-awesome-icon :icon="['fas', 'table-columns']" class="icon" /> 칸반 칼럼</label>
          <div class="vertical-line-area"></div>
          <!-- 동적으로 추가된 칸반 컬럼 리스트 -->
          <div class="kanban-list">
            <div v-for="(column, index) in kanbanColumns" :key="column.kanbanColumnId" class="kanban-item">
              <input v-model="column.kanbanColumnName" readonly />
              <button @click="removeColumn(column.kanbanColumnId, index)" class="remove-btn">
                <font-awesome-icon :icon="['far', 'square-minus']" />
              </button>
            </div>
          </div>
        </div>
        <div class="content-button">
          <input v-model="newColumn" placeholder="칸반 컬럼 이름" />
          <round-button-item type="button" class="save-btn" :width="120" :height="30" :fontSize="14" @click="addColumn">추가</round-button-item>
        </div>
        <!-- TODO 모든 컬럼 정보를 서버로 전송 버튼 -->
      </div>
      <div class="button-group">
        <round-button-item type="button" class="cancel-btn" :width="200" :height="40" :backgroundColor="'cancel'" @click="onCancelButton">취소</round-button-item>
      </div>
    </div>

    <CheckMessage :isVisible="isModalVisible" @close="closeModal" />
    <ConfirmAlert :isVisible="isWithdrawVisible" @close="closeWithdraw" message="탈퇴 되었습니다." />
  </div>
</template>

<script>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import {useKanbanColumnStore} from "@/stores/kanbanColumnStore";
import {useWebSocketStore} from "@/stores/webSocketStore";
import {useProjectStore} from "@/stores/projectStore";

export default {
  name: 'ManageProjectCompo',
  props: {
    projectId: {
      type: Number,
      required: false,
    }
  },
  setup(props) {
    const router = useRouter();
    const webSocketStore = useWebSocketStore();
    const kanbanColumnStore = useKanbanColumnStore();
    const projectStore = useProjectStore();

    // const projectName = route.query.projectName;

    // 프로젝트ID에 해당하는 데이터
    const projectData =  computed(() => projectStore.projectData);
    const kanbanColumns = computed(() => kanbanColumnStore.columns);

    const newColumn = ref(''); // 새로운 컬럼 이름
    // 새로운 컬럼 추가
    const addColumn = async () => {
      try {
        if (newColumn.value) {
          // 시퀀스 가져와서 +1 해서 마지막에 더해주기
          const currentMaxSeq = kanbanColumns.value.length > 0 ? Math.max(...kanbanColumns.value.map(col => col.columnSeq)) : 0;
          const newSeq = currentMaxSeq + 1;
          const columnData = {
            projectId: props.projectId,
            kanbanColumnId: null,
            kanbanColumnName: newColumn.value,
            columnSeq: newSeq,
          };
          await webSocketStore.sendAddColumnMessage({
            projectId: props.projectId,
            type: 'addColumn',
            columnData: columnData,
          });
          newColumn.value = ''; // 입력 필드 초기화
        }
      } catch (e) {
        console.error('Error call webSocket call :', e);
      }
    };
    // 컬럼 삭제
    const removeColumn = async (KanbanColumnId) => {
      try {
        await webSocketStore.sendDeleteColumnMessage({
          projectId: props.projectId,
          KanbanColumnId: KanbanColumnId,
          type: 'deleteColumn',
        });
      } catch (e) {
        console.error('Error call webSocket call :', e);
      }
    };
    // 프로젝트 저장 클릭
    const saveProject = async () => {
      const memberDtoMap = {};
      // 멤버 추가 기능 필요시 구현
      const projectForm = {
        projectId: props.projectId,
        projectName: projectData.value.title,
        projectDescription: projectData.value.projectDescription,
        startAt: projectData.value.startAt,
        endAt: projectData.value.endAt,
        MemberDtoMap: memberDtoMap,
        type: 'updateProject',
      };
      try {
        if (projectForm) {
          await webSocketStore.sendUpdateProjectMessage({
            projectId: props.projectId,
            projectForm: projectForm,
            type: 'updateProject',
          });
        }
      } catch (e) {
        console.error('Error call webSocket call :', e);
      }
    };

    const onCancelButton = () => {
      router.replace('/move-to-move/kanban');
    };

    // 컴포넌트 마운트 시 프로젝트 , 컬럼 데이터 서버에서 조회, 웹소켓 연결
    onMounted(() => {
      try {
        kanbanColumnStore.loadColumns(props.projectId);
        webSocketStore.connect(props.projectId);
        if (!projectData.value.projectDescription) {
          projectStore.loadProject(props.projectId);
        }
      } catch (e) {
        console.log('Error Database load: ', e);
      }
    });
    // 컴포넌트가 언마운트될 때 WebSocket 구독 해제
    onUnmounted(() => {
      webSocketStore.disconnect(props.projectId); // 프로젝트 ID에 대한 WebSocket 연결 해제
    });
    return {
      onCancelButton,
      newColumn,
      kanbanColumns,
      addColumn,
      removeColumn,
      saveProject,
      projectData,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: left;
}

.new-project-contains {
  margin-top: 20px;
  height: 850px;
  border: 1.5px solid #6b9e9b;
  border-radius: 10px;
  background: #ffffff;
}

.project-content {
  display: flex;
  margin-top: 20px;
  height: 100%;
  flex-direction: column;
  align-items: center;
}

.tabs {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background-color: #eee;
  cursor: pointer;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.tabs button.active {
  background-color: #6b9e9b;
  color: white;
}

.vertical-line,
.vertical-line-area {
  margin-right: 20px;
  border-radius: 20px;
  border-left: 2px solid #6b9e9b;
}

.vertical-line {
  height: 20px;
}

.vertical-line-area {
  margin-top: 2%;
  height: 90%;
}

.content-group,
.content-group-area {
  text-align: left;
  width: 500px;
  display: flex;
  margin-bottom: 20px;
}

.content-group {
  align-items: center;
}

.content-group label,
.content-group-area label {
  font-size: 16px;
  font-weight: bold;
  text-align: left;
  width: 30%;
}

.content-group-area label {
  margin-top: 2%;
}

.content-group input,
.content-group-area textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.content-group-area textarea {
  height: 200px;
}

.content-button {
  display: flex;
  justify-content: flex-end;
  width: 500px;
}

.content-button input {
  width: 220px;
  padding: 10px;
  height: 30px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.underline {
  width: 450px;
  margin: 30px;
  border-bottom: 2px solid #6b9e9b;
}

.input-container {
  width: 70%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.icon {
  margin-right: 10px;
}

.error-message {
  position: absolute;
  color: #d63f3f;
  font-size: 10px;
  top: 100%;
  left: 10px;
}

/* 칸반 리스트 */
.kanban-list {
  width: 70%;
  height: 230px;
  overflow-y: auto;
}

.kanban-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.kanban-item input {
  flex-grow: 1;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-btn {
  color: #d63f3f;
  font-size: 20px;
  padding: 5px;
}

/* 버튼 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.content-group-area {
  margin-bottom: 20px;
}
</style>
