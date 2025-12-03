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
          <span class="avatar-icon">👤</span>
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

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/services/api';

export default {
  name: 'ProfileView',
  setup() {
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

    const fetchUserProfile = async () => {
      try {
        loading.value = true;
        // Calls GET /api/auth/profile endpoint which uses:
        // - authController.js: getUserProfile() function
        // - This function retrieves user data from the database using User.findById()
        // - It excludes the password field for security
        // - Returns: { _id, name, email, role, createdAt }
        
        const response = await authAPI.getProfile();
        user.value = response.data;
        
        // TODO: Fetch actual stats and badges from API when available
        // REAL IMPLEMENTATION would be:
        // - Create new endpoints in authController.js:
        //   * getUserStats() - returns { favorites, moviesWatched, quotes }
        //   * getUserBadges() - returns array of unlocked badges with dates
        // - Call these endpoints to populate stats and badges
        
        stats.value = {
          favorites: 12,
          moviesWatched: 45,
          quotes: 128
        };
      } catch (err) {
        console.error('Error fetching profile:', err);
        user.value = null;
      } finally {
        loading.value = false;
      }
    };

    const handleLogout = async () => {
      try {
        await authAPI.logout();
        user.value = null;
        router.push('/login');
      } catch (err) {
        console.error('Logout error:', err);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    onMounted(() => {
      fetchUserProfile();
    });

    return {
      user,
      loading,
      stats,
      badges,
      handleLogout,
      formatDate
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.profile-page {
  min-height: 100vh;
  padding-bottom: 80px;
  background: radial-gradient(circle at 0% 0%, #3a5bff 0, transparent 45%),
              radial-gradient(circle at 100% 100%, #a855ff 0, transparent 45%),
              #050816;
  color: #f9fafb;
}

/* Header */
.profile-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.logout-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(239, 68, 68, 0.1);
  color: #fecaca;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
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
  border: 3px solid rgba(148, 163, 184, 0.25);
  border-top-color: #a855ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #9ca3af;
  font-size: 15px;
}

/* Profile Content */
.profile-content {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* User Card */
.user-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.75));
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: linear-gradient(135deg, #a855ff 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 40px;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #f9fafb;
}

.user-email {
  font-size: 14px;
  color: #9ca3af;
}

.user-role {
  font-size: 13px;
  color: #a855ff;
  font-weight: 600;
}

/* Details Section */
.details-section,
.stats-section,
.actions-section {
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.75));
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #f9fafb;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.detail-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.detail-value {
  font-size: 15px;
  color: #e5e7eb;
  font-weight: 500;
}

.active-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 4px 12px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.5);
  border-radius: 999px;
  color: #86efac;
  font-size: 13px;
  font-weight: 600;
}

.active-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #22c55e;
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
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
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
  color: #9ca3af;
  font-weight: 500;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #f9fafb;
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
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.badge-item:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2));
  border-color: rgba(168, 85, 247, 0.5);
  transform: translateY(-2px);
}

.badge-icon {
  font-size: 32px;
  display: block;
}

.badge-name {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
}

.badge-date {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}

.no-badges {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: #9ca3af;
  font-size: 14px;
}


/* Auth Container */
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 28px;
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.75));
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.85), 0 0 0 1px rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(24px);
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
  color: #f9fafb;
}

.auth-subtitle {
  font-size: 14px;
  color: #9ca3af;
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
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #a855ff 0%, #6366f1 100%);
  color: #f9fafb;
  box-shadow: 0 18px 40px rgba(88, 28, 135, 0.7);
}

.btn-primary:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 24px 60px rgba(88, 28, 135, 0.9);
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.15);
  color: #c4b5fd;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.25);
  border-color: rgba(168, 85, 247, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-content {
    padding: 20px 16px;
  }

  .user-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .details-grid,
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .header-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 16px;
  }

  .profile-content {
    padding: 16px;
    gap: 16px;
  }

  .user-card,
  .details-section,
  .stats-section,
  .actions-section {
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