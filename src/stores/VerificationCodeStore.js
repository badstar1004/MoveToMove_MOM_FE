import axiosInstance from '@/api/axiosInstance';
import { defineStore } from 'pinia';

export const useVerificationCodeStore = defineStore('verificationCode', {
  state: () => ({
    authentication: {
      email: '',
      code: '',
      expiresIn: '',
    },
    isSent: false,
    alertVisible: false,
    intervalId: null, // 카운트다운 관리
    isLoading: false, // 로딩상태
  }),
  actions: {
    // 인증번호 발송 함수
    async sendVerificationCode(email) {
      if (email) {
        this.startLoading();
        this.authentication.email = email;

        const requestData = { email: email, code: '' };
        try {
          const response = await axiosInstance.post(`/api/members/password/send-authentication-code`, requestData);

          this.authentication = response.data.data;
          this.isSent = true;
          this.alertVisible = true;

          // 카운트다운 시작
          this.startCountdown();
        } catch (error) {
          console.error('인증코드 전송 실패:', error.response?.data || error.message);
          throw error;
        } finally {
          this.stopLoading();
        }
      }
    },

    // 인증 코드 확인 함수
    async verifyCode(email, authCode) {
      try {
        const requestData = {
          email,
          authCode,
        };
        const response = await axiosInstance.post(`/api/members/password/authentication-code/verify-code`, requestData);

        // 인증 성공 처리
        console.log('인증 성공:', response.data);
        return response.data;
      } catch (error) {
        // 인증 실패 처리
        console.error('인증 실패:', error.response?.data || error.message);
        throw error;
      }
    },

    // 이메일 변경
    setEmail(email) {
      this.authentication.email = email;
    },

    // 비밀번호 변경 함수 추가
    async changePassword({ email, code, newPassword, confirmPassword }) {
      try {
        const requestData = {
          email,
          code,
          newPassword,
          confirmPassword,
        };

        const response = await axiosInstance.post(`/api/members/password/reset`, requestData);

        // 비밀번호 변경 성공 처리
        console.log('비밀번호 변경 성공:', response.data);
      } catch (error) {
        // 오류 처리
        console.error('비밀번호 변경 실패:', error.response?.data || error.message);
      }
    },

    // 카운트다운 로직
    startCountdown() {
      if (this.intervalId) clearInterval(this.intervalId);

      this.intervalId = setInterval(() => {
        let [minutes, seconds] = this.authentication.expiresIn.split(':').map(Number);
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(this.intervalId);
            this.alertVisible = false;
            this.clearAuthentication();
          } else {
            minutes--;
            seconds = 59;
          }
        } else {
          seconds--;
        }

        this.authentication.expiresIn = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }, 1000);
    },

    // 인증 정보 초기화
    clearAuthentication() {
      this.authentication.code = '';
      this.authentication.expiresIn = '';
      this.isSent = false;
      this.alertVisible = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    // 알림 상태 초기화
    clearAlert() {
      this.alertVisible = false;
    },

    startLoading() {
      this.isLoading = true;
    },
    stopLoading() {
      this.isLoading = false;
    },
  },
});
