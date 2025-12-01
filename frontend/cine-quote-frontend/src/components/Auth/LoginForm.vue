<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Connexion</h2>
      <p class="login-subtitle">Bienvenue sur CineQuote</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Entrez votre email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>

        <button type="submit" class="login-btn">Connexion</button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>

      <div class="login-footer">
        <p>Pas encore de compte? <router-link to="/register">S'inscrire</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)

const handleLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }
  isSubmitting.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      }),
      credentials: 'include'
    })
    const data = await response.json()
    if (!response.ok) {
      error.value = data.message || 'Erreur de connexion'
      return
    }
    // Optionnel: stocker user dans le store si besoin
    router.push('/')
  } catch (err) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
}

/* Fond plein écran + gradient sombre */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  padding: 24px;
  background: radial-gradient(circle at 0% 0%, #3a5bff 0, transparent 45%),
              radial-gradient(circle at 100% 100%, #a855ff 0, transparent 45%),
              #050816;
  color: #f9fafb;
}

/* Carte type “card” centrale, arrondie, effet verre */
.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 28px 24px 24px;
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.75));
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow:
    0 32px 80px rgba(15, 23, 42, 0.85),
    0 0 0 1px rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(24px);
}

/* Titre + sous-titre proches de ton mockup */
h2 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #f9fafb;
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 24px;
}

/* Formulaire vertical + spacing */
form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: #e5e7eb;
  text-align: left;
}

/* Inputs type “pill” foncés */
input {
  padding: 12px 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.85);
  color: #e5e7eb;
  font-size: 14px;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease,
              background-color 0.25s ease, transform 0.1s ease;
}

input::placeholder {
  color: #6b7280;
}

input:focus {
  border-color: #a855ff;
  background: rgba(15, 23, 42, 0.95);
  box-shadow:
    0 0 0 1px rgba(168, 85, 247, 0.7),
    0 0 0 10px rgba(88, 28, 135, 0.35);
  transform: translateY(-1px);
}

/* Bouton principal violet comme l’onglet actif du bas */
.login-btn {
  margin-top: 6px;
  width: 100%;
  padding: 13px 14px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #a855ff 0%, #6366f1 100%);
  color: #f9fafb;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 18px 40px rgba(88, 28, 135, 0.7);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 24px 60px rgba(88, 28, 135, 0.9);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 14px 30px rgba(88, 28, 135, 0.7);
}

/* Message d’erreur discret mais visible */
.error-message {
  margin-top: 4px;
  margin-bottom: 6px;
  font-size: 13px;
  text-align: center;
  color: #fecaca;
  background: rgba(127, 29, 29, 0.25);
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(248, 113, 113, 0.6);
}

/* Footer type “petite ligne de texte” */
.login-footer {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.login-footer a {
  color: #c4b5fd;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.login-footer a:hover {
  color: #a855ff;
}

/* Mobile */
@media (max-width: 480px) {
  .login-card {
    padding: 24px 18px 20px;
    border-radius: 24px;
  }

  h2 {
    font-size: 22px;
  }

  .login-container {
    padding: 18px;
  }
}
</style>
