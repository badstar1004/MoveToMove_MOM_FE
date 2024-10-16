<template>
  <div class="mypage">
    <h1>칸반보드</h1>
    <div class="sub-content">
      <aside class="sidebar">
        <v-expansion-panels v-model="panel" multiple>
          <v-expansion-panel class="folder-contains panel-flex">
            <!-- 여기서 panel-flex 클래스로 flex 설정 -->
            <v-expansion-panel-title class="folder-title">프로젝트</v-expansion-panel-title>
            <v-expansion-panel-text class="panel-text">
              <div class="tree-container">
                <!-- 트리뷰에 draggable을 적용 -->
                <draggable v-model="folderStore.folderData" :move="checkMove" group="folders" item-key="id" @end="onFolderDragEnd">
                  <template #item="{ element }">
                    <v-treeview
                      :items="[element]"
                      activatable
                      open-on-click
                      item-key="id"
                      item-text="title"
                      item-children="children"
                      v-model="open"
                      transition
                      @click:open="folderClick"
                    >
                      <!-- 폴더 아이콘 표시  -->
                      <template v-slot:prepend="{ item }">
                        <div class="folder-icon" @click="onNodeClick(item)">
                          <v-icon :color="item.children ? '#ff5722' : '#2196f3'" :class="{ 'selected-node': item.id === selectedNodeId }">{{
                            item.children ? 'mdi-folder' : 'mdi-clipboard-text'
                          }}</v-icon>
                        </div>
                      </template>

                      <!-- 폴더일 때만 수정 및 삭제 아이콘 추가 -->
                      <template v-slot:append="{ item }">
                        <template v-if="item.children">
                          <font-awesome-icon icon="pencil" class="icon-hover" @click="editFolder(item)" />
                          <font-awesome-icon icon="trash" class="icon-hover" @click="deleteFolder(item)" />
                        </template>
                      </template>
                    </v-treeview>
                  </template>
                </draggable>

                <!-- 폴더 생성 시 보여줄 input 박스 -->
                <template v-if="creatingFolder">
                  <div class="new-folder">
                    <v-icon class="mdi mdi-folder" :color="'#ff5722'" width="18" height="18" style="margin-right: 10px"></v-icon>
                    <input
                      type="text"
                      v-model="newFolderName"
                      @keydown.enter="addNewFolder"
                      @keydown.esc="cancelNewFolder"
                      @blur="cancelNewFolder"
                      placeholder="폴더 이름을 입력하세요"
                    />
                  </div>
                </template>
              </div>

              <!-- 노드 추가를 위한 버튼 -->
              <div class="add-buttons">
                <round-button-item :width="100" :height="30" :borderRadius="5" :fontSize="11" :fontColor="'#112f4e'" backgroundColor="etc" @click="newFolder"
                  >폴더 생성 +</round-button-item
                >
                <round-button-item :width="100" :height="30" :borderRadius="5" :fontSize="11" @click="newProjectPage">프로젝트 생성 +</round-button-item>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- 참여자 컴포넌트 -->
        <project-member-compo v-if="projectId" :projectId="projectId" class="member"></project-member-compo>
      </aside>
      <main class="main-content">
        <!-- 데이터 로드가 완료된 후 렌더링 -->
        <div v-if="isDataLoaded && columns.length > 0">
          <div class="project-title">
            <div class="project-name">
              <label>{{ testProjectName }}</label>
            </div>
            <font-awesome-icon :icon="['fas', 'ellipsis']" ref="menuToggle" @click="toggleMenu" class="ellipsis" />
            <!-- :isProjectLeader="isProjectLeader" -->
            <KebabProjectMenu
              v-if="showMenu !== null"
              :showMenu="showMenu"
              @closeMenu="closeMenu"
              @projectDeleted="handleProjectDeleted"
              :isProjectLeader="isProjectLeader"
              :projectId="projectId"
              :projectName="projectName"
            />
          </div>
          <div class="project-content">
            <draggable
              v-model="columns"
              group="columns"
              @end="onColumnDragEnd"
              class="columns-container"
              ghost-class="dragging"
              drag-class="drag-active"
              itemKey="id"
              :disabled="isCardOpen"
            >
              <template #item="{ element: col }">
                <div class="column kanban-column" :key="col.kanbanColumnId" :data-column-id="col.kanbanColumnId">
                  <kanban-column
                    :id="col.kanbanColumnId"
                    :title="col.kanbanColumnName"
                    :columnId="col.kanbanColumnId"
                    :isCardOpen="isCardOpen"
                    :projectId="projectId"
                    @card-move="onCardMove"
                    @open-card="openCard"
                    @close-card="closeCard"
                    @delete-card="deleteCard"
                  />
                </div>
              </template>
            </draggable>
          </div>
        </div>
        <div v-else></div>
      </main>
    </div>
  </div>
