// stores/webSocketStore.js
import { reactive } from 'vue';
import { defineStore } from 'pinia';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useKanbanColumnStore } from '@/stores/kanbanColumnStore';
import { useKanbanCardStore } from '@/stores/kanbanCardStore';
import { useProjectStore } from '@/stores/projectStore';

export const useWebSocketStore = defineStore('webSocket', () => {
  const projectConnections = reactive({}); // 프로젝트별 stompClient 저장
  const connectionStatus = reactive({}); // 프로젝트별 연결 상태 저장
  const receivedMessages = reactive({}); // 수신된 메시지 저장
  const kanbanColumnStore = useKanbanColumnStore();
  const kanbanCardsStore = useKanbanCardStore();
  const projectStore = useProjectStore();
  const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

  // 특정 프로젝트에 대해 WebSocket 연결 설정 및 구독 설정
  function connect(projectId) {
    if (projectConnections[projectId]) {
      console.log(`Already connected to project ${projectId}`);
      return; // 이미 연결된 경우 무시
    }

    const socket = new SockJS(`${API_BASE_URL}/ws`); // 배포 시 URL 변경
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        connectionStatus[projectId] = true;
        // 콘솔에 웹소켓 연결 확인하려면 connect 매개변수에 frame 추가해서 로그 찍으세요.
        // console.log(`Connected to project ${projectId}: ` + frame);

        client.subscribe(`/topic/project/${projectId}`, (message) => {
          handleIncomingMessage(projectId, JSON.parse(message.body));
        });

        projectConnections[projectId] = client;
      },
      (error) => {
        connectionStatus[projectId] = false;
        console.error('WebSocket connection error for project ' + projectId + ':', error);
      },
    );
  }

  // 프로젝트별 모든 WebSocket 연결 해제
  function disconnectAll() {
    Object.keys(projectConnections).forEach((projectId) => {
      disconnect(projectId);
    });
  }

  // 특정 프로젝트에 대해 WebSocket 연결 해제
  function disconnect(projectId) {
    const client = projectConnections[projectId];
    if (client) {
      client.disconnect(() => {
        delete projectConnections[projectId];
        connectionStatus[projectId] = false;
        console.log(`WebSocket disconnected for project ${projectId}`);
      });
    }
  }

  // 메시지 핸들러 정의 ( 이 후 웹소켓 기능 추가 시  여기에 함수 추가하면됩니다. 함수 이름이 메시지 타입과 동일해야합니다. )
  const messageHandlers = {
    async columnMove(projectId) {
      try {
        await kanbanColumnStore.loadColumns(projectId);
        await kanbanCardsStore.loadAllCards(projectId);
        // console.log(`Columns reloaded successfully. type : ${message.type}`);
      } catch (error) {
        console.error('Failed to reload columns:', error);
      }
    },
    async cardMoveWithinColumn(projectId) {
      try {
        await kanbanCardsStore.loadAllCards(projectId);
        // console.log(`Cards reloaded successfully after moving within column. type: ${message.type}`);
      } catch (error) {
        console.error('Failed to reload cards:', error);
      }
    },
    async cardMoveBetweenColumn(projectId) {
      try {
        await kanbanCardsStore.loadAllCards(projectId);
        // console.log(`Cards reloaded successfully after moving within column. type: ${message.type}`);
      } catch (e) {
        console.error(`Failed to reloadCards:`, e);
      }
    },
    async addColumn(projectId) {
      try {
        await kanbanColumnStore.loadColumns(projectId);
      } catch (e) {
        console.error('Failed to reload columns:', e);
      }
    },
    // 프로젝트 관리 - 컬럼 삭제
    async deleteColumn(projectId) {
      try {
        await kanbanColumnStore.loadColumns(projectId);
      } catch (e) {
        console.error('Failed to reload columns: ', e);
      }
    },
    // 프로젝트 관리 - 프로젝트 업데이트
    async updateProject(projectId) {
      try {
        await projectStore.loadProject(projectId);
      } catch (e) {
        console.error('Failed to reload project:', e);
      }
    },
    // 칸반 카드 생성
    async addCard(projectId) {
      try {
        await kanbanCardsStore.loadAllCards(projectId);
      } catch (e) {
        console.error('Failed to reload columns: ', e);
      }
    },
    // 칸반 카드 삭제
    async deleteCard(projectId) {
      try {
        await kanbanCardsStore.loadAllCards(projectId);
      } catch (e) {
        console.error('Failed to reload columns: ', e);
      }
    },
    // 칸반카드 정보 변경
    async updateCardInfo(projectId) {
      try {
        await kanbanCardsStore.loadAllCards(projectId);
      } catch (e) {
        console.error('Failed to reload columns: ', e);
      }
    },

    // 새로운 메시지 유형 핸들러 추가 가능
    async anotherMessageTypeHandler(projectId) {
      console.error(`프로젝트${projectId}에서 Processing another message type. type: 등록되지 않은 요청입니다.`);
    },
  };

  // 수신된 메시지 처리 및 저장 - 여기서 데이터 처리합니다.
  async function handleIncomingMessage(projectId, message) {
    if (!receivedMessages[projectId]) {
      receivedMessages[projectId] = [];
    }
    console.log(`>>>>>>>>>>>>>>>>>webSocket receive message : ${message}, projectId: ${projectId}`);
    receivedMessages[projectId].push(message);

    // 메시지 핸들러 호출
    const handler = messageHandlers[message.type];
    if (handler) {
      await handler(projectId); // 핸들러 함수 호출
    } else {
      console.warn(`No handler defined for message type: ${message.type}`);
    }
  }
  /*
   *   프론트에서 웹소켓에 알리는 함수 시작
   * */
  // 컬럼 이동 시 웹소켓에 알리는 함수
  async function sendMessageToProject(message) {
    const client = projectConnections[message.projectId]; // 해당 프로젝트의 stompClient 가져오기
    const isConnected = connectionStatus[message.projectId]; // 해당 프로젝트의 연결 상태 확인

    // db에 업데이트 하기  컬럼 변경사항
    try {
      await kanbanColumnStore.moveColumn(message.columnId, message.projectId, message.newIndex);
    } catch (e) {
      console.error('Error while updating database before sending WebSocket message:', e);
    }
    if (client && isConnected) {
      try {
        client.send(
          `/app/project/${message.projectId}/column-move`, // 서버의 MessageMapping 경로와 일치해야 함
          {},
          JSON.stringify(message),
        );
        // console.log('Message sent successfully:', message);
      } catch (error) {
        console.error('Error sending message to server:', error); // 전송 중 에러를 포착
      }
    } else {
      console.error('WebSocket 연결이 끊켰습니다. 연결 상태:', isConnected, 'stompClient:', client);
    }
  }
  // 같은 컬럼 내 카드 이동 함수
  async function sendCardMoveWithinColumnMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];

    try {
      // DB에 이동 내역 저장하기
      await kanbanCardsStore.moveCardWithinColumn(message.cardId, message.columnId, message.newCardSeq);
    } catch (e) {
      console.error('Error while updating database before sending WebSocket message:', e);
    }
    // 웹소켓 메시지 보내기
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/card-move-within-column`, {}, JSON.stringify(message));
        // console.log('Card move message sent successfully:', message);
      } catch (error) {
        console.error('Error sending card move message to server:', error);
      }
    } else {
      console.error('WebSocket 연결이 끊켰습니다. 연결 상태:', isConnected, 'stompClient:', client);
    }
  }
  // 카드 이동 - TO Outher Column
  async function sendCardBetweenColumnMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];
    try {
      // DB에 이동 내역 저장하기
      await kanbanCardsStore.moveCardToAnotherColumn(message.cardId, message.columnId, message.newCardSeq);
    } catch (e) {
      console.error(`Error while updating database before sending WebSocket message: `, e);
    }
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/card-move-between-column`, {}, JSON.stringify(message));
        console.log('Card move message sent successfully:', message);
      } catch (e) {
        console.error(`Error sending card move Between Column to server" `, e);
      }
      // console.log('Card move message sent successfully:', message);
    } else {
      console.error(`WebSocket 연결이 끊겼습니다. 연결 상태: `, isConnected, `stompClient:`, client);
    }
  }
  // 컬럼 추가 - projectManage 콤퍼넌트 요청
  async function sendAddColumnMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];
    try {
      await kanbanColumnStore.addColumn(message.columnData);
      message.type = 'addColumn';
    } catch (e) {
      console.error(`Error while updating database before sending WebSocket message: `, e);
    }
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/addColumn`, {}, JSON.stringify(message));
        console.log('Card add message sent successfully:', message);
      } catch (e) {
        console.error('Error sending card add to Server', e);
      }
    }
  }
  // 컬럼 삭제 - projectManage .컴포넌트 요청
  async function sendDeleteColumnMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];

    try {
      await kanbanColumnStore.removeColumn(message.KanbanColumnId);
    } catch (e) {
      console.error(`Error while updating database before sending WebSocket message: `, e);
    }
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/deleteColumn`, {}, JSON.stringify(message));
        console.log('Card delete message sent successfully:', message);
      } catch (e) {
        console.error('Error sending card delete to Server', e);
      }
    }
  }
  // 프로젝트 update
  async function sendUpdateProjectMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];
    try {
      await projectStore.updateProject(message.projectForm);
      // message.projectForm.type = message.type;
    } catch (e) {
      console.error('Error While updating database before sending WebSocket message:', e);
    }
    // 웹소켓
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/update-project`, {}, JSON.stringify(message));
        console.log('Card delete message sent successfully:', message);
      } catch (e) {
        // 재연결 시도
        console.error('Error sending card update Project to Server', e);
        connect(message.projectId);
        console.log(`웹소켓 재연결`);
      }
    }
  }
  // 칸반카드 생성
  async function sendAddKanbanCardMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];
    // 웹소켓
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/add-card`, {}, JSON.stringify(message));
        console.log('Card add card message sent successfully:', message);
      } catch (e) {
        // 재연결 시도
        console.error('Error sending card add Project to Server', e);
        connect(message.projectId);
        console.log(`웹소켓 재연결`);
      }
    }
  }
  //칸반카드 삭제
  async function sendDeleteKanbanCardMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];
    // 웹소켓
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/delete-card`, {}, JSON.stringify(message));
        console.log('Card add card message sent successfully:', message);
      } catch (e) {
        // 재연결 시도
        console.error('Error sending card add Project to Server', e);
        connect(message.projectId);
        console.log(`웹소켓 재연결`);
      }
    }
  }

  // 칸반카드 정보 변경
  async function sendUpdateCardInfoMessage(message) {
    const client = projectConnections[message.projectId];
    const isConnected = connectionStatus[message.projectId];
    // 웹소켓
    if (client && isConnected) {
      try {
        client.send(`/app/project/${message.projectId}/update-info`, {}, JSON.stringify(message));
        console.log('Card update card title message sent successfully:', message);
      } catch (e) {
        // 재연결 시도
        console.error('Error sending card add Project to Server', e);
        connect(message.projectId);
        console.log(`웹소켓 재연결`);
      }
    }
  }

  return {
    projectConnections,
    connectionStatus,
    receivedMessages,
    disconnectAll,
    handleIncomingMessage,
    connect,
    disconnect,
    sendMessageToProject,
    sendCardMoveWithinColumnMessage,
    sendCardBetweenColumnMessage,
    sendAddColumnMessage,
    sendDeleteColumnMessage,
    sendUpdateProjectMessage,
    sendAddKanbanCardMessage,
    sendDeleteKanbanCardMessage,
    sendUpdateCardInfoMessage,
  };
});
