import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/memberStore';
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

// 인스턴스 생성
const axiosInstance = axios.create({
  // baseURL: 'https://move-to-move.online', // 나중 API URL
  baseURL: `${API_BASE_URL}`, //.env 파일에 API URL 바꾸면됩니다.
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  function (config) {
    const authStore = useAuthStore(); // 인터셉터 내부에서 호출
    const accessToken = authStore.getAccessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);
// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },

  async function (error) {
    const originalRequest = error.config;

    if (error.response.status === 401) {
      const authStore = useAuthStore();

      try {
        const result = await axiosInstance.post(
          '/api/members/checks/refresh-token',
          {},
          {
            withCredentials: true,
          },
        );

        authStore.login({ accessToken: result.data.data });

        // 원래 요청을 다시 시도
        return await axiosInstance(originalRequest);
      } catch {
        authStore.logout();
        if (router.currentRoute.path !== '/') {
          router.push('/');
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
