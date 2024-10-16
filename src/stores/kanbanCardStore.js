import axiosInstance from '@/api/axiosInstance';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKanbanCardStore = defineStore('kanbanCard', () => {
  const cards = ref([]);

  const loadAllCards = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/kanban-cards`);

      // response.data null일 경우 바로 리턴
      if (!Array.isArray(response.data)) {
        console.error('서버로 받는 응답 데이터가 없습니다.');
        cards.value = [];
        return;
      }

      // 응답 데이터를 올바르게 매핑하여 상태로 저장
      cards.value = response.data.map((item) => {
        const projectCard = item.projectInCardDto; // 카드의 세부 정보를 포함한 객체
        const members = item.cardMemberList; // 멤버 리스트

        return {
          columnId: projectCard.kanbanColumnId,
          columnName: projectCard.kanbanColumnName,
          columnSeq: projectCard.columnSeq,
          id: projectCard.kanbanCardId,
          title: projectCard.title,
          content: projectCard.content,
          cardSeq: projectCard.cardSeq,
          priority: projectCard.priority,
          taskSize: projectCard.taskSize,
          startAt: projectCard.startAt,
          endAt: projectCard.endAt,
          createdAt: projectCard.createdAt,
          members: Array.isArray(members)
            ? members.map((member) => ({
                memberId: member.memberId,
                email: member.email,
                nickName: member.nickName,
                profileUrl: member.profileUrl,
              }))
            : [], // cardMemberList가 null이거나 배열이 아닐 경우 빈 배열로 설정
        };
      });
    } catch (error) {
      console.error('Failed to load cards:', error);
    }
  };

  const loadCardDetails = async (cardId) => {
    try {
      const response = await axiosInstance.get(`/api/kanban-cards/${cardId}/details`);
      const cardData = response.data;
      return {
        id: cardData.kanbanColumnInCard.kanbanCardId,
        columnId: cardData.kanbanColumnInCard.kanbanColumnId,
        columnName: cardData.kanbanColumnInCard.kanbanColumnName,
        title: cardData.kanbanColumnInCard.title,
        content: cardData.kanbanColumnInCard.content,
        priority: cardData.kanbanColumnInCard.priority,
        task_size: cardData.kanbanColumnInCard.taskSize,
        startAt: cardData.kanbanColumnInCard.startAt,
        endAt: cardData.kanbanColumnInCard.endAt,
        createdAt: cardData.kanbanColumnInCard.createdAt,

        members: cardData.cardMemberList.map((member) => ({
          memberId: member.memberId,
          nickName: member.nickName,
          profileUrl: member.profileUrl,
        })),

        comments: cardData.cardCommentList || [],
      };
    } catch (error) {
      console.error('Failed to load card details:', error);
    }
  };

  // 카드 생성 함수
  const addCard = async (columnId, newCard) => {
    try {
      const response = await axiosInstance.post(`/api/kanban-columns/${columnId}/kanban-cards`, newCard);
      const cardData = response.data.data;

      // console.log('저장데이터:', cardData);

      cards.value.push({
        id: cardData.kanbanCardId,
        columnId: cardData.kanbanColumnId,
        columnName: cardData.kanbanColumnName,
        title: cardData.title,
        content: cardData.content,
        priority: cardData.priority,
        taskSize: cardData.taskSize,
        startAt: cardData.startAt,
        endAt: cardData.endAt,
        createdAt: cardData.createdAt,
      });
    } catch (error) {
      console.error('Failed to add new card:', error);
    }
  };

  // 컬럼 아이디 기준 카드 정보
  const getCardsByColumnId = (columnId) => {
    return cards.value.filter((card) => card.columnId === columnId);
  };

  // 칸반 컬럼 움직임에 따른 카드 움직임
  const updateCardsForMovedColumn = (updatedColumns) => {
    // 각 컬럼의 새로운 인덱스와 함께 카드 업데이트
    updatedColumns.forEach((column) => {
      cards.value.forEach((card) => {
        if (card.columnId === column.id) {
          // 카드의 columnId를 업데이트된 컬럼의 인덱스로 설정
          card.columnId = column.id;
          // console.log(`Updated Card ID: ${card.id} to Column ID: ${card.columnId}`);
        }
      });
    });
  };

  // 컬럼 이동 시 호출하는 함수 columnId 업데이트
  const updateCardsByColumnId = (oldColumnId, newColumnId) => {
    cards.value.forEach((card) => {
      if (card.columnId === oldColumnId) {
        card.columnId = newColumnId;
      }
    });
  };

  // 칸반 카드 수정
  const updateKanbanCard = async (cardId, updateColumn, updateData) => {
    try {
      const form = {
        updateColumn: updateColumn,
        updateData: updateData,
      };

      await axiosInstance.patch(`/api/kanban-cards/${cardId}`, form);

      if (updateColumn === 'task_size') {
        updateColumn = 'taskSize';
      } else if (updateColumn === 'start_at') {
        updateColumn = 'startAt';
      } else if (updateColumn === 'end_at') {
        updateColumn = 'endAt';
      }

      const index = cards.value.findIndex((card) => card.id === cardId);
      if (index !== -1) {
        cards.value[index] = {
          ...cards.value[index],
          [updateColumn]: updateData,
        };
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 같은 컬럼 내에서의 카드 이동
  const moveCardWithinColumn = async (cardId, columnId, newCardSeq) => {
    try {
      const cardLocationForm = {
        kanbanColumnId: columnId,
        cardSeq: newCardSeq,
      };

      await axiosInstance.put(`/api/kanban-cards/${cardId}/locations`, cardLocationForm);
    } catch (e) {
      console.error(`유효하지 않은 요청입니다.`,e);
    }
  };
  // 다른 컬럼으로의 카드 이동
  const moveCardToAnotherColumn = async (cardId, toColumnId, newCardSeq) => {
    try {
      const cardLocationForm = {
        kanbanColumnId: toColumnId,
        cardSeq: newCardSeq,
      };

      await axiosInstance.put(`/api/kanban-cards/${cardId}/locations`, cardLocationForm);
    } catch (e) {
      console.error(`유효하지 않은 요청입니다.`,e);
    }
  };

  // 칸반 카드 담당자 수정
  const updateKanbanCardMember = async (cardId, members) => {
    try {
      const memberIdList = members.map((member) => member.id);

      const form = {
        memberIds: memberIdList,
      };

      await axiosInstance.patch(`/api/kanban-cards/${cardId}/members`, form);

      const updatedColumn = members.map((member) => ({
        memberId: member.id,
        email: member.email,
        nickName: member.name,
        profileUrl: member.avatar,
      }));

      const index = cards.value.findIndex((card) => card.id === cardId);
      if (index !== -1) {
        cards.value[index].members = updatedColumn;
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 칸반 카드 삭제
  const deleteKanbanCard = async (cardId) => {
    try {
      await axiosInstance.delete(`/api/kanban-cards/${cardId}`);

      cards.value = cards.value.filter((card) => card.id !== cardId);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    cards,
    loadAllCards,
    loadCardDetails,
    addCard,
    getCardsByColumnId,
    moveCardWithinColumn,
    moveCardToAnotherColumn,
    updateCardsForMovedColumn,
    updateCardsByColumnId,
    updateKanbanCard,
    updateKanbanCardMember,
    deleteKanbanCard,
  };
});
