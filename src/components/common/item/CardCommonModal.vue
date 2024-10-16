<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
    <div @click.stop>
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <font-awesome-icon :icon="['fas', 'xmark']" class="close-icon" @click="closeModal" />
      </header>

      <hr class="divider" />

      <div class="modal-body">
        <input type="text" v-model="searchQuery" placeholder="검색" class="search-input" />

        <div class="item-list modal-content">
          <div v-for="item in filteredItems" :key="item.id" @click="toggleSelectItem(item)" class="item" :class="{ 'selected-item': isItemSelected(item) }">
            <input type="checkbox" :checked="isItemSelected(item)" />
            <template v-if="multiple">
              <ProfileImage :src="item.avatar || require('@/assets/basic-profile.png')" :alt="item.name + ' Avatar'" :width="25" :height="25" />
            </template>
            <template v-else>
              <font-awesome-icon :icon="['fas', 'circle-dot']" :style="{ color: item.color }" />
            </template>
            {{ item.name }}
          </div>
        </div>
      </div>

      <!-- 확인 버튼 추가 -->
      <div class="modal-footer">
        <round-button-item :width="90" :height="30" :borderRadius="5" :fontSize="15" @click="confirmSelection">확인</round-button-item>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileImage from '@/components/common/item/ProfileImageItem.vue';
import { computed, defineComponent, ref, watch } from 'vue';

export default defineComponent({
  components: {
    ProfileImage,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [], // items에 대한 기본값 설정
    },
    multiple: {
      // 다중 선택 여부를 설정하는 props
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedItems = ref([]);

    // 필터링
    const filteredItems = computed(() => {
      return searchQuery.value ? props.items.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase())) : props.items;
    });

    // 아이템 선택/해제 메서드
    const toggleSelectItem = (item) => {
      if (props.multiple) {
        // 다중 선택인 경우
        const index = selectedItems.value.findIndex((selected) => selected.id === item.id);

        if (index > -1) {
          selectedItems.value.splice(index, 1); // 이미 선택된 경우 해제
        } else {
          selectedItems.value.push(item); // 선택되지 않은 경우 선택
        }
      } else {
        // 단일 선택인 경우
        selectedItems.value = [item];
      }
    };

    // 선택 확인
    const isItemSelected = computed(() => {
      const selectedItemIds = selectedItems.value.map((item) => item.id);
      return (item) => selectedItemIds.includes(item.id);
    });

    // 선택된 항목을 부모에게 전달
    const confirmSelection = () => {
      emit('confirm', selectedItems.value);
    };

    // 모달 창 닫기
    const closeModal = () => {
      emit('close');
    };

    // props.items가 변경될 때마다 selectedItems를 업데이트
    watch(
      () => props.items,
      (newItems) => {
        selectedItems.value = newItems.filter((item) => item.selected);
      },
      { immediate: true }, // 컴포넌트가 마운트될 때 즉시 실행
    );

    return {
      searchQuery,
      filteredItems,
      closeModal,
      toggleSelectItem,
      confirmSelection,
      isItemSelected,
    };
  },
});
</script>

<style scoped>
.modal-overlay {
  width: 100%;
  border-radius: 5px;
  background-color: white;
  border: 1px solid #6b9e9b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.close-icon {
  position: absolute;
  top: 12px;
  right: 10px;
  font-size: 20px;
  color: #d63f3f;
  cursor: pointer;
}

.divider {
  border: 0;
  height: 1px;
  background: #6b9e9b; /* 구분선 색상 */
  margin-bottom: 10px;
}

.search-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid black;
  border-radius: 5px;
  height: 30px;
  font-size: 15px;
}

.item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border: 1.5px solid #6b9e9b;
  border-radius: 5px;
  height: 40px;
  gap: 5px;
  padding: 10px;
  cursor: pointer;
}

.item.selected-item {
  width: 100%;
  background-color: #e0f7fa; /* 선택된 항목의 배경색 변경 */
}

.item input[type='checkbox'] {
  /* display: none; 체크박스 숨기기 */
  margin-right: 10px;
}

.modal-content {
  max-height: 200px; /* 최대 높이 설정을 키워 더 많은 내용이 보이도록 */
  overflow-y: auto; /* 내용이 많을 경우 스크롤 가능 */
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

/* 이미지 */
.avatar {
  margin-right: 10px;
  border: 1.5px solid #6b9e9b;
}

/* 스크롤 바 전체 */
.modal-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

/* 스크롤 바 막대 */
.modal-content::-webkit-scrollbar-thumb {
  background-color: #6b9e9b;
  border-radius: 10px;
  border: 2px solid #ffffff;
}

/* 스크롤 바의 트랙(배경) */
.modal-content::-webkit-scrollbar-track {
  border-radius: 10px;
}
</style>
