import { createPinia } from 'pinia';
import { useCommentStore } from './commentStore.js';
import { useFolderStore } from './folderStrore.js';
import { MemberStore } from './memberStore.js';
import { NavigationStore } from './navigationStore.js';
import { WebSocketStore } from './webSocketStore.js';

// Pinia 인스턴스 생성
const pinia = createPinia();

export { MemberStore, NavigationStore, pinia, useCommentStore, useFolderStore, WebSocketStore };
