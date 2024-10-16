<template>
  <div class="message-card">
    <div class="message-content">{{ message }}</div>
    <div class="message-date">{{ date }}</div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.message-card {
  align-items: center;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #6b9e9b;
  border-radius: 10px;
  background-color: #ffffff;
}

.message-content {
  font-size: 10px;
  font-weight: bold;
  color: #000000;
  text-align: left;
}

.message-date {
  font-size: 8px;
  color: #000000;
  white-space: nowrap;
  text-align: right;
}
</style>
