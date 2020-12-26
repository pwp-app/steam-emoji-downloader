import { createApp } from 'vue';
import axios from 'axios';
import {
  ElButton,
  ElInput,
  ElMessage,
  ElRadioButton,
  ElRadioGroup,
} from 'element-plus';

import App from './App.vue';
import './styles/element-variable.scss';
import './styles/main.scss';

const app = createApp(App);

// element plus
const ElComponents = [ElButton, ElInput, ElRadioButton, ElRadioGroup];
const ElPlugins = [ElMessage];
ElComponents.forEach((component) => {
  app.component(component.name, component);
});
ElPlugins.forEach((plugin) => {
  app.use(plugin);
});

// axios
app.config.globalProperties.axios = axios;

// gif.js
if (window.GIF) {
  app.config.globalProperties.GIF = window.GIF;
}

app.mount('#app');
