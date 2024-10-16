import { createApp } from 'vue';
import App from './App.vue';

import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
import router from './router/index';

import RoundButtonItem from './components/common/item/RoundButtonItem.vue';

// Pinia 인스턴스 생성
const pinia = createPinia();
pinia.use(piniaPersist);

// Vuetify 설정
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles'; // Vuetify 스타일 가져오기

// Vuetify 인스턴스 생성
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(fas, far);

// VMdEditor
import VMdEditor from '@kangc/v-md-editor';
import koKR from '@kangc/v-md-editor/lib/lang/ko-KR'; // 한국어 로케일 적용
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// 테마 사용
VMdEditor.use(githubTheme);
VMdPreview.use(githubTheme);

// 한국어 설정
VMdEditor.lang.use('ko-KR', koKR);

// Vue 애플리케이션 생성 및 Pinia 적용
createApp(App)
  .use(pinia) // Pinia를 애플리케이션에 적용
  .use(vuetify) //vuetify 적용
  .use(router) // router 적용
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('round-button-item', RoundButtonItem) // RoundButtonItem 컴포넌트 등록
  .use(VMdEditor)
  .use(VMdPreview)
  .mount('#app'); // 애플리케이션을 DOM에 마운트
