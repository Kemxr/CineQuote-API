<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFavorites } from "@/composables/useFavorites";
import { useEmotions } from "@/composables/useEmotions";

const router = useRouter();
const { favorites, fetchFavorites, isFavorite, toggleFavorite } = useFavorites();
const { emotions, getEmotionIcon: getEmotionEmoji } = useEmotions();

const search = ref("");
const selectedEmotion = ref("tout");
const quotes = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedQuote = ref(null);

async function fetchQuotes() {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      limit: 100,
    };

    // N'ajouter le filtre émotion que si ce n'est pas "tout"
    if (selectedEmotion.value !== "tout") {
      params.emotion = selectedEmotion.value;
    }

    if (search.value.trim()) {
      params.text = search.value.trim();
    }

    const query = new URLSearchParams(params).toString();
    const response = await fetch(`/api/quotes?${query}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    quotes.value = data.items || [];
  } catch (e) {
    console.error(e);
    error.value = "Impossible de charger les citations.";
  } finally {
    loading.value = false;
  }
}

function selectEmotion(id) {
  selectedEmotion.value = id;
}

function openQuoteDetail(quote) {
  selectedQuote.value = quote;
}

function closeQuoteDetail() {
  selectedQuote.value = null;
}

let searchTimeout = null;

watch([selectedEmotion, search], () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchQuotes();
  }, 300);
});

onMounted(() => {
  fetchFavorites();
  fetchQuotes();
});
</script>

<template>
  <div class="explore-page">
    <header class="explore-header">
      <button type="button" class="back-button" @click="goBack" aria-label="Retour">
        <span class="back-icon">←</span>
        <span>Explorer</span>
      </button>
    </header>

    <main class="explore-content">
      <!-- Barre de recherche -->
      <div class="search-wrapper">
        <input
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Rechercher une citation..."
        />
      </div>

      <!-- Filtres d'émotions -->
      <div class="filters-row">
        <button
          v-for="emotion in emotions"
          :key="emotion.id"
          type="button"
          class="filter-chip"
          :class="{ 'filter-chip--active': selectedEmotion === emotion.id }"
          @click="selectEmotion(emotion.id)"
        >
          <span class="chip-icon">{{ emotion.icon }}</span>
          <span>{{ emotion.label }}</span>
        </button>
      </div>

      <!-- Liste des citations -->
      <div class="quotes-list">
        <p v-if="loading" class="status-text">Chargement des citations...</p>
        <p v-else-if="error" class="status-text status-text--error">{{ error }}</p>
        <p v-else-if="!quotes.length" class="status-text">Aucune citation trouvée.</p>

        <article
          v-for="quote in quotes"
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
              :class="['quote-card-fav', { 'quote-card-fav--active': isFavorite(quote._id) }]"
              type="button" 
              :aria-label="isFavorite(quote._id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              @click.stop="toggleFavorite(quote._id)"
            >
              {{ isFavorite(quote._id) ? '♥' : '♡' }}
            </button>
          </div>
        </article>
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
            :class="['modal-fav-btn', { 'modal-fav-btn--active': isFavorite(selectedQuote._id) }]"
            type="button"
            :aria-label="isFavorite(selectedQuote._id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
            @click.stop="toggleFavorite(selectedQuote._id)"
          >
            {{ isFavorite(selectedQuote._id) ? '♥' : '♡' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 16px 32px;
  background: #050b1a;
  color: #f5f7ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    sans-serif;
}

.explore-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
  padding-top: 20px;
  max-width: 960px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
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
}

.back-icon {
  font-size: 16px;
}

.explore-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 960px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.search-wrapper {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.95);
  color: #e5e7ff;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: #9fa8c6;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 213, 0.4);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  border-color: rgba(148, 163, 213, 0.6);
}

.filter-chip--active {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  border-color: transparent;
}

.chip-icon {
  font-size: 14px;
}

.quotes-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-text {
  font-size: 14px;
  color: #9fa8c6;
}

.status-text--error {
  color: #fca5a5;
}

.quote-card-item {
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.9);
  padding: 18px 18px;
  min-height: 96px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quote-card-item:hover {
  border-color: rgba(148, 163, 213, 0.4);
  background: rgba(15, 23, 42, 0.98);
  transform: translateY(-2px);
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
  padding: 16px;
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
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
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
  top: 16px;
  right: 16px;
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
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
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
  color: #e5e7ff;
  line-height: 1.5;
  margin: 0;
}

.modal-film-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-film-title {
  font-size: 16px;
  font-weight: 700;
  color: #f9fafb;
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
  color: #c4b5fd;
}

.modal-emotion {
  display: flex;
  gap: 8px;
}

.emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 999px;
  color: #d8b4fe;
  font-size: 13px;
  font-weight: 600;
}

.modal-fav-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(148, 163, 213, 0.4);
  background: rgba(15, 23, 42, 0.8);
  color: #9fa8c6;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin: 8px auto 0;
}

.modal-fav-btn:hover {
  color: #fca5a5;
  transform: scale(1.15);
  border-color: rgba(248, 113, 113, 0.5);
}

.modal-fav-btn--active {
  color: #ef4444;
  border-color: rgba(248, 113, 113, 0.5);
}

.modal-fav-btn--active:hover {
  color: #fca5a5;
}

@media (min-width: 768px) {
  .explore-page {
    padding: 24px 32px 40px;
  }

  .explore-content {
    max-width: 960px;
    margin: 0 auto;
  }
}
</style>