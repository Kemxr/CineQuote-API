<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useEmotions } from "@/composables/useEmotions";

const router = useRouter();
const { getEmotionIcon } = useEmotions();

const quote = ref(null);
const isFav = ref(false);
const loading = ref(true);
const countdown = ref("");
let dailyRefreshTimeout = null;
let dailyRefreshInterval = null;
let timeInterval = null;

const backgroundStyle = computed(() => {
  const image = quote.value?.film?.image;
  if (!image) return {};
  return {
    "--quote-bg-image": `url(${image})`,
  };
});

function updateCountdown() {
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);

  if (now >= next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }

  const diff = next9AM - now;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdown.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function fetchDailyQuote() {
  try {
    loading.value = true;
    const response = await fetch("/api/quotes/random");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    quote.value = data || null;

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("dailyQuote", JSON.stringify({ date: today, quote: data }));

    if (quote.value) {
      await checkIfFavorite(quote.value._id);
    }
  } catch (e) {
    console.error("Error fetching random quote:", e);
  } finally {
    loading.value = false;
  }
}

function loadDailyQuote() {
  const storedQuote = localStorage.getItem("dailyQuote");
  const today = new Date().toISOString().split("T")[0];

  if (storedQuote) {
    const { date, quote: storedQuoteData } = JSON.parse(storedQuote);

    if (date === today) {
      quote.value = storedQuoteData;
      if (quote.value) {
        checkIfFavorite(quote.value._id);
      }
      return;
    }
  }

  fetchDailyQuote();
}

async function checkIfFavorite(quoteId) {
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
      const favorites = (data || []).map(q => q._id);
      isFav.value = favorites.includes(quoteId);
    }
  } catch (e) {
    console.error("Error checking favorite:", e);
  }
}

async function toggleFavorite() {
  if (!quote.value) return;

  try {
    if (isFav.value) {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ quoteId: quote.value._id })
      });

      if (response.ok) {
        isFav.value = false;
      }
    } else {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ quoteId: quote.value._id })
      });

      if (response.ok) {
        isFav.value = true;
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

function goToProfile() {
  router.push("/profile");
}

function scheduleDailyRefresh() {
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);

  if (now > next9AM) {
    next9AM.setDate(next9AM.getDate() + 1);
  }

  const timeUntilNext9AM = next9AM - now;

  dailyRefreshTimeout = setTimeout(() => {
    fetchDailyQuote();
    dailyRefreshInterval = setInterval(fetchDailyQuote, 24 * 60 * 60 * 1000);
  }, timeUntilNext9AM);
}

onMounted(() => {
  loadDailyQuote();
  scheduleDailyRefresh();
  
  // Initialiser le décompte et le mettre à jour chaque seconde
  updateCountdown();
  timeInterval = setInterval(() => {
    updateCountdown();
  }, 1000);

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Nouvelle citation', {
            body: "Une nouvelle citation est dispo aujourd'hui.",
          });
        }
      });
    } else if (Notification.permission === 'granted') {
      new Notification('Nouvelle citation', {
        body: "Une nouvelle citation est dispo aujourd'hui.",
      });
    }
  }
});

