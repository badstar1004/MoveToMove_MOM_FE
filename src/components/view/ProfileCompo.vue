<template>
  <div class="mypage">
    <h1>마이페이지 > 정보수정</h1>
    <v-form class="sub-content" @submit.prevent="updateMemberInfo">
      <div class="member-info">
        <div class="member-image">
          <img :src="previewImage" alt="미리보기" class="avatar" />
          <input type="file" @change="onFileChange" class="file-input" accept="image/*" />
          <font-awesome-icon :icon="['fas', 'xmark']" class="xmark-icon" @click="removeImage" />
          <font-awesome-icon :icon="['fas', 'pen']" class="pen-icon" />
        </div>

        <div class="member-details">
          <div class="form-group">
            <label>이메일</label>
            <div class="vertical-line"></div>
            <div class="input-container">
              <input type="text" id="email" placeholder="이메일" v-model="memberInfo.email" readonly />
            </div>
          </div>

          <div class="form-group">
            <label>닉네임</label>
            <div class="vertical-line"></div>
            <div class="input-container">
              <input type="text" id="nickName" placeholder="닉네임" v-model="memberInfo.nickName" @blur="onNickNameBlur" />
              <div v-if="errorMessage.nickName" class="error-message">{{ errorMessage.nickName }}</div>
            </div>
          </div>
          <div v-if="isRegularLogin">
            <div class="form-group">
              <label>비밀번호</label>
              <div class="vertical-line"></div>
              <div class="input-container">
                <input type="password" id="password" placeholder="비밀번호" v-model="memberInfo.password" @blur="onPasswordBlur" />
                <div v-if="errorMessage.password" class="error-message">{{ errorMessage.password }}</div>
              </div>
            </div>

            <div class="form-group">
              <label>비밀번호 확인</label>
              <div class="vertical-line"></div>
              <div class="input-container">
                <input type="password" id="password-check" placeholder="비밀번호 확인" v-model="memberInfo.passwordCheck" @blur="onPasswordCheckBlur" />
                <div v-if="errorMessage.passwordCheck" class="error-message">{{ errorMessage.passwordCheck }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="button-group">
        <round-button-item type="submit" :width="200" :height="40">저장</round-button-item>
        <round-button-item type="button" :width="200" :height="40" :backgroundColor="'cancel'" @click="pageChange">취소</round-button-item>
      </div>
    </v-form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/api/axiosInstance.js';
import { useAuthStore } from '@/stores/memberStore';
import basicProfile from '@/assets/basic-profile.png';
import RoundButtonItem from '../common/item/RoundButtonItem.vue';

export default {
  name: 'ProfileCompo',
  components: {
    RoundButtonItem,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const previewImage = ref(null);
    const selectedImage = ref(null);
    const errorMessage = reactive({
      nickName: null,
      password: null,
      passwordCheck: null,
    });
    const memberInfo = reactive({
      email: '',
      nickName: '',
      profileUrl: '',
      password: '',
      passwordCheck: '',
    });
    // 로그인 유저가 소셜 로그인 시 비밀번호 변경이 안보이도록 함
    const isRegularLogin = ref(false); // 기본값은 false로 설정
    // 기본 이미지 세팅
    const setBasicProfile = async () => {
      const response = await fetch(basicProfile);
      const blob = await response.blob();
      const file = new File([blob], basicProfile.split('/').pop(), { type: blob.type });

      return file;
    };

    // 이미지 선택
    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        selectedImage.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
        event.target.value = null;
      }
    };

    // 이미지 제거
    const removeImage = async () => {
      const file = await setBasicProfile();
      previewImage.value = URL.createObjectURL(file);
      selectedImage.value = file;
    };

    // 사용자 정보 조회
    const loadMemberInfo = async () => {
      try {
        const res = await axiosInstance.get('/api/members');

        // 사용자 정보 할당
        memberInfo.email = res.data.email;
        memberInfo.nickName = res.data.nickName;
        isRegularLogin.value = res.data.social === null

        console.log(res.data.social);
        if (res.data.profileUrl) {
          memberInfo.profileUrl = res.data.profileUrl;
          previewImage.value = `${res.data.profileUrl}?t=${new Date().getTime()}`;
          selectedImage.value = res.data.profileUrl;
        } else {
          await removeImage();
        }
      } catch (error) {
        console.log(error);
      }
    };

    // 입력 확인
    const validateFields = () => {
      let isValid = false;

      onNickNameBlur();
      onPasswordBlur();
      onPasswordCheckBlur();

      if (!errorMessage.nickName && !errorMessage.password && !errorMessage.passwordCheck) {
        isValid = true;
      }

      return isValid; // 모든 유효성 검사가 통과되면 true 반환
    };

    // 사용자 정보 수정
    const updateMemberInfo = async () => {
      try {
        if (!validateFields()) {
          return;
        }

        const formData = new FormData();
        formData.append('form', JSON.stringify(memberInfo));
        formData.append('file', selectedImage.value);

        await axiosInstance.put('/api/members/info', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // 오류 초기화
        errorMessage.nickName = null;
        errorMessage.password = null;
        errorMessage.passwordCheck = null;

        await authStore.fetchUser();

        pageChange();
      } catch (error) {
        // 오류 발생 시 처리
        if (error.response && error.response.data) {
          const { data, message } = error.response.data;
          if (data == 'nickName') {
            errorMessage.nickName = message;
          }
        } else {
          console.log(error);
        }
      }
    };

    // 닉네임 입력 확인
    const onNickNameBlur = () => {
      if (!memberInfo.nickName) {
        errorMessage.nickName = '닉네임을 입력해 주세요.';
        return;
      }
      if (memberInfo.nickName.length < 2) {
        errorMessage.nickName = '닉네임은 2자리 이상 입력하세요.';
        return;
      }
      errorMessage.nickName = null;
    };

    // 비밀번호 입력 화인
    const onPasswordBlur = () => {
      if (memberInfo.password && memberInfo.password.length < 6) {
        errorMessage.password = '비밀번호는 6자리 이상 입력하세요.';
        return;
      }
      errorMessage.password = null;
    };

    // 비밀번호 확인 입력 화인
    const onPasswordCheckBlur = () => {
      if (memberInfo.password != memberInfo.passwordCheck) {
        errorMessage.passwordCheck = '비밀번호가 일치하지 않습니다.';
        return;
      }
      errorMessage.passwordCheck = null;
    };

    // 페이지 이동
    const pageChange = () => {
      router.replace('/move-to-move/mypage');
    };

    onMounted(() => {
      setBasicProfile();
      loadMemberInfo();
    });

    return {
      errorMessage,
      previewImage,
      removeImage,
      memberInfo,
      onFileChange,
      updateMemberInfo,
      onNickNameBlur,
      onPasswordBlur,
      onPasswordCheckBlur,
      pageChange,
      isRegularLogin,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: left;
}

.sub-content {
  height: auto;
  margin-top: 20px;
  border-radius: 10px;
  height: 470px;
  border: 1.5px solid #6b9e9b;
  border-radius: 10px;
  background: #ffffff;
}

.member-info {
  display: flex;
  margin-top: 20px;
  height: 100%;
  gap: 30px;
  flex-direction: column;
  align-items: center;
}

.member-image {
  width: 150px;
  height: 150px;
  border-radius: 15px;
  border: 1.5px solid #6b9e9b;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 95%;
  height: 95%;
  border-radius: 15px;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0; /* 파일 선택 input을 투명하게 */
  cursor: pointer;
}

.xmark-icon {
  position: absolute;
  right: 0;
  top: 0;
  width: 15px;
  height: 15px;
  padding: 3px;
  border-radius: 5px;
  color: #d63f3f;
}

.pen-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 15px;
  height: 15px;
  padding: 3px;
  border-radius: 10px;
  color: white;
  background-color: #6b9e9b;
}

.member-details {
  align-items: center;
}

.form-group {
  width: 400px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.vertical-line {
  height: 20px;
  margin-right: 20px;
  border-radius: 20px;
  border-left: 2px solid #6b9e9b;
}

.form-group {
  text-align: left;
}

.form-group label {
  font-size: 16px;
  font-weight: bold;
  text-align: left;
  width: 30%;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-container {
  width: 70%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.error-message {
  position: absolute;
  color: #d63f3f;
  font-size: 10px;
  top: 100%;
  left: 10px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* .save-btn,
.cancel-btn {
  font-weight: bold !important;
  border-radius: 10px !important;
  color: white !important;
} */

/* .save-btn {
  background: linear-gradient(135deg, #5a6d8c, #112f4e);
}

.cancel-btn {
  background: #6b9e9b;
} */
</style>
