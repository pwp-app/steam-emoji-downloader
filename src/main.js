import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import axios from 'axios';
import {
  ElButton,
  ElInput,
  ElMessage,
  ElRadioButton,
  ElRadioGroup,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
} from 'element-plus';
import i18nMessages from './constants/i18n'
import App from './App.vue';
import './styles/element-variable.scss';
import './styles/main.scss';

const app = createApp(App);

// element plus
const ElComponents = [ElButton, ElInput, ElRadioButton, ElRadioGroup, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon];
const ElPlugins = [ElMessage];
ElComponents.forEach((component) => {
  app.component(component.name, component);
});
ElPlugins.forEach((plugin) => {
  app.use(plugin);
});

// axios
app.config.globalProperties.axios = axios;

// i18n
const lang = navigator.language.split('-')[0];
const i18n = createI18n({
  locale: lang,
  fallbackLocale: 'en',
  messages: i18nMessages,
});

// gif.js
if (window.GIF) {
  app.config.globalProperties.GIF = window.GIF;
}

app.use(i18n);
app.mount('#app');
