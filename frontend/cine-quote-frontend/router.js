import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from './src/components/Auth/LoginForm.vue';
import HomeView from './src/views/HomeView.vue';
import RegisterForm from './src/components/Auth/RegisterForm.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;