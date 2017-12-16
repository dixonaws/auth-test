<template>
  <div id="ProtectedContent">
    <h1>Protected Content Component</h1>
    <br>
    This component should be protected by a bucket policy in S3, maybe a 'protectedcomponents' folder<br/>
    {{this.message}}<br/>

    <p>Get an API key with IAM role from Cognito, use it to access the protected component (which in turn uses it to
      access API Gateway to GET/POST protected data)</p>
    <br/>

    So, protected API on a protected page/component

  </div>


</template>

<script>
  import {authService} from './main.js';

  export default {

    data() {
      message:
        return {
          message: 'this is protected data that could come from a protected API',

        }
    },

  }
</script>
