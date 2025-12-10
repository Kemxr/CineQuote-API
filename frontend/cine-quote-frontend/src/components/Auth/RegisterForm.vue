<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Inscription</h2>
      <p class="register-subtitle">Créez votre compte CineQuote</p>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nom</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Entrez votre nom"
            required
          />
        </div>

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

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmez votre mot de passe"
            required
          />
        </div>

        <button
          type="submit"
          class="register-btn"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Inscription en cours...' : "S'inscrire" }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>

      <div class="register-footer">
        <p>Déjà inscrit? <a href="/login">Se connecter</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const isSubmitting = ref(false)

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value
      }),
      credentials: 'include'
    })

    const data = await response.json()
    if (!response.ok) {
      error.value = data.message || 'Erreur lors de l\'inscription'
      return
    }

    success.value = 'Compte créé avec succès ! Connexion automatique...'
    
    // Automatically log in the user
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      }),
      credentials: 'include'
    })
    
    if (loginResponse.ok) {
      router.push('/')
    } else {
      // If auto-login fails, redirect to login page
      setTimeout(() => router.push('/login'), 1500)
    }
  } catch (err) {
    error.value = 'Erreur de connexion au serveur'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
}

/* Fond plein écran avec dégradés sombres */
.register-container {
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

/* Carte glassmorphism */
.register-card {
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

/* Titre & sous-titre */
h2 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #f9fafb;
  margin-bottom: 4px;
}

.register-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 24px;
}

/* Formulaire */
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

/* Inputs arrondis */
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

/* Bouton principal */
.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 24px 60px rgba(88, 28, 135, 0.9);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 14px 30px rgba(88, 28, 135, 0.7);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: default;
  box-shadow: none;
}

/* Messages d’état */
.error-message {
  margin-top: 4px;
  font-size: 13px;
  text-align: center;
  color: #fecaca;
  background: rgba(127, 29, 29, 0.25);
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(248, 113, 113, 0.6);
}

.success-message {
  margin-top: 4px;
  font-size: 13px;
  text-align: center;
  color: #bbf7d0;
  background: rgba(22, 101, 52, 0.3);
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(34, 197, 94, 0.7);
}

/* Footer */
.register-footer {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

.register-footer a {
  color: #c4b5fd;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.register-footer a:hover {
  color: #a855ff;
}

/* Mobile */
@media (max-width: 480px) {
  .register-card {
    padding: 24px 18px 20px;
    border-radius: 24px;
  }

  h2 {
    font-size: 22px;
  }

  .register-container {
    padding: 18px;
  }
}
</style>
