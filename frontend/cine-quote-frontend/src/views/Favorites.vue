<template>
  <div class="favorites-page">
    <header class="favorites-header">
      <button type="button" class="back-button" @click="goBack" aria-label="Retour">
        <span class="back-icon">←</span>
        <span>Mes Favoris</span>
      </button>
    </header>

    <main class="favorites-content">
      <!-- Loading State -->
      <div v-if="loading" class="status-container">
        <div class="spinner"></div>
        <p class="status-text">Chargement de vos favoris...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="status-container">
        <p class="status-text status-text--error">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!favorites.length" class="empty-state">
        <div class="empty-icon">♡</div>
        <h2 class="empty-title">Aucun favori pour le moment</h2>
        <p class="empty-subtitle">Explorez des citations et ajoutez-les à vos favoris!</p>
        <router-link to="/explore" class="explore-btn">
          Découvrir des citations
        </router-link>
      </div>

      <!-- Favorites List -->
      <div v-else class="favorites-list">
        <div class="favorites-header-info">
          <p class="favorites-count">{{ favorites.length }} citation{{ favorites.length > 1 ? 's' : '' }}</p>
        </div>

        <article
          v-for="quote in favorites"
          :key="quote._id"
          class="quote-card-item"
        >
          <div class="quote-card-inner">
            <div class="quote-card-image-wrapper" v-if="quote.film?.image">
              <img
                class="quote-card-image"
                :src="quote.film.image"
                :alt="quote.film.title"
              />
            </div>

            <div class="quote-card-text-block">
              <p class="quote-card-text">"{{ quote.text }}"</p>
              <div class="quote-card-meta" v-if="quote.film">
                <span class="quote-card-film">{{ quote.film.title }}</span>
                <span class="quote-card-year">({{ quote.film.year }})</span>
              </div>
            </div>

            <button 
              class="quote-card-fav quote-card-fav--active" 
              type="button" 
              aria-label="Retirer des favoris"
              @click="removeFavorite(quote._id)"
            >
              ♥
            </button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const favorites = ref([]);
const loading = ref(false);
const error = ref(null);

// Fetch user's favorites
async function fetchFavorites() {
  try {
    loading.value = true;
    error.value = null;

    // Calls GET /api/favorites endpoint which uses:
    // - favoriteController.js: getFavorites() function
    // - This function retrieves user's favorite quotes from the database
    // - Populates the quote data including film information
    // - Returns: array of quote objects with film details
    
    const response = await fetch("/api/favorites", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Veuillez vous connecter pour voir vos favoris");
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    favorites.value = data || [];
  } catch (e) {
    console.error(e);
    error.value = e.message || "Impossible de charger vos favoris.";
  } finally {
    loading.value = false;
  }
}

// Remove a favorite
async function removeFavorite(quoteId) {
  try {
    // Calls DELETE /api/favorites endpoint which uses:
    // - favoriteController.js: removeFavorite() function
    // - This function removes the quote from user's favorites array
    // - Saves the updated user document
    
    const response = await fetch("/api/favorites", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ quoteId })
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du favori");
    }

    // Remove from local list
    favorites.value = favorites.value.filter(q => q._id !== quoteId);
  } catch (e) {
    console.error(e);
    error.value = e.message || "Erreur lors de la suppression du favori";
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 16px 100px;
  background: #050b1a;
  color: #f5f7ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.favorites-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
  padding-top: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border-radius: 0;
  border: none;
  background: transparent;
  color: #e5e7ff;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #a855ff;
}

.back-icon {
  font-size: 16px;
}

.favorites-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Status Container */
.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

.status-text {
  font-size: 14px;
  color: #9fa8c6;
  text-align: center;
}

.status-text--error {
  color: #fca5a5;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
  padding: 32px 24px;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #e5e7ff;
  margin: 0;
}

.empty-subtitle {
  font-size: 14px;
  color: #9fa8c6;
  margin: 0;
}

.explore-btn {
  margin-top: 16px;
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #a855ff 0%, #6366f1 100%);
  color: #f9fafb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
  box-shadow: 0 18px 40px rgba(88, 28, 135, 0.7);
}

.explore-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 24px 60px rgba(88, 28, 135, 0.9);
}

/* Favorites List */
.favorites-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorites-header-info {
  padding: 0 4px 8px;
}

.favorites-count {
  font-size: 13px;
  color: #9fa8c6;
  font-weight: 500;
  margin: 0;
}

/* Quote Card */
.quote-card-item {
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.9);
  padding: 18px 18px;
  min-height: 96px;
  transition: all 0.2s ease;
}

.quote-card-item:hover {
  background: rgba(15, 23, 42, 0.98);
  border-color: rgba(168, 85, 247, 0.3);
}

.quote-card-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.quote-card-image-wrapper {
  flex-shrink: 0;
  width: 90px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: #020617;
}

.quote-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.quote-card-text-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quote-card-text {
  font-size: 15px;
  font-weight: 500;
  color: #e5e7ff;
  margin-bottom: 6px;
  text-align: left;
}

.quote-card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: 13px;
  color: #9fa8c6;
}

.quote-card-film {
  font-weight: 500;
}

.quote-card-year {
  opacity: 0.9;
}

.quote-card-fav {
  border: none;
  background: transparent;
  color: #9fa8c6;
  cursor: pointer;
  font-size: 18px;
  margin-left: auto;
  transition: color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.quote-card-fav:hover {
  color: #fca5a5;
  transform: scale(1.2);
}

.quote-card-fav--active {
  color: #ef4444;
}

.quote-card-fav--active:hover {
  color: #fca5a5;
}

@media (min-width: 768px) {
  .favorites-page {
    padding: 24px 32px 100px;
  }

  .favorites-content {
    max-width: 960px;
    margin: 0 auto;
  }
}
</style>
