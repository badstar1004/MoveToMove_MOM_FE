<template>
  <div>
    <h1>프로젝트 생성</h1>

    <form @submit.prevent="onSubmit" class="new-project-contains">
      <div class="project-content">
        <div class="content-group">
          <label>프로젝트명</label>
          <div class="vertical-line"></div>
          <div class="input-container">
            <input v-model="projectName" type="text" id="nickName" placeholder="프로젝트명" />
            <div class="error-message" v-if="projectNameError">{{ projectNameError }}</div>
          </div>
        </div>
        <div class="content-group-area">
          <label>프로젝트 설명</label>
          <div class="vertical-line-area"></div>
          <div class="input-container">
            <textarea v-model="projectDescription" id="projectDescription" placeholder="프로젝트 설명"></textarea>
            <div class="error-message" v-if="projectDescriptionError">{{ projectDescriptionError }}</div>
          </div>
        </div>
        <div class="content-group">
          <label><font-awesome-icon :icon="['far', 'calendar-check']" class="calendar-icon" /> 시작일시</label>
          <div class="vertical-line"></div>
          <div class="input-container">
            <input v-model="startDate" type="date" id="startDate" placeholder="시작일시" />
            <div class="error-message" v-if="startDateError">{{ startDateError }}</div>
          </div>
        </div>
        <div class="content-group">
          <label><font-awesome-icon :icon="['far', 'calendar-check']" class="calendar-icon" /> 종료일시</label>
          <div class="vertical-line"></div>
          <div class="input-container">
            <input v-model="endDate" type="date" id="endDate" placeholder="종료일시" />
            <div class="error-message" v-if="endDateError">{{ endDateError }}</div>
          </div>
        </div>
      </div>
      <div class="button-group">
        <round-button-item type="submit" class="save-btn" :width="200" :height="40">프로젝트 생성</round-button-item>
        <round-button-item type="button" class="cancel-btn" :width="200" :height="40" :backgroundColor="'cancel'" @click="onCancelButton">
          취소
        </round-button-item>
      </div>
    </form>

    <ConfirmAlert :isVisible="isCheckProject" message="프로젝트가 생성되었습니다." />
  </div>
</template>

<script>
import axiosInstance from '@/api/axiosInstance';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import ConfirmAlert from '@/components/common/ConfirmAlertCompo.vue';

export default {
  components: {
    ConfirmAlert,
  },
  setup() {
    const router = useRouter();

    // Form 데이터 및 에러 메시지 정의
    const projectName = ref('');
    const projectDescription = ref('');
    const startDate = ref('');
    const endDate = ref('');
    const projectNameError = ref('');
    const projectDescriptionError = ref('');
    const startDateError = ref('');
    const endDateError = ref('');
    const isCheckProject = ref(false); // 알림 창의 표시 여부를 제어하는 변수

    // 취소 버튼 클릭 시 라우팅
    const onCancelButton = () => {
      router.replace('/move-to-move/kanban');
    };

    // 폼 제출 처리
    const onSubmit = async () => {
      // 폼 검증 예시
      if (!projectName.value) {
        projectNameError.value = '프로젝트명을 입력해주세요.';
      } else {
        projectNameError.value = '';
      }

      if (!projectDescription.value) {
        projectDescriptionError.value = '프로젝트 설명을 입력해주세요.';
      } else {
        projectDescriptionError.value = '';
      }

      if (!startDate.value) {
        startDateError.value = '시작일시를 선택해주세요.';
      } else {
        startDateError.value = '';
      }

      if (!endDate.value) {
        endDateError.value = '종료일시를 선택해주세요.';
      } else {
        endDateError.value = '';
      }

      // 모든 필드가 유효할 때
      if (!projectNameError.value && !projectDescriptionError.value && !startDateError.value && !endDateError.value) {
        try {
          const response = await axiosInstance.post(`/api/projects`, {
            projectName: projectName.value,
            projectDescription: projectDescription.value,
            startAt: startDate.value,
            endAt: endDate.value,
          });

          if (response.data && response.data.status === 201) {
            // 저장후 반환된 프로젝트 아이디
            const projectId = response.data.data;

            // 프로젝트가 성공적으로 생성되었을 때 알림창 표시
            isCheckProject.value = true;

            // 일정 시간 후 페이지 리다이렉트
            setTimeout(() => {
              if (projectId) {
                // projectId가 존재할 경우 쿼리 파라미터로 전달
                router.replace({
                  path: '/move-to-move/kanban',
                  query: { projectId }, // 쿼리 파라미터로 프로젝트 ID를 전달
                });
              }
            }, 1000); // 1초 후에 리다이렉트
          }
        } catch (error) {
          console.error('프로젝트 생성 실패:', error);
        }
      }
    };

    return {
      projectName,
      projectDescription,
      startDate,
      endDate,
      projectNameError,
      projectDescriptionError,
      startDateError,
      endDateError,
      onCancelButton,
      onSubmit,
      isCheckProject,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: left;
}

.new-project-contains {
  margin-top: 20px;
  height: 470px;
  border: 1.5px solid #6b9e9b;
  border-radius: 10px;
  background: #ffffff;
}

.project-content {
  display: flex;
  margin-top: 20px;
  height: 100%;
  flex-direction: column;
  align-items: center;
}

.vertical-line,
.vertical-line-area {
  margin-right: 20px;
  border-radius: 20px;
  border-left: 2px solid #6b9e9b;
}

.vertical-line {
  height: 20px;
}

.vertical-line-area {
  margin-top: 2%;
  height: 90%;
}

.content-group,
.content-group-area {
  text-align: left;
  width: 500px;
  display: flex;
  margin-bottom: 20px;
}

.content-group {
  align-items: center;
}

.content-group label,
.content-group-area label {
  font-size: 16px;
  font-weight: bold;
  text-align: left;
  width: 30%;
}

.content-group-area label {
  margin-top: 2%;
}

.content-group input,
.content-group-area textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.content-group-area textarea {
  height: 200px;
}

.input-container {
  width: 70%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.calendar-icon {
  margin-right: 10px;
}

.error-message {
  position: absolute;
  color: #d63f3f;
  font-size: 10px;
  top: 100%;
  left: 10px;
}

/* 버튼 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
