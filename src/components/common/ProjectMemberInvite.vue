<template>
  <div v-if="isInviteModalOpen" class="modal">
    <div class="modal-content">
      <!-- 이메일 입력 -->
      <div class="input-group">
        <label for="email" class="email-label">이메일</label>
        <div class="email-input">
          <input type="text" v-model="email" @input="handleInput" placeholder="이메일 입력" />
          <round-button-item type="button" :width="60" :height="40" :backgroundColor="'cancel'" @click="addEmail"> 추가 </round-button-item>
        </div>
      </div>
      <!-- 고정된 높이의 오류 메시지 영역을 여기로 이동 -->
      <div class="error-message-container">
        <p v-if="emailError" class="error-message">{{ emailError }}</p>
      </div>

      <!-- 이메일 리스트 -->
      <div class="email-list-container">
        <ul class="email-list">
          <li v-for="(user, index) in emailList" :key="user.memberId" class="email-item">
            <div class="profile-container">
              <!-- 프로필 이미지 -->
              <ProfileImageItem class="profile-image" :src="user.profileUrl ?? null" :width="24" :height="24"></ProfileImageItem>
              <div class="profile-text-inline">
                <!-- 닉네임 -->
                <span class="nickname">{{ user.nickName }}</span>
                <!-- 이메일 -->
                <span class="email">{{ user.email }}</span>
              </div>
            </div>
            <button @click="removeEmail(index)" class="remove-btn">
              <v-icon>mdi-close</v-icon>
            </button>
          </li>
        </ul>
      </div>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <round-button-item type="submit" :width="90" :height="40" :fontSize="14" @click="submitEmails"> 초대 </round-button-item>
        <round-button-item type="button" :width="90" :height="40" :fontSize="14" :backgroundColor="'cancel'" @click="closeModal"> 취소 </round-button-item>
      </div>
      <ConfirmAlertCompo :isVisible="isSendEmail" :message="'초대 메일을 전송했습니다.'"></ConfirmAlertCompo>
    </div>
  </div>
</template>

<script>
import axiosInstance from '@/api/axiosInstance';
import { ref, watch } from 'vue';

import { useProjectStore } from '@/stores/projectStore';

import ConfirmAlertCompo from './ConfirmAlertCompo';
import ProfileImageItem from './item/ProfileImageItem.vue';

