<template>
  <v-container fluid class="fill-height d-flex align-center justify-center pa-0">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="auto">
        <v-card class="pa-5 d-flex flex-column align-center justify-center text-center" rounded="xl" width="300" height="193" color="#e3f2fd">
          <h3 class="black--text mb-4">{{ message }}</h3>
          <v-row no-gutters class="d-flex justify-center">
            <!-- 이곳에 '아니오' 버튼이 들어갑니다 -->
            <!-- 이곳에 '네' 버튼이 들어갑니다 -->
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LogoutConfirmModal',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  methods: {},
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.d-flex {
  display: flex !important;
}

.align-center {
  align-items: center !important;
}

.justify-center {
  justify-content: center !important;
}

.text-center {
  text-align: center !important;
}

.pa-0 {
  padding: 0 !important;
}

.mb-4 {
  margin-bottom: 16px !important;
}

.black--text {
  color: black !important;
  margin-top: 30px;
}

.text-capitalize {
  text-transform: capitalize;
}
</style>
