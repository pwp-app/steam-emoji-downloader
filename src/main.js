import { createApp } from 'vue';
import { ElButton, ElInput, ElMessage } from 'element-plus';

import App from './App.vue';
import './styles/element-variable.scss';
import './styles/main.scss';

const app = createApp(App).mount('#app');

// element plus
const ElComponents = [ElButton, ElInput];
const ElPlugins = [ElMessage];
ElComponents.forEach((component) => {
  app.component(component.name, component);
});
ElPlugins.forEach((plugin) => {
  app.use(plugin);
});

// gif.js
if (window.GIF) {
  app.config.globalProperties.GIF = window.GIF;
}
