<template>
  <div id="app">

    <h3>User login</h3>
    Status:
    <div v-if="authService.cognitoUser!=null">{{ authService.cognitoUser.getUsername() }}</div>
    <div v-else-if="authService.cognitoUser==null">(No user logged in)</div>

    Username: <input type="text" size="20" v-model="username"><br>
    Password: <input type="password" size="20" v-model="password"><br>

    <button v-if="authService.cognitoUser!=null" class="btn" @click="logout()">Log Out</button>
    <button v-else class="btn" @click="login()">Log In</button>

    <br/><br/>

    <button id="callMyApi" @click="callMyApi()">Call myApi</button>
    <textarea rows="20" cols="30" id="myApiResult"/>
    <hr/>

    <h3>New user registration</h3>
    You may want to make use of <a href="http://www.guerillamail.com">www.guerillamail.com</a> to get a temporary email
    address<br/>
    Username: <input type="text" size="20" v-model="newUsername"><br>
    Password: <input type="password" size="20" v-model="newPassword"><br>
    Email: <input type="text" size="20" v-model="newEmail"><br>
    Phone number: <input type="text" size="20" v-model="newPhoneNumber"><br>

    <button @click="register()">Register</button>
    <br/><br/>
    Confirmation code: <input type="text" size="20" v-model="confirmationCode"><br>
    <button @click="confirm()">Confirm</button>
    <br/><br/>

    IdToken:
    <textarea rows="20" cols="150" v-model='authService.idToken' id="idToken"></textarea>
    <br/>

    RefreshToken:
    <textarea rows="20" cols="150" v-model='authService.refreshToken' id="refreshToken"></textarea>
    <br/>

    SessionToken:
    <textarea rows="20" cols="150" v-model='authService.sessionToken' id="sessionToken"></textarea>

    <br/>
    AccessKeyId: {{authService.accessKeyId}}
    <br/>
    SecretAccessKey: {{authService.secretAccessKey}}


    <br/>
    <br/>

    <router-link to="/">Home</router-link> &nbsp;|&nbsp;
    <router-link to="/ProtectedContent">Go to Protected Content</router-link>
    <hr>

    <router-view></router-view>

  </div>
</template>

