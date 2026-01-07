<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/services/api';

const router = useRouter();
const user = ref(null);
const loading = ref(true);
const stats = ref({
  favorites: 0,
  moviesWatched: 0,
  quotes: 0
});

const badges = ref([
  {
    id: 1,
    name: 'Cinéphile',
    icon: '🎬',
    description: 'Regardez 10 films',
    unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'Collectionneur',
    icon: '❤️',
    description: 'Ajoutez 5 favoris',
    unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'Maître du Quiz',
    icon: '🏆',
    description: 'Complétez 3 quiz',
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]);

async function fetchUserProfile() {
  try {
    loading.value = true;
    const response = await authAPI.getProfile();
    user.value = response.data;
    
    await fetchFavoritesCount();
    
    stats.value.moviesWatched = 45;
    stats.value.quotes = 158;
  } catch (err) {
    console.error('Error fetching profile:', err);
    user.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchFavoritesCount() {
  try {
    const response = await fetch('/api/favorites', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      stats.value.favorites = data.length || 0;
    } else {
      stats.value.favorites = 0;
    }
  } catch (err) {
    console.error('Error fetching favorites count:', err);
    stats.value.favorites = 0;
  }
}

async function handleLogout() {
  try {
    await authAPI.logout();
    user.value = null;
    router.push('/login');
  } catch (err) {
    console.error('Logout error:', err);
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

onMounted(() => {
  fetchUserProfile();
  window.addEventListener('favoriteUpdated', fetchFavoritesCount);
});

onUnmounted(() => {
  window.removeEventListener('favoriteUpdated', fetchFavoritesCount);
});
</script>

<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="profile-header">
      <div class="header-content">
        <h1 class="header-title">Mon Profil</h1>
        <button v-if="user" @click="handleLogout" class="logout-btn" aria-label="Déconnexion">
          <span class="logout-icon">🚪</span>
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <!-- Authenticated User Profile -->
    <main v-else-if="user" class="profile-content">
    <!-- User Card -->
    <section class="user-card">
      <div class="user-avatar">
        <span class="avatar-icon">{{ user.name.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ user.name }}</h2>
        <p class="user-email">{{ user.email }}</p>
        <p class="user-role">{{ user.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}</p>
      </div>
    </section>

      <!-- User Details -->
      <section class="details-section">
        <h3 class="section-title">Informations</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Membre depuis</span>
            <span class="detail-value">{{ formatDate(user.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Statut</span>
            <span class="detail-value active-badge">Actif</span>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <h3 class="section-title">Statistiques</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">❤️</div>
            <div class="stat-info">
              <p class="stat-label">Favoris</p>
              <p class="stat-value">{{ stats.favorites }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎬</div>
            <div class="stat-info">
              <p class="stat-label">Films vus</p>
              <p class="stat-value">{{ stats.moviesWatched }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✨</div>
            <div class="stat-info">
              <p class="stat-label">Citations</p>
              <p class="stat-value">{{ stats.quotes }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Badges Section -->
      <section class="badges-section">
        <h3 class="section-title">Badges & Réalisations</h3>
        <div class="badges-grid">
          <div v-for="badge in badges" :key="badge.id" class="badge-item" :title="badge.description">
            <div class="badge-icon">{{ badge.icon }}</div>
            <p class="badge-name">{{ badge.name }}</p>
            <p class="badge-date">{{ formatDate(badge.unlockedAt) }}</p>
          </div>
        </div>
        <p v-if="badges.length === 0" class="no-badges">Aucun badge pour le moment. Continuez à jouer pour en débloquer!</p>
      </section>
    </main>

    <!-- Not Authenticated -->
    <main v-else class="auth-container">
      <div class="auth-card">
        <div class="auth-icon">🎬</div>
        <h2>Connectez-vous à votre profil</h2>
        <p class="auth-subtitle">Accédez à vos favoris et vos statistiques personnelles</p>
        
        <div class="auth-buttons">
          <router-link to="/login" class="btn btn-primary">
            Se connecter
          </router-link>
          <router-link to="/register" class="btn btn-secondary">
            S'inscrire
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  background: #050b1a;
  color: #f5f7ff;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.logout-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #dde3ff;
  font-size: 16px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #9fa8c6;
  font-size: 14px;
}

/* Profile Content */
.profile-content {
  max-width: 1040px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

/* User Card */
.user-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  align-items: flex-start;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 48px;
  font-weight: 700;
  color: #f5f7ff;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  text-align: left;
  padding-top: 8px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #f5f7ff;
  margin: 0;
}

.user-email {
  font-size: 14px;
  color: #9fa8c6;
  margin: 0;
}

.user-role {
  font-size: 14px;
  color: #a78bfa;
  font-weight: 600;
  margin: 0;
}

/* Details Section */
.details-section,
.stats-section,
.badges-section {
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #f5f7ff;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-label {
  font-size: 12px;
  color: #9fa8c6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.detail-value {
  font-size: 15px;
  color: #dde3ff;
  font-weight: 500;
}

.active-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  padding: 4px 12px;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.5);
  border-radius: 999px;
  color: #a7f3d0;
  font-size: 13px;
  font-weight: 600;
  margin: 0 auto;
}

.active-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
}

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #9fa8c6;
  font-weight: 500;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #f5f7ff;
}

/* Badges Section */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-item:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.5);
  transform: translateY(-2px);
}

.badge-icon {
  font-size: 32px;
  display: block;
}

.badge-name {
  font-size: 13px;
  font-weight: 600;
  color: #dde3ff;
  text-align: center;
}

.badge-date {
  font-size: 11px;
  color: #9fa8c6;
  text-align: center;
}

.no-badges {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: #9fa8c6;
  font-size: 14px;
}

/* Auth Container */
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  text-align: center;
}

.auth-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.auth-card h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #f5f7ff;
}

.auth-subtitle {
  font-size: 14px;
  color: #9fa8c6;
  margin-bottom: 24px;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 12px 14px;
  border-radius: 999px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #f5f7ff;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.04);
  color: #a78bfa;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 20px 16px;
  }

  .profile-content {
    gap: 16px;
  }

  .user-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .details-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 16px;
  }

  .profile-content {
    padding: 0;
    gap: 16px;
  }

  .user-card,
  .details-section,
  .stats-section,
  .badges-section {
    padding: 16px;
    border-radius: 16px;
  }

  .user-avatar {
    width: 60px;
    height: 60px;
  }

  .avatar-icon {
    font-size: 30px;
  }

  .user-name {
    font-size: 18px;
  }

  .section-title {
    font-size: 14px;
  }

  .stat-value {
    font-size: 18px;
  }

  .auth-card {
    padding: 28px 20px;
  }
}
</style>