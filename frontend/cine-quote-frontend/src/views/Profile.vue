<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/services/api';

const router = useRouter();
const user = ref(null);
const loading = ref(true);
const favoriteCount = ref(0);

const favoriteFilms = ref([]);
const selectedFilm = ref(null);
const isModalOpen = ref(false);

async function fetchUserProfile() {
  try {
    loading.value = true;
    const response = await authAPI.getProfile();
    user.value = response.data;
    
    await fetchFavorites();
  } catch (err) {
    console.error('Error fetching profile:', err);
    user.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchFavorites() {
  try {
    const response = await fetch('/api/favorites', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const favoriteQuotes = await response.json();
      favoriteCount.value = favoriteQuotes.length || 0;
      
      // Extraire les films uniques des citations favorites
      const filmsMap = new Map();
      favoriteQuotes.forEach(quote => {
        if (quote.film && !filmsMap.has(quote.film._id)) {
          filmsMap.set(quote.film._id, quote.film);
        }
      });
      
      favoriteFilms.value = Array.from(filmsMap.values());
    } else {
      favoriteFilms.value = [];
      favoriteCount.value = 0;
    }
  } catch (err) {
    console.error('Error fetching favorites:', err);
    favoriteFilms.value = [];
    favoriteCount.value = 0;
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

function openFilmModal(film) {
  selectedFilm.value = film;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  setTimeout(() => {
    selectedFilm.value = null;
  }, 300);
}

function goToFilm(filmId) {
  closeModal();
  router.push(`/films/${filmId}`);
}

onMounted(() => {
  fetchUserProfile();
  window.addEventListener('favoriteUpdated', fetchFavorites);
});

onUnmounted(() => {
  window.removeEventListener('favoriteUpdated', fetchFavorites);
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
          <div class="detail-item">
            <span class="detail-label">Citations Favorites</span>
            <span class="detail-value favorite-count">
              <span class="favorite-icon">❤️</span>
              {{ favoriteCount }}
            </span>
          </div>
        </div>
      </section>

      <!-- Favorite Films Section -->
      <section class="favorites-section">
        <h3 class="section-title">Films Favoris</h3>
        <div v-if="favoriteFilms.length > 0" class="films-grid">
          <div 
            v-for="film in favoriteFilms" 
            :key="film._id" 
            class="film-card"
            @click="openFilmModal(film)"
            :title="film.title"
          >
            <img 
              :src="film.image || '/placeholder-film.jpg'" 
              :alt="film.title"
              class="film-poster"
            />
          </div>
        </div>
        <p v-else class="no-favorites">
          Aucun film favori pour le moment. Ajoutez des citations en favoris pour voir les films associés ici!
        </p>
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

    <!-- Film Modal -->
    <Transition name="modal">
      <div v-if="isModalOpen && selectedFilm" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal" aria-label="Fermer">✕</button>
          <div class="modal-poster-container">
            <img 
              :src="selectedFilm.image || '/placeholder-film.jpg'" 
              :alt="selectedFilm.title"
              class="modal-poster"
            />
          </div>
          <div class="modal-info">
            <h3 class="modal-title">{{ selectedFilm.title }}</h3>
            <p class="modal-details">
              <span>{{ selectedFilm.year }}</span>
              <span class="separator">•</span>
              <span>{{ selectedFilm.director }}</span>
            </p>
            <p class="modal-genre">{{ selectedFilm.genre }}</p>
            <button class="btn btn-primary modal-btn" @click="router.push('/explore')">
              Voir les citations
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
.favorites-section {
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

.favorite-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  font-weight: 700;
}

.favorite-icon {
  font-size: 20px;
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

/* Favorite Films Section */
.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.film-card {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.film-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.film-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-favorites {
  text-align: center;
  padding: 40px 20px;
  color: #9fa8c6;
  font-size: 14px;
  line-height: 1.6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 11, 26, 0.92);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #f5f7ff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: rotate(90deg);
}

.modal-poster-container {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #f5f7ff;
  margin: 0;
}

.modal-details {
  font-size: 14px;
  color: #9fa8c6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.separator {
  color: #5a6489;
}

.modal-genre {
  font-size: 13px;
  color: #a78bfa;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-btn {
  margin-top: 8px;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
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

  .details-grid {
    grid-template-columns: 1fr;
  }

  .films-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .header-title {
    font-size: 20px;
  }

  .modal-content {
    max-width: 380px;
  }

  .modal-title {
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
  .favorites-section {
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

  .films-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .auth-card {
    padding: 28px 20px;
  }

  .modal-content {
    padding: 20px;
    max-width: 320px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-details {
    font-size: 13px;
  }
}
</style>