onUnmounted(() => {
  if (dailyRefreshTimeout) {
    clearTimeout(dailyRefreshTimeout); 
  }
  if (dailyRefreshInterval) {
    clearInterval(dailyRefreshInterval);
  }
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <div>
        <h1 class="logo">CineQuote</h1>
      </div>
      <button class="profile-btn" type="button" aria-label="Profil" @click="goToProfile">
        <span class="profile-icon">👤</span>
      </button>
    </header>

    <main class="content">
      <section class="quote-card" v-if="quote" :style="backgroundStyle">
        <!-- Badge heure en haut à gauche -->
        <div class="badge badge-time">
          <span class="badge-icon">⏱</span>
          <span>{{ countdown }}</span>
        </div>

        <!-- Badge émotion en haut à droite -->
        <div class="badge badge-mood" v-if="quote.emotion">
          <span>{{ getEmotionIcon(quote.emotion) }}</span>
          <span>{{ quote.emotion }}</span>
        </div>

        <!-- Contenu de la citation -->
        <div class="quote-inner">
          <div class="quote-left">
            <div class="quote-icon">✨</div>

            <p class="quote-text">
              "{{ quote.text }}"
            </p>

            <div class="quote-meta" v-if="quote.film">
              <span class="movie-title">{{ quote.film.title }}</span>
              <span class="movie-year">({{ quote.film.year }})</span>
            </div>
          </div>
        </div>

        <!-- Barre d'action en bas -->
        <div class="quote-footer">
          <button 
            class="favorite-btn" 
            type="button"
            :class="{ 'favorite-btn--active': isFav }"
            @click="toggleFavorite"
          >
            <span class="heart">{{ isFav ? '♥' : '♡' }}</span>
            <span>{{ isFav ? 'Ajouté' : 'Ajouter' }}</span>
          </button>
        </div>
      </section>

      <router-link class="explore-button" to="/explore">
        <span>Explorer par émotion</span>
        <span class="explore-icon">🔍</span>
      </router-link>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  background: #050b1a;
  color: #f5f7ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    sans-serif;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.subtitle {
  margin-top: 4px;
  color: #9fa8c6;
  font-size: 14px;
}

.profile-btn {
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
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 0;
}

/* Carte principale */

.quote-card {
  position: relative;
  width: 100%;
  max-width: 1040px;
  min-height: 550px;
  padding: 36px 32px 24px;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    145deg,
    rgba(15, 23, 42, 0.96),
    rgba(15, 23, 42, 0.9)
  );
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.75);
}

.quote-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--quote-bg-image);
  background-size: cover;
  background-position: center right;
  opacity: 0.45;
  mix-blend-mode: screen;
  pointer-events: none;
}

.quote-inner {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-left {
  max-width: 420px;
  margin: 0 auto;
}

.quote-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

.quote-text {
  font-size: 22px;
  font-weight: 500;
  line-height: 1.6;
  margin: 0 0 12px;
  color: #eff3ff;
}

.quote-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: #b9c2e0;
}

.movie-title {
  font-weight: 600;
}

.movie-year {
  opacity: 0.9;
}

/* Badges */

.badge {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.badge-time {
  position: absolute;
  top: 18px;
  left: 24px;
  background: rgba(36, 41, 77, 0.9);
  color: #dde3ff;
}

.badge-time .badge-icon {
  color: #b39ddb;
}

.badge-mood {
  position: absolute;
  top: 18px;
  right: 24px;
  background: rgba(255, 193, 7, 0.9);
  color: #1b1305;
}

/* Bouton Ajouter */

.quote-footer {
  position: relative;
  z-index: 1;
  margin-top: 24px;
}

.favorite-btn {
  width: 100%;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(5, 11, 26, 0.8);
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #dde3ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(14, 22, 48, 0.95);
}

.favorite-btn--active {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fecaca;
}

.favorite-btn--active:hover {
  background: rgba(239, 68, 68, 0.3);
}

.heart {
  font-size: 16px;
}

/* Bouton Explorer */

.explore-button {
  margin-top: 24px;
  width: 100%;
  max-width: 1040px;
  align-self: center;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 15, 32, 0.95);
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #dde3ff;
  font-size: 14px;
  cursor: pointer;
}

.explore-button:hover {
  background: rgba(15, 23, 42, 0.98);
}

.explore-icon {
  font-size: 16px;
}

/* Responsive */

@media (max-width: 768px) {
  .home-page {
    padding: 20px 16px;
    align-items: stretch;
  }

  .content {
    align-items: center;
    justify-content: flex-start;
    margin-top: 24px;
  }

  .quote-card {
    max-width: 360px;
    min-height: 520px;
    padding: 28px 20px 20px;
    border-radius: 24px;
  }

  .quote-left {
    max-width: none;
  }

  .quote-text {
    font-size: 18px;
  }

  .badge-time {
    top: 16px;
    left: 18px;
  }

  .badge-mood {
    top: 16px;
    right: 18px;
  }

  .quote-footer {
    margin-top: 20px;
  }
}
</style>