import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import {routes} from './routes.js'
import aws from 'aws-sdk'
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import AWS from 'aws-sdk';
import {CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';


export const eventBus = new Vue();
export const authService = {
  cognitoUser: null,
  userPool: null,
  poolData: {
    UserPoolId: 'us-east-1_bHuZZvRnP', // Your user pool id here
    ClientId: '6cjvmiblhcrl2dlvlv2ptd00lg' // Your client id here
  },
  cognitoUserSession: null,
  accessKeyId: null,
  secretAccessKey: null,
  sessionToken: null,
  idToken:null,
  refreshToken:'',
  session: null

};

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueResource);

const router = new VueRouter({
  routes: routes,
  mode: 'hash',
});

const store = new Vuex.Store({
  state: {
    myApiResult: '',
  } // state

});


new Vue({
  el: '#app',
  store: store,
  router: router,
  render: h => h(App),

  watch: {}

});
