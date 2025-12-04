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
              @click="toggleFavorite(quote._id)"
            >
              {{ isFavorite(quote._id) ? '♥' : '♡' }}
            </button>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const search = ref("");
const selectedEmotion = ref("all");
const quotes = ref([]);
const loading = ref(false);
const error = ref(null);
const favorites = ref([]);

const emotions = [
  { id: "tout", label: "Tout", icon: "⭐" },
  { id: "joie", label: "Joie", icon: "😊" },
  { id: "tristesse", label: "Tristesse", icon: "😭" },
  { id: "amour", label: "Amour", icon: "❤️" },
  { id: "nostalgie", label: "Nostalgie", icon: "🌙" },
  { id: "anxiété", label: "Anxiété", icon: "🚩" },
];

async function fetchQuotes() {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      limit: 100,
    };

    if (selectedEmotion.value !== "all") {
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

function goBack() {
  router.back();
}

function selectEmotion(id) {
  selectedEmotion.value = id;
}

// Fetch user's favorites
async function fetchFavorites() {
  try {
    const response = await fetch("/api/favorites", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (response.ok) {
      const data = await response.json();
      favorites.value = (data || []).map(q => q._id);
    }
  } catch (e) {
    console.error("Error fetching favorites:", e);
  }
}

// Check if a quote is in favorites
function isFavorite(quoteId) {
  return favorites.value.includes(quoteId);
}

// Toggle favorite status
async function toggleFavorite(quoteId) {
  try {
    if (isFavorite(quoteId)) {
      // Remove from favorites
      // Calls DELETE /api/favorites endpoint which uses:
      // - favoriteController.js: removeFavorite() function
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ quoteId })
      });

      if (response.ok) {
        favorites.value = favorites.value.filter(id => id !== quoteId);
      }
    } else {
      // Add to favorites
      // Calls POST /api/favorites endpoint which uses:
      // - favoriteController.js: addFavorite() function
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ quoteId })
      });

      if (response.ok) {
        favorites.value.push(quoteId);
      } else if (response.status === 401) {
        alert("Veuillez vous connecter pour ajouter des favoris");
      } else {
        const data = await response.json();
        alert(data.message || "Erreur lors de l'ajout aux favoris");
      }
    }
  } catch (e) {
    console.error("Error toggling favorite:", e);
    alert("Erreur lors de la modification des favoris");
  }
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
  .explore-page {
    padding: 24px 32px 40px;
  }

  .explore-content {
    max-width: 960px;
    margin: 0 auto;
  }
}
</style>