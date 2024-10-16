<template>
  <div>
    <h1>마이페이지</h1>

    <div class="contains">
      <div class="progress-task">
        <span class="task-title">누적 Task</span>
        <div class="task-card total-task">
          <span>Total Task</span>
          <strong>{{ totalTasks }}건</strong>
        </div>
        <div class="task-card end-task">
          <span>End Task</span>
          <strong>{{ endTasks }}건</strong>
        </div>
        <div class="task-card remain-task">
          <span>Remain Task</span>
          <strong>{{ remainTasks }}건</strong>
        </div>
      </div>
      <div class="vertical-line"></div>
      <div class="task-chart">
        <span class="task-title">프로젝트별 Task</span>
        <!-- <v-select class="select-year" v-model="selectedYear" :items="years" label="Year" variant="outlined"></v-select> -->
        <Bar class="chart" :options="chartOptions" :data="chartData" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import axiosInstance from '@/api/axiosInstance';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'MyPageCompo',
  components: { Bar },
  setup() {
    const chartData = ref({
      labels: [], // 프로젝트 이름
      datasets: [],
    });

    const chartOptions = {
      responsive: true,
      scales: {
        x: {
          ticks: {
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#333',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            // 정수만 표시하도록 설정
            callback: function (value) {
              if (Number.isInteger(value)) {
                return value;
              }
            },
          },
        },
      },
    };

    const totalTasks = ref(0);
    const endTasks = ref(0);
    const remainTasks = ref(0);

    // 전체 Task
    const selectAllTask = async () => {
      try {
        const response = await axiosInstance.get('/api/members/all-tasks');
        console.log(response.data.totalTask);
        console.log(response.data.endTask);
        console.log(response.data.remainTask);
        totalTasks.value = response.data.totalTask;
        endTasks.value = response.data.endTask !== null ? response.data.endTask : 0;
        remainTasks.value = response.data.remainTask !== null ? response.data.remainTask : 0;
      } catch (error) {
        console.error(error);
      }
    };

    // 프로젝트별 Task
    const selectProjectTask = async () => {
      try {
        const response = await axiosInstance.get('/api/members/project-tasks');
        const projectData = response.data;

        chartData.value = {
          labels: projectData.map((project) => project.projectName),
          datasets: [
            {
              label: 'Total Task',
              backgroundColor: '#e9e7fc',
              borderColor: '#c095e6',
              borderWidth: 2,
              data: projectData.map((project) => project.totalTask),
            },
            {
              label: 'End Task',
              backgroundColor: '#e2f9e4',
              borderColor: '#a0e4ab',
              borderWidth: 2,
              data: projectData.map((project) => project.endTask),
            },
            {
              label: 'Remain Task',
              backgroundColor: '#fce7e7',
              borderColor: '#edb9b9',
              borderWidth: 2,
              data: projectData.map((project) => project.remainTask),
            },
          ],
        };

        await nextTick();
      } catch (error) {
        console.error(error);
      }
    };

    onMounted(() => {
      selectAllTask();
      selectProjectTask();
    });

    return {
      chartData,
      chartOptions,

      totalTasks,
      endTasks,
      remainTasks,
    };
  },
};
</script>

<style scoped>
h1 {
  text-align: left;
}

.contains {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  height: 500px;
  border: 1.5px solid #6b9e9b;
  border-radius: 10px;
  background: #ffffff;
}

.progress-task {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 30%;
  padding: 20px;
}

.task-title {
  font-size: 25px;
  font-weight: bold;
}

.task-card {
  margin-top: 20px;
  height: 80px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.task-card span {
  font-size: 14px;
  color: #777777;
  font-weight: bold;
}

.task-card strong {
  font-size: 20px;
  margin-top: 5px;
}

/* 각 카드의 배경 색상 */
.total-task {
  background-color: #e9e7fc;
  border: 2px solid #c095e6;
}
.end-task {
  background-color: #e2f9e4;
  border: 2px solid #a0e4ab;
}
.remain-task {
  background-color: #fce7e7;
  border: 2px solid #edb9b9;
}

/* 라인 */
.vertical-line {
  height: 460px;
  margin-top: 20px;
  border-radius: 20px;
  border-left: 1px solid #6b9e9b;
}

/* task-chart는 오른쪽에 위치 */
.task-chart {
  width: 65%;
  padding: 20px;
}

.chart {
  margin-top: 20px;
  padding: 20px;
  width: 100%;
  min-height: 400px;
  max-height: 400px;
  border-radius: 10px;
  border: 1.5px solid #6b9e9b;
}
</style>
