import { createApp } from 'vue';
// @ts-ignore
import App from './App.vue';
import router from './router';
import WebsocketService from "./lib/WebsocketService";
import './assets/main.css';

const app = createApp(App)
app.provide('websocketService', WebsocketService);
app.use(router)
app.mount('#app')
