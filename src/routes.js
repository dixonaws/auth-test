//import components
import Home from './Home.vue'
import ProtectedContent from './ProtectedContent.vue'
import {authService} from './main';

export const routes = [
  {
    path: '',
    component: Home
  },
  {
    path: '/ProtectedContent',
    component: ProtectedContent,
    beforeEnter(to, from, next) {
      if (authService.cognitoUser==null) {
        alert('You must be logged in');
        return next(false);
      }
      next();

    }
  } // ProtectedContent


] // routes

