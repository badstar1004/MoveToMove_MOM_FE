<template>
  <v-dialog v-model="internalDialog" persistent width="300">
    <v-card class="pa-5 d-flex flex-column align-center justify-center text-center" color="#e3f2fd" height="300" rounded="lg" width="300">
      <v-icon class="check-icon" size="130">mdi-check-circle</v-icon>
      <h2 class="mt-4">회원가입 완료!</h2>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'SignupCompleteModal',

  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      internalDialog: this.dialog,
    };
  },
  watch: {
    dialog(value) {
      this.internalDialog = value;
    },
    internalDialog(value) {
      this.$emit('update:dialog', value);
    },
  },
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

.mt-4 {
  margin-top: 16px;
}

.check-icon {
  color: #3897db !important; /* Vuetify의 성공 색상 */
}
</style>