export default {
  name: 'InviteModal',
  components: {
    ProfileImageItem,
    ConfirmAlertCompo,
  },
  props: {
    isInviteModalOpen: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const email = ref('');
    const emailList = ref([]);
    const emailError = ref('');
    const isSendEmail = ref(false); // 메일 전송 여부

    const projectStore = useProjectStore();
    const projectId = ref(null);

    let typingTimeout = null;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // projectId 변경을 감지하는 watch 설정
    watch(
      () => projectStore.projectData.id,
      (newProjectId) => {
        if (!newProjectId) {
          console.error('projectId가 null이거나 undefined입니다.');
        } else {
          projectId.value = newProjectId;
        }
      },
      { immediate: true },
    );

    // 이메일 형식 검증 함수
    const checkEmailFormat = () => {
      if (!emailPattern.test(email.value)) {
        emailError.value = '유효한 이메일 형식이 아닙니다.';
      } else {
        emailError.value = '';
      }
    };

    // 입력이 멈춘 후 1초 후에 이메일 형식 체크
    const handleInput = () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      typingTimeout = setTimeout(() => {
        if (email.value) {
          checkEmailFormat();
        } else {
          emailError.value = '';
        }
      }, 1000);
    };

    const addEmail = async () => {
      if (email.value && emailPattern.test(email.value)) {
        // emailList에서 이미 추가된 이메일인지 확인
        const isEmailExists = emailList.value.some((user) => user.email === email.value);

        if (!isEmailExists) {
          try {
            const searchEmail = {
              email: email.value,
            };

            const response = await axiosInstance.post(`/api/members/search-members`, searchEmail);
            const data = response.data;

            console.log(data);

            if (data) {
              emailList.value.push(data); // data 객체를 emailList에 추가
              email.value = '';
              emailError.value = ''; // 이메일 추가 후 오류 메시지 초기화
            } else {
              emailError.value = '회원 정보가 없는 이메일입니다.';
            }
          } catch (e) {
            console.error('API 요청 실패:', e);
          }
        } else {
          emailError.value = '이미 추가된 이메일입니다.';
        }
      } else {
        emailError.value = '유효한 이메일 형식이 아닙니다.';
      }
    };

    const removeEmail = (index) => {
      emailList.value.splice(index, 1);
    };

    // 모달 닫기 함수, 부모에게 알림
    const closeModal = () => {
      emailList.value = [];
      email.value = '';
      emit('closeModal'); // 부모에게 모달을 닫으라고 이벤트 전달
    };

    const submitEmails = () => {
      console.log('이메일 목록 전송:', emailList.value);

      // 이메일 전송
      sendEmails();
      isSendEmail.value = true;

      // 모달 닫기
      setTimeout(() => {
        closeModal();
      }, 1000);
    };

    // 초대 메일 전송
    const sendEmails = async () => {
      if (projectId.value) {
        // emailData를 서버에서 기대하는 형식으로 변환 (MemberDto 형식에 맞추기)
        const memberDtoList = emailList.value.map((member) => ({
          memberId: member.memberId,
          email: member.email,
          nickname: member.nickName,
          password: '',
          profileUrl: member.profileUrl ?? null,
          social: member.social ?? null,
          createdAt: member.createdAt ?? null,
          deletedAt: member.deletedAt ?? null,
        }));

        const response = await axiosInstance.post(`/api/projects/${projectId.value}/project-joins`, memberDtoList);
        const data = response.data;

        if (data.status === '201') {
          console.log('이메일보내기 성공');
        }
      } else {
        console.error('projectId가 정의되지 않았습니다.');
      }
    };

    return {
      email,
      emailList,
      emailError,
      addEmail,
      removeEmail,
      closeModal,
      submitEmails,
      handleInput,
      isSendEmail, // 메일 전송 여부
    };
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #f0f8ff;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  border: 1px solid #6b9e9b;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.email-label {
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
  white-space: nowrap; /* 라벨이 한 줄에 있도록 설정 */
}

.email-input {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.email-input input {
  flex: 1;
  margin-right: 10px;
  padding: 8px;
  border: 1px solid #6b9e9b;
  border-radius: 5px;
  background-color: #ffffff;
}

/* 고정된 높이의 오류 메시지 영역 */
.error-message-container {
  padding: 0 3px;
  height: 10px; /* 고정된 높이 */
  display: flex; /* 플렉스 컨테이너로 설정 */
  justify-content: flex-start; /* 왼쪽 정렬 */
}

.error-message {
  color: red;
  font-size: 10px; /* 폰트 크기 조정 */
  line-height: 10px; /* 높이에 맞춰 라인 높이 설정 */
  margin-left: 60px;
}

.email-list-container {
  min-height: 200px;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
  border: 1px solid #6b9e9b;
  padding: 10px;
  border-radius: 5px;
  background-color: #ffffff;
}

.email-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.email-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
}

.profile-container {
  display: flex;
  align-items: center; /* 프로필 이미지와 텍스트를 세로로 가운데 정렬 */
  gap: 10px; /* 이미지와 텍스트 사이에 간격 추가 */
}

.profile-text-inline {
  display: flex;
  align-items: center;
  gap: 5px; /* 닉네임과 이메일 사이에 약간의 간격 추가 */
}

.profile-text-inline .nickname {
  font-weight: bold; /* 닉네임을 굵게 */
  margin-right: 5px; /* 닉네임과 이메일 사이에 여유 공간 추가 */
}

.profile-text-inline .email {
  font-size: 14px; /* 이메일 크기를 살짝 작게 */
  color: #777; /* 이메일에 약간의 회색 색상 적용 */
}

.remove-btn {
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 12px;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}
</style>
