import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from './src/components/Auth/LoginForm.vue';
import HomeView from './src/views/HomeView.vue';
import RegisterForm from './src/components/Auth/RegisterForm.vue';
import Explore from './src/views/Explore.vue';
import Favorites from './src/views/Favorites.vue';
import Profile from './src/views/Profile.vue';
import Quiz from './src/views/Quiz.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'LoginForm',
    component: LoginForm
  },
  {
    path: '/register',
    name: 'RegisterForm',
    component: RegisterForm
  },
  {
    path: '/explore',
    name: 'Explore',
    component: Explore
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: Quiz
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;