<script>
  import {eventBus} from './main';
  import {authService} from './main';
  import AWS from 'aws-sdk';
  import {CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';


  export default {
    name: 'app',
    data() {
      return {
        authService: authService,
        username: '',
        password: '',
        newUsername: '',
        newPassword: '',
        confirmationCode: '',
        newPhoneNumber: '',
        newEmail: '',
        loggedInUsername: '',
        myApiResult: {
          get() {
            return (this.$store.state.myApiResult.data.hello)
          }
        },
      }
    },

    computed: {
      // loggedInUsername() {
      //   return authService.session.idToken.payload.email;
      // }
    },

    mounted() {
      console.log('Mounted lifecycle hook fired.');

      this.loadAuthenticatedUser();

    },

    methods: {
      callMyApi() {
        console.log("callMyApi(): ");

        var apigClient = apigClientFactory.newClient({
          accessKey: authService.accessKeyId,
          secretKey: authService.secretAccessKey,
          sessionToken: authService.sessionToken,
        });

        var params = {
          // This is where any header, path, or querystring request params go. The key is the parameter named as defined in the API

        };
        var body = {
          // This is where you define the body of the request
        };
        var additionalParams = {
          // If there are any unmodeled query parameters or headers that need to be sent with the request you can add them here
          headers: {},
          queryParams: {}
        };

        apigClient.rootGet(params, body, additionalParams)
          .then(function (result) {
            // This is where you would put a success callback

            document.getElementById('myApiResult').innerHTML = JSON.stringify(result.data)
            //console.log('result/success callback: ' + JSON.stringify(result))

          }).catch(function (result) {
          // This is where you would put an error callback

          document.getElementById('myApiResult').innerHTML = JSON.stringify(result)

        });

      },

      login() {
        console.log('Logging in (' + this.username + ')... ');

        var authenticationData = {
          Username: this.username,
          Password: this.password
        };

        var authenticationDetails = new AuthenticationDetails(authenticationData);

        // poolData is stored application wide in the authService object
        authService.userPool = new CognitoUserPool(authService.poolData);

        var userData = {
          Username: this.username,
          Pool: authService.userPool
        };

        authService.cognitoUser = new CognitoUser(userData);

        authService.cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
            authService.cognitoUserSession = result;

            console.log("Loading Auth User...");
            console.log('authService.cognitoUserSession: ' + authService.cognitoUserSession)

            //var userPool = new CognitoUserPool(poolData);
            var cognitoUser = authService.cognitoUser;

            if (cognitoUser == null) {
              console.log('No user signed in');

            }
            if (cognitoUser != null) {
              cognitoUser.getSession(function (err, session) {
                if (err) {
                  alert(err);
                  return;
                }

                // store the session locally in the authService
                authService.session = session;
                authService.idToken = session.getIdToken().getJwtToken();
                authService.refreshToken = session.getRefreshToken().token;

                console.log('session email: ' + session.idToken.payload.email);

                var creds = new AWS.CognitoIdentityCredentials({
                  IdentityPoolId: 'us-east-1:53a5acb4-864b-4270-88e7-6b9788fa3b9d', // your identity pool id here
                  Logins: {
                    // Change the key below according to the specific region your user pool is in.
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_bHuZZvRnP': session.getIdToken().getJwtToken()
                  }
                }, {
                  region: "us-east-1"
                });

                creds.refresh(function (err, data) {
                  if (err) console.log(err)
                  else {
                    // store the tokens locally in the authService
                    authService.sessionToken = creds.sessionToken;
                    authService.accessKeyId = creds.accessKeyId;
                    authService.secretAccessKey = creds.secretAccessKey;

                    // AWS.config.credentials
                    // var s3 = new AWS.S3();

                  }
                }); // creds.refresh

              }); //cognitoUser.getSession
            }


          },

          onFailure: function (err) {
            console.error(err);
          }
        });

      },

      logout() {
        // logout and navigate to the homepage
        console.log('Logging out (' + authService.cognitoUser.getUsername() + ')...')

        authService.cognitoUser.signOut();

        // destroy the global cognitoUser one it has been signed out of Cognito
        authService.cognitoUserSession = null;
        authService.cognitoUser = null;
        authService.idToken = '';
        authService.refreshToken = '';
        authService.sessionToken = '';
        authService.accessKeyId = '';
        authService.secretAccessKey = '';

        this.$router.push('/');
      },

      loadAuthenticatedUser() {
        console.log("Loading Auth User...");
        console.log('authService.cognitoUserSession: ' + authService.cognitoUserSession)

        //var userPool = new CognitoUserPool(poolData);
        var cognitoUser = authService.cognitoUser;

        if (cognitoUser == null) {
          console.log('No user signed in');

        }
        if (cognitoUser != null) {
          cognitoUser.getSession(function (err, session) {
            if (err) {
              alert(err);
              return;
            }
            console.log(session);
            console.log(session.idToken.payload.email + ' is logged in')
            console.log(cognitoUser.getUsername() + ' is logged in')
            console.log('session validity: ' + session.isValid());
            console.log('ID token: ' + session.getIdToken().getJwtToken());

            var creds = new AWS.CognitoIdentityCredentials({
              IdentityPoolId: 'us-east-1:53a5acb4-864b-4270-88e7-6b9788fa3b9d', // your identity pool id here
              Logins: {
                // Change the key below according to the specific region your user pool is in.
                'cognito-idp.us-east-1.amazonaws.com/us-east-1_bHuZZvRnP': session.getIdToken().getJwtToken()
              }
            }, {
              region: "us-east-1"
            });

            console.log('Credentials from Cognito Federated Identity: ' + creds)

            creds.refresh(function (err, data) {
              if (err) console.log(err)
              else {
                console.log('data: ' + data)
                console.log('refreshed creds' + creds);
                console.log('accessKey: ' + creds.accessKeyId);
                console.log('secret key: ' + creds.secretAccessKey);
                console.log('session token: ' + creds.sessionToken);


                AWS.config.credentials
                var s3 = new AWS.S3();


              }
            }); // creds.refresh

          }); //cognitoUser.getSession
        }

      }, // loadAuthenticatedUser()

      register() {
        var userPool = new CognitoUserPool(authService.poolData);

        var attributeList = [];

        var dataEmail = {
          Name: 'email',
          Value: this.newEmail
        };

        var dataPhoneNumber = {
          Name: 'phone_number',
          Value: this.newPhoneNumber
        };
        var attributeEmail = new CognitoUserAttribute(dataEmail);
        var attributePhoneNumber = new CognitoUserAttribute(dataPhoneNumber);

        attributeList.push(attributeEmail);
        attributeList.push(attributePhoneNumber);

        console.log('Register User ' + this.newUsername + ', ' + this.newPhoneNumber + ', ' + this.newEmail + '... ');
        userPool.signUp(this.newUsername, this.newPassword, attributeList, null, function (err, result) {
          if (err) {
            console.error(err);
          } else {
            var cognitoUser = result.user;

            console.log('user registered as ' + cognitoUser.getUsername());
          }
        });

      }, // register()

      confirm() {
        var userPool = new CognitoUserPool(authService.poolData);

        var userData = {
          Username: this.newUsername,
          Pool: userPool
        };


        var cognitoUser = new CognitoUser(userData);

        console.log("Confirming user: " + userData + ", code: " + this.confirmationCode)

        cognitoUser.confirmRegistration(this.confirmationCode, true, function (err, result) {
          if (err) {
            console.log(err);
            return;
          }
          console.log('confirm(): call result: ' + result);
        });
      }

    } // methods
  }
</script>

