import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';

//这个按需引入的时候也需要导入样式才生效（虽然文档没引入）
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app')
