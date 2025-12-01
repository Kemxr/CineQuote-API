<template>
  <nav class="navbar">
    <ul class="nav-list">
      <li
        v-for="item in items"
        :key="item.name"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="goTo(item.to)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.name }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = [
  { name: 'Accueil', icon: '🏠', to: '/' },
  { name: 'Explorer', icon: '🔍', to: '/explore' },
  { name: 'Favoris', icon: '♡', to: '/favorites' },
  { name: 'Quiz', icon: '🎯', to: '/quiz' },
  { name: 'Profil', icon: '👤', to: '/profile' }
]

const isActive = (path) => route.path === path

const goTo = (path) => {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 24px 18px;
  background: #050b1a;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: center;
  z-index: 40;
}

.nav-list {
  width: 100%;
  max-width: 520px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 56px;
  color: #9fa8c6;
  font-size: 11px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-icon {
  font-size: 18px;
}

.nav-item.active {
  color: #c4b5fd;
}

.nav-item.active .nav-label {
  font-weight: 600;
}

@media (min-width: 1024px) {
  .navbar {
    padding-inline: 32px;
  }
}
</style>