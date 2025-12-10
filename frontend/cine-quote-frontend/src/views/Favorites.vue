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

<style scoped>
.favorites-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-bottom: 80px;
  background: #050b1a;
  color: #f5f7ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  align-items: center;
}

.favorites-header {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-start;
  padding-top: 12px;
  max-width: 960px;
  width: 100%;
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
  gap: 12px;
  width: 100%;
  max-width: 960px;
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
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
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
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.9);
  padding: 12px;
  min-height: 80px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quote-card-item:active {
  transform: scale(0.98);
}

.quote-card-item:hover {
  background: rgba(15, 23, 42, 0.98);
  border-color: rgba(168, 85, 247, 0.3);
}

.quote-card-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.quote-card-image-wrapper {
  flex-shrink: 0;
  width: 70px;
  height: 80px;
  border-radius: 10px;
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
  min-width: 0;
}

.quote-card-text {
  font-size: 13px;
  font-weight: 500;
  color: #e5e7ff;
  margin-bottom: 4px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
}

.quote-card-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  font-size: 11px;
  color: #9fa8c6;
}

.quote-card-film {
  font-weight: 500;
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
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.6);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #fecaca;
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
  background: rgba(239, 68, 68, 0.3);
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
}

.modal-header {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
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
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-quote-text {
  font-size: 16px;
  font-weight: 600;
  color: #e5e7ff;
  line-height: 1.5;
  margin: 0;
}

.modal-film-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-film-title {
  font-size: 15px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0;
}

.modal-film-detail {
  font-size: 12px;
  color: #9fa8c6;
  margin: 0;
  display: flex;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
  color: #c4b5fd;
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
  padding: 5px 10px;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 999px;
  color: #d8b4fe;
  font-size: 12px;
  font-weight: 600;
}

.modal-fav-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(248, 113, 113, 0.5);
  background: rgba(15, 23, 42, 0.8);
  color: #ef4444;
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
  border-color: rgba(248, 113, 113, 0.7);
}

.modal-fav-btn--active {
  color: #ef4444;
  border-color: rgba(248, 113, 113, 0.5);
}

.modal-fav-btn--active:hover {
  color: #fca5a5;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .favorites-page {
    padding: 12px;
    padding-bottom: 80px;
  }

  .favorites-header {
    margin-bottom: 10px;
    padding-top: 8px;
  }

  .favorites-content {
    gap: 10px;
  }

  .favorites-list {
    gap: 8px;
  }

  .quote-card-item {
    padding: 10px;
    min-height: 76px;
  }

  .quote-card-image-wrapper {
    width: 65px;
    height: 75px;
    border-radius: 8px;
  }

  .quote-card-text {
    font-size: 12px;
    margin-bottom: 3px;
  }

  .quote-card-meta {
    font-size: 10px;
    gap: 0px;
  }

  .quote-card-fav {
    font-size: 15px;
  }

  .modal-header {
    height: 150px;
    border-radius: 16px 16px 0 0;
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
}

@media (min-width: 768px) {
  .favorites-page {
    padding: 24px 32px;
    padding-bottom: 32px;
  }

  .favorites-header {
    padding-top: 16px;
    margin-bottom: 16px;
  }

  .favorites-content {
    gap: 16px;
    max-width: 960px;
    margin: 0 auto;
  }

  .favorites-list {
    gap: 12px;
  }

  .quote-card-item {
    padding: 16px;
    min-height: 90px;
  }

  .quote-card-image-wrapper {
    width: 85px;
    height: 95px;
  }

  .quote-card-text {
    font-size: 15px;
  }

  .quote-card-meta {
    font-size: 13px;
  }

  .modal-content {
    border-radius: 24px;
    max-height: 85vh;
  }

  .modal-header {
    height: 220px;
    border-radius: 24px 24px 0 0;
  }

  .modal-body {
    padding: 24px 20px;
    gap: 16px;
  }

  .modal-quote-text {
    font-size: 18px;
  }

  .modal-film-title {
    font-size: 16px;
  }

  .modal-fav-btn {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}

/* Explore Section */
.explore-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  margin-top: 12px;
}

.explore-btn-list {
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

.explore-btn-list:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 24px 60px rgba(88, 28, 135, 0.9);
}

.explore-btn-list:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .explore-section {
    padding: 16px 0;
    margin-top: 10px;
  }

  .explore-btn-list {
    padding: 10px 20px;
    font-size: 13px;
  }
}

@media (min-width: 768px) {
  .explore-section {
    padding: 24px 0;
    margin-top: 16px;
  }

  .explore-btn-list {
    padding: 14px 28px;
    font-size: 15px;
  }
}
</style>