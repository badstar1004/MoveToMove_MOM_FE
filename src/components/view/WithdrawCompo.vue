<template>
  <div>
    <h1>마이페이지 > 회원탈퇴</h1>

    <div class="withdraw-contains">
      <div class="withdraw-content">
        <div class="title-contains">
          <h2>탈퇴 안내</h2>
          <p class="title-message">회원 탈퇴를 진행하기 전에 아래 항목을 꼭 확인해 주세요.</p>
        </div>

        <div class="withdraw-checklist">
          <div class="checklist-title">
            <font-awesome-icon :icon="['fas', 'check']" class="check-icon" />
            <label>팀장 여부 확인</label>
          </div>
          <p class="check-description">
            팀장으로 되어 있는 프로젝트가 있을 경우 회원 탈퇴가 불가능합니다. <br />
            팀장 권한을 이전하고 탈퇴를 진행해 주세요.
          </p>

          <div class="checklist-title">
            <font-awesome-icon :icon="['fas', 'check']" class="check-icon" />
            <label>탈퇴 후 일부 정보는 남아 있을 수 있습니다.</label>
          </div>
          <p class="check-description">칸반 카드, 피드백에 대한 내용이 남아 있을 수 있습니다.</p>

          <div class="checklist-title">
            <font-awesome-icon :icon="['fas', 'check']" class="check-icon" />
            <label>회원 탈퇴 시 해당 아이디로 로그인할 수 없습니다.</label>
          </div>
        </div>

        <div class="checklist-confirm" @click="agreement">
          <font-awesome-icon :icon="isAgreed ? ['fas', 'check-square'] : ['far', 'square']" class="square-icon" />
          <label for="agreement">안내사항 모두 확인, 동의 합니다.</label>
        </div>
      </div>

      <div class="button-group">
        <round-button-item type="button" class="save-btn" :width="200" :height="40" @click="agreementCheck">탈퇴</round-button-item>
        <round-button-item type="button" class="cancel-btn" :width="200" :height="40" :backgroundColor="'cancel'" @click="pageChange">취소</round-button-item>
      </div>
    </div>

    <CheckMessage :isVisible="isModalVisible" @close="closeModal" />
    <ConfirmAlert :isVisible="isWithdrawVisible" @close="closeWithdraw" message="탈퇴 되었습니다." />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/api/axiosInstance.js';
import { useAuthStore } from '@/stores/memberStore';
import CheckMessage from '../common/AlertCheckMessage.vue';
import ConfirmAlert from '../common/ConfirmAlertCompo.vue';

export default {
  name: 'WithdrawCompo',
  components: {
    CheckMessage,
    ConfirmAlert,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    // 체크박스 세팅
    const isAgreed = ref(false);

    // 모달 설정
    const isModalVisible = ref(false);
    const isWithdrawVisible = ref(false);

    // 체크박스 상태 변경
    const agreement = () => {
      isAgreed.value = !isAgreed.value;
    };

    // 탈퇴 동의 여부 확인
    const agreementCheck = () => {
      if (!isAgreed.value) {
        // 모달을 띄우기 전에 상태 확인
        // console.log('모달을 띄우기 전 상태:', isModalVisible.value);
        isModalVisible.value = true;
        // isWithdrawVisible.value = true;
        // console.log('모달을 띄운 후 상태:', isModalVisible.value); // true여야 합니다
      } else {
        withdraw();
      }
    };

    // 모달 닫기
    const closeModal = () => {
      isModalVisible.value = false;
    };

    const closeWithdraw = () => {
      isWithdrawVisible.value = false;
    };

    // 취소 페이지 이동
    const pageChange = () => {
      router.replace('/move-to-move/mypage');
    };

    // 회원 탈퇴
    const withdraw = async () => {
      try {
        await axiosInstance.delete('/api/members/withdraw', {
          withCredentials: true,
        });

        isWithdrawVisible.value = true;
        authStore.logout();

        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } catch (error) {
        console.log(error);
      }
    };

    return {
      isAgreed,
      agreement,
      agreementCheck,
      closeModal,
      closeWithdraw,
      pageChange,
      isModalVisible,
      isWithdrawVisible,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: left;
}

.withdraw-contains {
  height: auto;
  margin-top: 20px;
  height: 470px;
  border: 1.5px solid #6b9e9b;
  border-radius: 10px;
  background: #ffffff;
}

.withdraw-content {
  display: flex;
  margin-top: 20px;
  height: 100%;
  flex-direction: column;
  align-items: center;
}

.title-message {
  color: #777777;
  margin-top: 15px;
  font-size: 15px;
}

.withdraw-checklist {
  align-items: center;
  width: 430px;
  margin-bottom: 20px;
}

.checklist-title {
  display: flex;
  font-weight: bold;
  margin-top: 40px;
}

.check-icon {
  color: #6b9e9b;
  margin-right: 10px;
}

.checklist label {
  font-size: 15px;
  font-weight: bold;
  text-align: left;
}

.check-description {
  text-align: left;
  font-size: 14px;
  color: #777777;
  margin-top: 5px;
}

.checklist-confirm {
  display: flex;
  margin-top: 30px;
  align-items: center;
  cursor: pointer; /* 클릭 가능하게 커서 변경 */
}

.square-icon {
  color: #6b9e9b;
  margin-right: 10px;
  font-size: 24px;
}

.checklist-confirm label {
  font-size: 16px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.save-btn,
.cancel-btn {
  font-weight: bold !important;
  border-radius: 10px !important;
  color: white !important;
}

.save-btn {
  background: linear-gradient(135deg, #5a6d8c, #112f4e);
}

.cancel-btn {
  background: #6b9e9b;
}
</style>
