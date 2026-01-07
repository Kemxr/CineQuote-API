<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useEmotions } from "@/composables/useEmotions";

const router = useRouter();
const { getEmotionIcon: getEmotionEmoji } = useEmotions();

const favorites = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedQuote = ref(null);

async function fetchFavorites() {
  try {
    loading.value = true;
    error.value = null;

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

async function removeFavorite(quoteId) {
  try {
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

    favorites.value = favorites.value.filter(q => q._id !== quoteId);
    closeQuoteDetail();
  } catch (e) {
    console.error(e);
    error.value = e.message || "Erreur lors de la suppression du favori";
  }
}

function openQuoteDetail(quote) {
  selectedQuote.value = quote;
}

function closeQuoteDetail() {
  selectedQuote.value = null;
}

function goBack() {
  router.back();
}

onMounted(() => {
  fetchFavorites();
});
</script>

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
          @click="openQuoteDetail(quote)"
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
              @click.stop="removeFavorite(quote._id)"
            >
              ♥
            </button>
          </div>
        </article>

        <div class="explore-section">
          <router-link to="/explore" class="explore-btn-list">
            Découvrir plus de citations
          </router-link>
        </div>
      </div>
    </main>

    <!-- Modal Détail Citation -->
    <div v-if="selectedQuote" class="modal-overlay" @click="closeQuoteDetail">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeQuoteDetail" aria-label="Fermer">
          ✕
        </button>

        <div class="modal-header">
          <div class="modal-film-image" v-if="selectedQuote.film?.image">
            <img
              :src="selectedQuote.film.image"
              :alt="selectedQuote.film.title"
            />
          </div>
        </div>

        <div class="modal-body">
          <p class="modal-quote-text">"{{ selectedQuote.text }}"</p>

          <div v-if="selectedQuote.film" class="modal-film-info">
            <h2 class="modal-film-title">{{ selectedQuote.film.title }}</h2>
            <p class="modal-film-detail" v-if="selectedQuote.film.year">
              <span class="detail-label">Année :</span> {{ selectedQuote.film.year }}
            </p>
            <p class="modal-film-detail" v-if="selectedQuote.film.director">
              <span class="detail-label">Réalisateur :</span> {{ selectedQuote.film.director }}
            </p>
          </div>

          <div v-if="selectedQuote.emotion" class="modal-emotion">
            <span class="emotion-badge">{{ getEmotionEmoji(selectedQuote.emotion) }} {{ selectedQuote.emotion }}</span>
          </div>

          <button 
            class="modal-fav-btn modal-fav-btn--active"
            type="button"
            aria-label="Retirer des favoris"
            @click.stop="removeFavorite(selectedQuote._id)"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;    
  background: #050b1a;
  color: #f5f7ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.favorites-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 32px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-radius: 0;
  border: none;
  background: transparent;
  color: #dde3ff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
  letter-spacing: 0.04em;
  font-size: 24px;
}

.back-button:hover {
  color: #a78bfa;
}

.back-icon {
  font-size: 20px;
}

.favorites-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  flex: 1;
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
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #60a5fa;
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
  color: #f5f7ff;
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
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #f5f7ff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.explore-btn:hover {
  filter: brightness(1.1);
}

/* Favorites List */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.favorites-header-info {
  padding: 0 0 8px;
}

.favorites-count {
  font-size: 14px;
  color: #9fa8c6;
  font-weight: 500;
  margin: 0;
}

/* Quote Card */
.quote-card-item {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 16px;
  min-height: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.quote-card-item:active {
  transform: scale(0.98);
}

.quote-card-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.22);
}

.quote-card-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}

.quote-card-image-wrapper {
  flex-shrink: 0;
  width: 80px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
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
  min-width: 0;
}

.quote-card-text {
  font-size: 14px;
  font-weight: 500;
  color: #dde3ff;
  margin-bottom: 8px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
}

.quote-card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: 12px;
  color: #9fa8c6;
}

.quote-card-film {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 12px;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.6);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
}

@keyframes popIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: #dde3ff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.modal-close:active {
  background: rgba(255, 255, 255, 0.08);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
}

.modal-header {
  width: 100%;
  height: 220px;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
}

.modal-film-image {
  width: 100%;
  height: 100%;
}

.modal-film-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-body {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-quote-text {
  font-size: 18px;
  font-weight: 600;
  color: #f5f7ff;
  line-height: 1.5;
  margin: 0;
}

.modal-film-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-film-title {
  font-size: 16px;
  font-weight: 700;
  color: #f5f7ff;
  margin: 0;
}

.modal-film-detail {
  font-size: 13px;
  color: #9fa8c6;
  margin: 0;
  display: flex;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #a78bfa;
}

.modal-emotion {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 999px;
  color: #d8b4fe;
  font-size: 13px;
  font-weight: 600;
}

.modal-fav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: #dde3ff;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin: 6px auto 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.modal-fav-btn:active {
  transform: scale(0.95);
}

.modal-fav-btn:hover {
  color: #fca5a5;
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.08);
}

.modal-fav-btn--active {
  color: #ef4444;
}

.modal-fav-btn--active:hover {
  color: #fca5a5;
}

/* Explore Section */
.explore-section {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  margin-top: 16px;
}

.explore-btn-list {
  padding: 12px 24px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  color: #f5f7ff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.explore-btn-list:hover {
  filter: brightness(1.1);
}

.explore-btn-list:active {
  transform: translateY(0);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .favorites-page {
    padding: 20px 16px;
  }

  .favorites-header {
    margin-bottom: 24px;
  }

  .favorites-content {
    gap: 16px;
  }

  .favorites-list {
    gap: 12px;
  }

  .quote-card-item {
    padding: 12px;
    min-height: 90px;
  }

  .quote-card-image-wrapper {
    width: 70px;
    height: 90px;
    border-radius: 10px;
  }

  .quote-card-text {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .quote-card-meta {
    font-size: 11px;
    gap: 1px;
  }

  .quote-card-fav {
    font-size: 16px;
  }

  .back-button {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .favorites-page {
    padding: 16px;
    padding-bottom: 80px;
  }

  .favorites-header {
    margin-bottom: 20px;
  }

  .favorites-content {
    gap: 12px;
  }

  .favorites-list {
    gap: 10px;
  }

  .quote-card-item {
    padding: 10px;
    min-height: 80px;
  }

  .quote-card-inner {
    gap: 12px;
  }

  .quote-card-image-wrapper {
    width: 65px;
    height: 80px;
    border-radius: 8px;
  }

  .quote-card-text {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .quote-card-meta {
    font-size: 10px;
    gap: 0px;
  }

  .quote-card-fav {
    font-size: 15px;
  }

  .modal-header {
    height: 180px;
    border-radius: 20px 20px 0 0;
  }

  .modal-body {
    padding: 16px 12px;
    gap: 12px;
  }

  .modal-quote-text {
    font-size: 15px;
  }

  .modal-film-title {
    font-size: 14px;
  }

  .modal-film-detail {
    font-size: 11px;
  }

  .emotion-badge {
    font-size: 11px;
    padding: 4px 8px;
    gap: 3px;
  }

  .modal-fav-btn {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .explore-section {
    padding: 16px 0;
    margin-top: 10px;
  }

  .explore-btn-list {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>