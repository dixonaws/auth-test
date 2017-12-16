<template>
  <div id="app">


    <button v-if="auth.isLoggedIn" class="btn" @click="logout()">Log Out</button>
    <button v-else class="btn" @click="auth.isLoggedIn=true">Log In</button>
    <p></p>

    Logged in: {{ auth.isLoggedIn }}
    <br/><br/>

    <router-link to="/">Home</router-link> &nbsp;|&nbsp;
    <router-link to="/ProtectedContent">Go to Protected Content</router-link>
    <hr>

    <router-view></router-view>

  </div>
</template>

<script>
  import {eventBus} from './main';
  import {authService} from './main';

  export default {
    name: 'app',
    data() {
      return {
        auth: authService,
      }
    },

    methods: {
      logout() {
        // logout and navigate to the homepage
        this.auth.isLoggedIn=false;
        this.$router.push('/');
      }
    }
  }
</script>

