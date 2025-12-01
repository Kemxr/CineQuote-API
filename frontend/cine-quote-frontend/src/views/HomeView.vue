<script setup>
 
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <div>
        <h1 class="logo">CineMood</h1>
        <p class="subtitle">Citation du jour</p>
      </div>
      <button class="profile-btn" type="button" aria-label="Profil">
        <span class="profile-icon">👤</span>
      </button>
    </header>

    <main class="content">
      <section class="quote-card">
        <!-- Badge heure en haut à gauche -->
        <div class="badge badge-time">
          <span class="badge-icon">⏱</span>
          <span>12:25:15</span>
        </div>

        <!-- Badge émotion en haut à droite -->
        <div class="badge badge-mood">
          <span>😨</span>
          <span>Peur</span>
        </div>

        <!-- Contenu de la citation -->
        <div class="quote-inner">
          <div class="quote-left">
            <div class="quote-icon">✨</div>

            <p class="quote-text">
              "Je vois des gens qui sont morts."
            </p>

            <div class="quote-meta">
              <span class="movie-title">Sixième Sens</span>
              <span class="movie-year">(1999)</span>
            </div>
          </div>
        </div>

        <!-- Barre d'action en bas -->
        <div class="quote-footer">
          <button class="favorite-btn" type="button">
            <span class="heart">♡</span>
            <span>Ajouter</span>
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
  background:
    radial-gradient(circle at 0% 0%, #3b82f6 0, #020617 45%),
    radial-gradient(circle at 50% 120%, #7c3aed 0, #020617 55%);
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
  background-image: url("https://images.pexels.com/photos/6898859/pexels-photo-6898859.jpeg?auto=compress&cs=tinysrgb&w=1600");
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
}

.favorite-btn:hover {
  background: rgba(14, 22, 48, 0.95);
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