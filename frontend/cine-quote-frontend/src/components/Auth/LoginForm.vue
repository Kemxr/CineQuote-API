<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-left">
        <div class="branding">
          <h1 class="app-title">CineQuote</h1>
          <p class="app-subtitle">Découvrez les meilleures citations du cinéma</p>
        </div>
        <div class="features">
          <div class="feature">
            <span class="icon">🎬</span>
            <p>Accédez à des milliers de citations</p>
          </div>
          <div class="feature">
            <span class="icon">⭐</span>
            <p>Marquez vos citations préférées</p>
          </div>
          <div class="feature">
            <span class="icon">🎭</span>
            <p>Explorez par film et acteur</p>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2>Connexion</h2>
          <p class="login-subtitle">Bienvenue sur CineQuote</p>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="username">Pseudo</label>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Entrez votre pseudo"
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
            <p>Pas encore de compte? <a href="#signup">S'inscrire</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  if (!username.value || !password.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      error.value = data.message || 'Erreur de connexion'
      return
    }

    const data = await response.json()
    localStorage.setItem('token', data.token)
    window.location.href = '/'
  } catch (err) {
    error.value = 'Erreur de connexion au serveur'
    console.error(err)
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.login-wrapper {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: white;
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.branding {
  margin-bottom: 60px;
}

.app-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -1px;
}

.app-subtitle {
  font-size: 18px;
  opacity: 0.9;
  font-weight: 300;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.icon {
  font-size: 32px;
  flex-shrink: 0;
  position: relative;
  top: -2px;
}

.feature p {
  font-size: 16px;
  line-height: 1.5;
  opacity: 0.95;
}

.login-right {
  flex: 1;
  padding: 80px 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 700;
}

.login-subtitle {
  color: #999;
  font-size: 14px;
  margin-bottom: 30px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-btn {
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  padding: 12px;
  background: #fadbd8;
  border-radius: 6px;
  margin-bottom: 20px;
}

.login-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.login-footer a:hover {
  color: #764ba2;
}

@media (max-width: 1024px) {
  .login-left {
    padding: 60px 40px;
  }

  .login-right {
    padding: 60px 40px;
  }

  .app-title {
    font-size: 40px;
  }

  h2 {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    height: auto;
  }

  .login-left {
    padding: 40px 30px;
    min-height: 300px;
  }

  .app-title {
    font-size: 32px;
  }

  .branding {
    margin-bottom: 30px;
  }

  .features {
    gap: 15px;
  }

  .login-right {
    padding: 40px 30px;
  }

  h2 {
    font-size: 24px;
  }
}
</style>
