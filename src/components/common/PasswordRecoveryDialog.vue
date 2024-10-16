<template>
  <v-dialog v-model="showDialog" persistent max-width="450">
    <v-card class="pa-5 custom-background">
      <!-- 확인 모달창 -->
      <CheckMessage :isVisible="isModalVisible" :message="errorMessage" @close="closeModal" class="checkMessage" />
      <v-card-title class="dialog-title">비밀번호 찾기</v-card-title>
      <!-- form 태그로 변경 -->
      <v-card-text>
        <!-- 가입한 이메일 입력 필드 -->
        <label for="email" class="custom-label">가입한 이메일</label>
        <v-text-field
          id="email"
          placeholder="가입한 이메일을 입력해주세요."
          v-model="verificationCodeStore.authentication.email"
          outlined
          disabled
          inert
          class="custom-input"
        />

        <!-- 인증번호 입력 필드 및 인증 버튼 -->
        <div class="input-group">
          <div class="input-field">
            <label for="authCode" class="custom-label">인증번호</label>
            <v-text-field id="authCode" placeholder="인증번호를 입력해주세요." v-model="authCode" outlined class="custom-input" />
          </div>
          <div class="button-timer-group">
            <round-button-item type="button" @click="handleVerifyCode" class="auth-btn" :width="95" :height="35">인증</round-button-item>
            <!-- 남은 시간 표시 -->
            <div class="timer-box" v-if="isVerifyCode" v-show="false">남은 시간: {{ verificationCodeStore.authentication?.expiresIn }}</div>
          </div>
        </div>

        <!-- 비밀번호 입력 필드 -->
        <label for="newPassword" class="custom-label">비밀번호</label>
        <v-text-field id="newPassword" placeholder="비밀번호를 입력해주세요." type="password" v-model="newPassword" outlined class="custom-input" />

        <!-- 비밀번호 확인 입력 필드 -->
        <label for="confirmPassword" class="custom-label">비밀번호 확인</label>
        <v-text-field
          id="confirmPassword"
          placeholder="비밀번호를 다시 입력해주세요."
          type="password"
          v-model="confirmPassword"
          outlined
          class="custom-input"
        />
      </v-card-text>

      <!-- 비밀번호 변경 버튼 -->
      <v-card-actions class="justify-center move-up">
        <round-button-item type="submit" :width="200" :height="40" @click="changePassword">비밀번호 변경</round-button-item>
      </v-card-actions>

      <!-- 닫기 버튼 -->
      <v-card-actions class="justify-center move-up close-btn">
        <v-btn color="grey" text @click="closeDialog">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { onMounted, ref, watch } from 'vue';

import { useVerificationCodeStore } from '@/stores/VerificationCodeStore';
import CheckMessage from './AlertCheckMessage.vue';

export default {
  name: 'PasswordRecoveryDialog',
  components: { CheckMessage },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const verificationCodeStore = useVerificationCodeStore();
    const showDialog = ref(props.show);
    const email = ref('');
    const authCode = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const isVerifyCode = ref(true);
    const isModalVisible = ref(false);
    const errorMessage = ref('');
    const isExpiresIn = ref(false);

    // onMounted
    onMounted(() => {
      verificationCodeStore.clearAuthentication();
    });

    const closeDialog = () => {
      emit('update:show', false);
    };

    const handleVerifyCode = async () => {
      if (!authCode.value) {
        errorMessage.value = '인증번호를 확인하세요.';
        isModalVisible.value = true;
        isVerifyCode.value = true;
        isExpiresIn.value = true;

        return;
      }

      if (authCode.value !== verificationCodeStore.authentication?.code) {
        errorMessage.value = '인증번호가 틀립니다.';
        isModalVisible.value = true;
        isVerifyCode.value = true;
        isExpiresIn.value = true;

        return;
      } else {
        errorMessage.value = '인증되었습니다.';
        isModalVisible.value = true;
        isVerifyCode.value = false;
        isExpiresIn.value = false;

        // 인증 정보 초기화
        verificationCodeStore.clearAuthentication();
      }
    };

    const changePassword = async () => {
      console.log('비밀번호 변경 요청:', {
        email: email.value,
        code: authCode.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      });

      // 스토어 호출
      try {
        await verificationCodeStore.changePassword({
          email: email.value,
          code: authCode.value,
          newPassword: newPassword.value,
          confirmPassword: confirmPassword.value,
        });

        // 비밀번호 변경 성공 후 처리
        console.log('비밀번호 변경 성공');
        closeDialog();
      } catch (e) {
        console.error(e.message);
      }
    };

    watch(
      () => props.show,
      (newValue) => {
        showDialog.value = newValue;
      },
    );

    // verificationCodeStore 상태 watch
    watch(
      () => verificationCodeStore,
      (newValue) => {
        if (newValue.authentication) {
          email.value = newValue.authentication.email;
          if (newValue.authentication.expiresIn === '') {
            isVerifyCode.value = false;
            isExpiresIn.value = false;
          } else {
            isVerifyCode.value = true;
          }
        }
      },
      { deep: true },
    );

    // 확인 모달 닫기
    const closeModal = () => {
      isModalVisible.value = false;
    };

    return {
      showDialog,
      email,
      authCode,
      errorMessage,
      isModalVisible,
      newPassword,
      confirmPassword,
      closeDialog,
      changePassword,
      verificationCodeStore, // 스토어 연결
      handleVerifyCode, // 인증 확인
      closeModal,
      isVerifyCode,
    };
  },
};
</script>

<style scoped>
.custom-background {
  background-color: #f7faff; /* 부드러운 파란색 배경 */
  border-radius: 12px; /* 카드 모서리 둥글게 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  border: 1.5px solid #6b9e9b;
}

.dialog-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.custom-label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.input-group {
  display: flex;
  height: 100px;
  align-items: center;
}

.custom-input input:disabled {
  color: #4a4a4a !important; /* 진한 회색 */
}

.input-field {
  flex-grow: 1;
}

.button-timer-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 8px;
}

.auth-btn {
  margin-left: 8px; /* 인증 버튼과 필드 사이 간격 */
}

.timer-box {
  font-size: 12px;
  color: red;
  font-weight: bold;
  text-align: right;
  margin-top: 8px; /* 인증 버튼과 남은 시간 사이의 간격 추가 */
}

.v-card-actions {
  padding-top: 20px; /* 버튼과 입력 필드 사이 간격 */
  justify-content: center; /* 버튼 가운데 정렬 */
}

.move-up {
  margin-top: -20px; /* 버튼을 위로 20px 이동 */
}

.close-btn {
  margin-top: 2px; /* 비밀번호 변경 버튼과 닫기 버튼 사이 간격 */
}

.checkMessage {
  background-color: rgba(175, 175, 175, 0.8); /* 배경색을 반투명하게 설정 */
  opacity: 1; /* 투명도 설정 */
  border-radius: 10px; /* 둥근 모서리 */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 그림자 효과 */
  z-index: 1000;
}
</style>