</template>

<script>
import { useFolderStore } from '@/stores/folderStrore';
import { useKanbanCardStore } from '@/stores/kanbanCardStore';
import { useKanbanColumnStore } from '@/stores/kanbanColumnStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useProjectStore } from '@/stores/projectStore';
import { useWebSocketStore } from '@/stores/webSocketStore';

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'; // Vue의 ref를 가져옵니다.

import { useRouter } from 'vue-router';
import { VTreeview } from 'vuetify/labs/VTreeview';

import draggable from 'vuedraggable'; // VueDraggableNext를 import

import KebabProjectMenu from '../common/KebabProjectMenu.vue';
import ProjectMemberCompo from '../common/ProjectMemberCompo.vue';
import KanbanColumn from './KanbanColumnCompo.vue';
// import { useWebSocketStore } from '@/stores/webSocketStore';

export default {
  name: 'KanbanBoard', // 컴포넌트 이름 정의
  components: {
    KanbanColumn,
    ProjectMemberCompo,
    KebabProjectMenu,
    draggable, // 드래그 앤 드랍 컴포넌트 등록
    VTreeview,
  },
  setup() {
    const router = useRouter();

    // ref를 사용하여 상태를 정의합니다.
    const panel = ref([0]); // 첫 번째 패널을 기본적으로 열려 있게 설정
    const navigationStore = useNavigationStore(); // 메뉴 클릭 Pinia store 사용
    const kanbanColumnStore = useKanbanColumnStore(); // 칸반 컬럼 Pinia store 사용
    const kanbanCardStore = useKanbanCardStore(); // 칸반 카드 Pinia store 사용
    const folderStore = useFolderStore(); // 폴더 Pinia store 가져오기
    const projectStore = useProjectStore(); // 프로젝트 Pinia 스토어 인스턴스 생성
    const webSocketStore = useWebSocketStore();

    const columns = ref([]);
    const cards = ref([]);
    // Pinia의 컬럼 상태를 computed로 가져오기
    const storeColumns = computed(() => kanbanColumnStore.columns);

    // watch를 사용하여 Pinia 상태가 변경될 때 반영
    watch(
      storeColumns,
      (newColumns) => {
        columns.value = newColumns; // 컴포넌트의 columns 상태에 최신 값 할당
      },
      { immediate: true },
    ); // 초기 로딩 시에도 반영

    const open = ref([]);
    const active = ref([]);

    // folderData 가져오기
    const folderData = ref([]);

    // 프로젝트 아이디 변수
    const projectId = ref(0);

    // 프로젝트 리더 유무 변수
    // isProjectLeader를 computed로 선언하여 반응형으로 동작하도록 설정
    const isProjectLeader = computed(() => {
      return projectStore.projectData.projectLeaderYN;
    });

    // 프로젝트 명
    const projectName = ref('');
    const testProjectName = computed(() => projectStore.projectData.title);
    // 폴더인지 프로젝트인지 구분자
    const folderProjectType = ref('');

    // 컬럼 칸반 데이터 조회 v-if(66줄)
    const isDataLoaded = ref(false);

    // 클릭된 노드를 추적할 상태
    const selectedNodeId = ref(null);

    // 화면 열렸을 때 onMounted
    onMounted(async () => {
      try {
        // 폴더 데이터 로드
        await folderStore.fetchFolders(); // 데이터를 Pinia에 저장
        folderData.value = folderStore.folderData; // Pinia store의 folderData를 ref에 저장

        // 프로젝트 생성 화면에서 전달된 projectId (쿼리 파라미터에서 가져오기)
        const queriedProjectId = router.currentRoute.value.query.projectId || null;

        // console.log('쿼리 파라미터:', queriedProjectId);

        // console.log('ddddd: ', folderData.value);

        if (queriedProjectId && folderData.value) {
          console.log('들어옴');

          const selectedProject = folderData.value
            .filter((item) => item.type === 'project') // 프로젝트만 필터링
            .find((project) => project.id === parseInt(queriedProjectId)); // projectId와 일치하는 프로젝트 찾기

          console.log('선택된 프로젝트 :', selectedProject);

          if (selectedProject) {
            onNodeClick(selectedProject);
          }
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생', error);
      }
    });

    // 컴포넌트가 언마운트될 때 WebSocket 구독 해제
    onUnmounted(() => {
      webSocketStore.disconnect(projectId); // 프로젝트 ID에 대한 WebSocket 연결 해제
    });

    // checkMove 함수 정의
    const checkMove = (evt) => {
      console.log(evt.dragged); // 드래그 중인 요소
      console.log(evt.draggedContext); // 드래그 중인 요소의 컨텍스트 정보
      console.log(evt.related); // 드래그된 요소가 드롭될 수 있는 관련 요소
      console.log(evt.relatedContext); // 드래그된 요소가 드롭될 컨텍스트 정보
      // 드래그 가능 여부를 확인하는 로직
      // 예: 드래그하려는 노드가 특정 조건을 만족하는지 확인
      return true; // 모든 드래그를 허용하는 기본 설정
    };

    // 폴더 클릭 시
    const folderClick = () => {
      projectId.value = null;
    };

    const folderSelect = () => {
      console.log('프로젝트 선택');
    };

    // 폴더구조에서 프로젝트 아이콘 클릭 시
    const onNodeClick = async (node) => {
      // console.log('선택된 노드', node);

      // 클릭된 항목의 ID를 저장
      selectedNodeId.value = node.id;

      // 파일인지 확인 (children이 없으면 파일)
      if (!node.children || node.children.length === 0) {
        // console.log('파일(프로젝트) 정보:', node);

        // console.log('node.id: ', node.id);

        projectId.value = node.id;
        projectName.value = node.title;
        // isProjectLeader.value = node.projectLeaderYN;
        folderProjectType.value = node.type;

        // console.log('type: ', isProjectLeader.value);
        // Pinia 스토어에 프로젝트 데이터 객체로 저장
        projectStore.setProjectData(node);

        try {
          // 프로젝트 클릭 시 해당 데이터 서버 요청 후 화면 렌더링
          if (folderProjectType.value === 'project') {
            // 컬럼과 카드 데이터 로드
            await kanbanColumnStore.loadColumns(projectId.value);
            await kanbanCardStore.loadAllCards(projectId.value);
            columns.value = kanbanColumnStore.columns;
            cards.value = kanbanCardStore.cards;

            isDataLoaded.value = columns.value.length > 0 && cards.value.length >= 0;

            await nextTick();
          }
        } catch (e) {
          console.error('파일(프로젝트) 정보 로드 실패:', e);
          isDataLoaded.value = false;
        }

        webSocketStore.connect(projectId.value);
      }
    };

    // 프로젝트 나가기
    const handleProjectDeleted = () => {
      console.log('프로젝트 나가기함');

      // 폴더 스토어에서 해당 프로젝트 삭제
      folderStore.deleteByIdAndType(projectId.value, folderProjectType.value);

      // 프로젝트 관련 상태 초기화
      projectId.value = null;
      projectName.value = '';
      isProjectLeader.value = false;
      folderProjectType.value = '';
      isDataLoaded.value = false;
      columns.value = [];
      cards.value = [];
      showMenu.value = false;
    };

    /* 폴더 부분 */
    // 폴더 드래그 앤 드랍
    const onFolderDragEnd = (colId) => {
      console.log('드래그 종료', colId);
      // 드래그 종료 후 상태 업데이트 또는 API 호출 등 추가 처리
    };

    // 폴더 수정 함수
    const editFolder = (item) => {
      console.log('수정할 폴더:', item);
      // 폴더명을 변경하는 로직 구현
    };

    // 폴더 삭제 함수
    const deleteFolder = (item) => {
      console.log('삭제할 폴더:', item);
      folderStore.folderData = folderStore.folderData.filter((folder) => folder.id !== item.id);
    };

    // 프로젝트 생성
    const newProjectPage = () => {
      router.replace('/move-to-move/new-project');
    };

    //칸반 카드 오픈
    const openKanbanCard = (idx) => {
      console.log(`칸반카드ID: ${idx}`);
      navigationStore.setActiveItem('mypage');
      router.push('kanbanCard');
    };

    /* 프로젝트 케밥 메뉴 */
    // ref를 사용하여 상태를 정의합니다.
    const showMenu = ref(false);

    // 케밥 메뉴 토글 메소드
    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const closeMenu = () => {
      showMenu.value = false;
    };

    /* 폴더 생성 */
    // 새 폴더 생성 상태 및 이름을 저장할 ref
    const creatingFolder = ref(false);
    const newFolderName = ref('');

    // 폴더 생성 취소
    const cancelNewFolder = () => {
      creatingFolder.value = false;
      newFolderName.value = '';
    };

    // 폴더 생성 완료 시 데이터에 추가
    const addNewFolder = async () => {
      if (newFolderName.value.trim()) {
        // 바디 부분
        const newFolder = {
          folderId: null,
          folderName: newFolderName.value,
        };

        try {
          // 폴더 생성 비동기
          await folderStore.addNewFolder(newFolder);
          console.log('폴더가 생성되었습니다.');
        } catch (e) {
          console.error('폴더 생성 실패:', e);
        }
      }
      cancelNewFolder();
    };

    // 새 폴더 생성 버튼 클릭 시 호출
    const newFolder = () => {
      creatingFolder.value = true;
      newFolderName.value = ''; // 폴더명 초기화
      console.log(creatingFolder.value);

      nextTick(() => {
        const folderContainer = document.querySelector('.tree-container');
        if (folderContainer) {
          folderContainer.scrollTo({
            top: folderContainer.scrollHeight, // 맨 아래로 이동
            behavior: 'smooth', // 부드럽게 스크롤
          });
          console.log('부드러운 스크롤 이동 완료');
        }
      });
    };

    // 칸반 카드 이동 시
    const onCardMove = async (event) => {
      const { cardId, newCardSeq, from, to, toColumnId, columnId } = event; // `oldIndex`, `newIndex` 제거
      if (isMoveBetweenColumns(from, to)) {
        await handleMoveBetweenColumns(cardId, toColumnId, newCardSeq);
      } else if (isMoveWithinColumn(from, to)) {
        await handleMoveWithinColumn(cardId, columnId, newCardSeq);
      } else {
        console.warn('Unhandled card move event:', event);
      }
    };
    // 카드 이동 시 컬럼과 변경되는 컬럼이 같은지 확인하는 함수
    const isMoveBetweenColumns = (from, to) => {
      return from && to && from !== to;
    };

    // 다른 컬럼으로 카드가 이동 했을 경우 실행되는 함수
    const handleMoveBetweenColumns = async (cardId, toColumnId, newCardSeq) => {
      try {
        if (newCardSeq <= 0) {
          // newCardSeq가 유효한지 확인
          console.error('유효하지 않은 시퀀스 값입니다.');
          return;
        }
        // WebSocket을 통해 다른 사용자에게 카드 이동 정보 전송
        await webSocketStore.sendCardBetweenColumnMessage({
          projectId: projectId.value,
          type: `cardMoveBetweenColumn`,
          cardId: cardId,
          columnId: toColumnId,
          newCardSeq: newCardSeq,
        });
        // 카드 데이터를 최신화
        // await kanbanCardStore.loadAllCards(projectId.value);
      } catch (e) {
        console.error(e);
      }
    };

    // 같은 컬럼 내 카드 이동 확인 함수
    const isMoveWithinColumn = (from, to) => {
      return from === to;
    };
    // 같은 컬럼 내에서 카드가 이동하는 경우 실행되는 함수
    const handleMoveWithinColumn = async (cardId, columnId, newCardSeq) => {
      try {
        if (newCardSeq <= 0) {
          // newCardSeq가 유효한지 확인
          console.error('유효하지 않은 시퀀스 값입니다.');
          return;
        }
        // WebSocket을 통해 다른 사용자에게 카드 이동 정보 전송
        await webSocketStore.sendCardMoveWithinColumnMessage({
          projectId: projectId.value,
          type: 'cardMoveWithinColumn', // 메시지 유형
          cardId: cardId,
          columnId: columnId,
          newCardSeq: newCardSeq,
        });
        // 카드 데이터를 최신화
        // await kanbanCardStore.loadAllCards(projectId.value);
      } catch (error) {
        console.error('Error moving card:', error);
      }
    };

    // 컬럼 드래그 앤 드롭 핸들러
    const onColumnDragEnd = async ({ oldIndex, newIndex }) => {
      if (oldIndex !== newIndex) {
        const movedColumn = columns.value[newIndex]; // 드래그 후의 새로운 위치의 컬럼
        const kanbanColumnId = movedColumn.kanbanColumnId; // 이동한 컬럼의 ID
        // const project = projectId.value; // 현재 프로젝트의 ID
        const newServerIndex = newIndex + 1;
        // console.log(`Moved Column ID: ${kanbanColumnId}, New Index (Server): ${newServerIndex}, Project ID: ${project}`);
        try {
          // 서버에 컬럼 이동 요청 전송
          // await kanbanColumnStore.moveColumn(kanbanColumnId, project, newServerIndex);
          // WebSocket을 통해 다른 사용자에게 컬럼 이동을 알림
          await webSocketStore.sendMessageToProject({
            projectId: projectId.value,
            type: 'columnMove',
            columnId: kanbanColumnId,
            newIndex: newServerIndex,
          });
          // 상태 최신화
          await kanbanColumnStore.loadColumns(projectId.value);
          await kanbanCardStore.loadAllCards(projectId.value);
        } catch (e) {
          console.error('Error while moving column:', e);
        }
      }
    };

    // 카드 열림 확인
    const isCardOpen = ref(false);

    // 카드가 열릴 때 호출
    const openCard = () => {
      isCardOpen.value = true;
    };

    // 카드가 닫힐 때 호출
    const closeCard = () => {
      isCardOpen.value = false;
    };

    // 칸바 카드 삭제 (재조회 후 카드 셋팅)
    const deleteCard = (projectId) => {
      kanbanCardStore.loadAllCards(projectId);
      cards.value = kanbanCardStore.cards;
    };

    return {
      panel,
      folderStore, // Pinia 상태를 바로 사용
      columns, // 칸반 컬럼 데이터
      folderClick,
      folderSelect,
      editFolder,
      deleteFolder,
      checkMove,
      onNodeClick, // 클릭 이벤트 처리 함수
      selectedNodeId, // 클릭된 노드를 추적하는 상태
      open,
      active,
      onFolderDragEnd,
      openKanbanCard,
      newProjectPage,
      projectId,
      isProjectLeader,
      projectName,
      showMenu,
      toggleMenu,
      closeMenu,
      newFolderName,
      creatingFolder,
      newFolder,
      cancelNewFolder,
      addNewFolder,
      onColumnDragEnd, // 드래그 앤 드랍
      cards,
      onCardMove,
      isCardOpen,
      openCard,
      closeCard,
      isDataLoaded,
      handleProjectDeleted, // 프로젝트 나가기
      deleteCard,
      testProjectName,
    };
  },
};
</script>

<style scoped>
/* MyPageCompo 스타일 */
.mypage {
  width: 100%;
  background-color: #f0f8ff;
  border-radius: 8px;
  height: 100%; /* 부모 컨테이너의 고정된 높이를 픽셀 값으로 설정 */
  display: flex;
  flex-direction: column; /* 칸반보드 제목과 컨텐츠를 세로로 배치 */
}

h1 {
  font-size: 32px;
  text-align: left;
  margin: 0;
}

/* sub-content를 플렉스 컨테이너로 사용하여 좌우 레이아웃을 설정합니다. */
.sub-content {
  display: flex; /* 플렉스 박스를 사용하여 좌우 레이아웃을 설정 */
  gap: 10px; /* 사이드바와 메인 컨텐츠 사이의 간격 설정 */
  margin-top: 20px;
  width: 100%;
  flex-grow: 1; /* sub-content가 남은 공간을 차지하도록 설정 */
  /* height: calc(100% - 20px); 패딩과 상단 여백을 고려한 높이 설정 */
  height: 870px;
}

/* 사이드바 스타일 */
.sidebar {
  width: 300px; /* 사이드바의 고정된 너비 설정 */
  background-color: #ffffff; /* 연한 배경색 */
  border-radius: 10px;
  border: 1.5px solid #6b9e9b;
  height: 98%; /* 부모 폼 높이에 맞게 100%로 설정 */
  padding: 5px;
}

.folder-contains {
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 패널 전체를 flex로 처리하여 상단과 하단을 분리 */
.panel-flex {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-text {
  flex-grow: 1;
  padding-top: 0; /* 상단 패딩을 없앰 */
  margin-top: 0; /* 상단 마진을 없앰 */
}

.tree-container {
  max-height: 320px; /* 원하는 높이 설정 */
  overflow-y: auto; /* 세로 스크롤 활성화 */
  margin-top: 0; /* 트리 컨테이너에 상단 마진을 없앰 */
  padding-top: 0; /* 트리 컨테이너의 상단 패딩을 없앰 */
  scroll-behavior: smooth; /* 부드러운 스크롤 적용 */
}

/* 트리뷰의 인덴트를 줄이기 위한 스타일 */
:deep(.v-treeview-node__content) {
  padding-left: 3px !important; /* 기본 인덴트를 줄임 */
}

.add-buttons {
  display: flex;
  justify-content: center; /* 버튼들을 수평으로 가운데 정렬 */
  gap: 10px; /* 버튼들 사이 간격 */
  margin-top: 20px; /* 트리와 버튼 사이에 여백 추가 */
  margin-bottom: 20px; /* 하단 여백 추가 */
}

.folder-title {
  font-weight: bold;
  font-size: 15px;
}

/* 메인 컨텐츠 스타일 */
.main-content {
  width: 800px;
  flex-grow: 1; /* 메인 컨텐츠가 나머지 공간을 채우도록 설정 */
  background-color: #ffffff; /* 흰색 배경색 */
  border-radius: 10px;
  border: 1.5px solid #6b9e9b;
  height: 98%; /* 부모 폼 높이에 맞게 100%로 설정 */
  padding: 5px;
}

.project-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  font-weight: bold;
  height: 50px;
  /* border-bottom: 1.5px solid #6b9e9b; */
  border-radius: 10px;
  padding: 0 20px;
  margin-top: 5px;
}

.project-name {
  display: inline-block; /* div의 너비가 label의 콘텐츠 길이에 맞게 변경됨 */
  border-bottom: 5px solid;
  border-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="5" viewBox="0 0 100 5"><path fill="none" stroke="%23FFA07A" stroke-width="2" d="M0 5 Q 25 0, 50 5 T 100 5"></path></svg>')
    30 round;
  height: 48px;
}

.project-name label {
  font-size: 35px;
}

.ellipsis {
  cursor: pointer;
}

.project-content {
  display: flex;
  /* overflow-y: auto; 넘치는 경우 가로 스크롤 생성 */
  margin-top: 10px;
  height: 100%;
}

.column {
  flex: 0 0 32.5%; /* 고정된 크기로 각 컬럼을 배치 */
  height: 100%;
  margin-bottom: 3px;
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  border: 1px solid #6b9e9b;
}

/* 드래그 중일 때 컬럼의 투명도를 조절하는 스타일 */
.dragging {
  opacity: 0.5; /* 원래 위치에 남아 있는 요소의 투명도 */
}

/* 실제로 드래그 중인 컬럼의 스타일 */
.drag-active {
  opacity: 100%; /* 드래그 중인 컬럼의 투명도를 80%로 설정 */
  transform: scale(1.05); /* 드래그 중인 컬럼을 살짝 확대 */
  border: 2px solid #ff3b3b; /* 드래그 중인 컬럼에 강조된 테두리 적용 */
}

.columns-container {
  display: flex;
  gap: 10px; /* 컬럼 간 간격 유지 */
  width: 100%;
  height: 100%;
  padding: 0;
  overflow-x: auto; /* 넘치는 경우 가로 스크롤 활성화 */
}

/* Deep Selector를 사용하여 Vue3Tree의 내부 스타일을 덮어씁니다. */
:deep(.custom-node-class) {
  margin: 0px;
  padding: 0px;
  font-weight: bold;
  font-size: 14px;
  color: #000;
}

.member {
  height: 390px;
  margin-bottom: 3px;
}

.new-folder {
  display: flex;
  align-items: center;
  gap: 5px;
}

.new-folder input {
  border: 1px solid #ccc;
  padding: 4px;
  border-radius: 4px;
  width: 180px;
  height: 35px;
  font-size: 16px;
  padding: 5px;
}

/* 수정, 삭제 아이콘 hover 시 색상 및 크기 변화 */
.icon-hover {
  font-size: 12px; /* 아이콘 크기 줄이기 */
  margin-left: 8px;
  color: gray;
  opacity: 0.6; /* 기본 투명도 설정 */
  transition: color 0.3s, transform 0.3s, opacity 0.3s;
  cursor: pointer;
}

.icon-hover:hover {
  color: #2196f3; /* hover 시 색상 변경 */
  transform: scale(1.2); /* hover 시 크기 약간 증가 */
  opacity: 1; /* hover 시 투명도 제거 */
}

.selected-node {
  color: #4caf50 !important; /* 클릭된 노드의 색상 변경 */
}

.folder-icon {
  width: 60px;
}
</style>
