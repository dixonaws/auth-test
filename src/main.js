import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import {routes} from './routes.js'

export const eventBus = new Vue();
export const authService = {isLoggedIn: false};

Vue.use(VueRouter);

const router = new VueRouter({
  routes: routes,
  mode: 'hash',
});

new Vue({
  el: '#app',
  render: h => h(App),
  router: router,
  watch: {
    isLoggedIn: function (query) {
      alert('(main.js): query: ' + query + ', should redirect to Home...');
    }
  }

})
;
