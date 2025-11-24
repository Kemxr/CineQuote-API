<template>
  <div class="login-container">
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
        <p>Pas encore de compte? <router-link to="/register">S'inscrire</router-link></p>
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

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h2 {
  font-size: 28px;
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

.login-footer a,
.login-footer router-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
  cursor: pointer;
}

.login-footer a:hover,
.login-footer router-link:hover {
  color: #764ba2;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  h2 {
    font-size: 24px;
  }

  .login-container {
    padding: 15px;
  }
}
</style>
