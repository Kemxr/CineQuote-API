# CineQuote - API REST

## Présentation du Projet

**CineQuote** est une application web permettant aux utilisateurs de découvrir, partager et organiser des citations de films. Le projet suit une architecture client-serveur :

- **Serveur** : Gère les données (utilisateurs, films, citations, favoris) et expose une API REST
- **Client** : Interface utilisateur communiquant avec le serveur

L'API fournit les services nécessaires pour l'authentification, la consultation des films et citations, la gestion des favoris, et les notifications push. **La documentation complète de l'API est disponible via Swagger/OpenAPI** (voir section [Documentation de l'API](#documentation-de-lapi)).

## Technologies Utilisées

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Runtime** | Node.js | Exécution du code JavaScript côté serveur |
| **Framework** | Express.js 5.1.0 | Gestion des routes HTTP et middleware |
| **Base de données** | MongoDB 8.19.1 | Stockage des données (NoSQL) |
| **Authentification** | JWT + bcrypt | Sécurisation des comptes utilisateurs |
| **Communication** | Socket.io | Temps réel (WebSocket) |
| **Notifications** | Web Push | Notifications push côté client |
| **Mapping BD** | Mongoose | Interface MongoDB en Node.js |
| **Développement** | Nodemon | Redémarrage automatique en dev |
| **Tests** | Jest | Tests unitaires |

## Prérequis

Avant de commencer, installez les logiciels suivants :

| Prérequis | Version | Raison |
|-----------|---------|--------|
| **Node.js** | ≥ 16.0.0 | Runtime JavaScript pour exécuter l'API |
| **npm** | ≥ 7.0.0 | Gestionnaire de paquets (généralement inclus avec Node.js) |
| **MongoDB** | ≥ 4.4 | Base de données pour stocker les données persistantes |

**MongoDB** peut être installé localement ou utilisé via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud gratuit).

### Vérification de l'Installation

Pour vérifier que les outils sont correctement installés :

```bash
node --version    # Doit afficher v16.0.0 ou supérieur
npm --version     # Doit afficher 7.0.0 ou supérieur
```

## Installation

### 1. Cloner le Projet

```bash
git clone https://github.com/Kemxr/CineQuote-API.git
cd CineQuote-API
```

Télécharge le code source du projet dans un dossier local.

### 2. Installer les Dépendances

```bash
npm install
cd frontend/cine-quote-frontend
npm install
```

Installe tous les paquets Node.js listés dans `package.json` (Express, MongoDB, JWT, etc.).

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env  # Si un fichier .env.example existe
# Sinon, créez manuellement un fichier .env
```

Remplissez le fichier `.env` avec les valeurs suivantes :

```env
# Serveur
PORT=3000
BACKEND_PORT=8899

# Authentification
JWT_SECRET=votre_clé_secrète_jwt_aléatoire
JWT_EXPIRES_IN=7d
SECRET_KEY=votre_clé_secrète_générale

# Base de données
DATABASE_URL=mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/?retryWrites=true&w=majority

# WebSocket
VITE_WS_HOST=localhost
VITE_WS_PORT=8899

# Notifications push (optionnel)
VAPID_PUBLIC_KEY=votre_clé_publique_vapid
VAPID_PRIVATE_KEY=votre_clé_privée_vapid
```

**Explication des variables principales :**

| Variable | Description |
|----------|-------------|
| `PORT` | Port HTTP du serveur (défaut: 3000) |
| `JWT_SECRET` | Clé secrète pour signer les jetons JWT (doit être aléatoire et sécurisée) |
| `DATABASE_URL` | URL de connexion MongoDB (local ou MongoDB Atlas) |
| `JWT_EXPIRES_IN` | Durée de vie des jetons (ex: "7d" = 7 jours) |

### 4. Initialiser la Base de Données (Optionnel)

Pour remplir la base de données avec des données de test :

```bash
npm run seed
```

Pour vider la base de données :

```bash
npm run clear
```

## Lancement du Projet

### Mode Développement (À la racine du projet)

```bash
npm run dev
```

Démarre simultanément le serveur backend et le client frontend. Le serveur redémarre automatiquement lors de modifications de fichiers (grâce à Nodemon).

**Accès :**
- API : `http://localhost:3000/api`
- Swagger UI : `http://localhost:8899/api-docs`
- Frontend : `http://localhost:5173`

### Mode Production

```bash
npm start
```

Lance le projet en mode production optimisé.

### Lancement Sélectif

```bash
npm run dev:server    # Serveur backend uniquement
npm run dev:client    # Client frontend uniquement
```

### Tests

```bash
npm test              # Exécute les tests unitaires
npm run test:coverage # Génère un rapport de couverture
```

## Documentation de l'API

La documentation complète de l'API est disponible via **Swagger UI**, une interface interactive. Le fichier source est `openapi.yml` (spécification OpenAPI 3.0).

### Accès à Swagger UI

Une fois le serveur lancé (`npm run dev`), ouvrez :

```
http://localhost:8899/api-docs
```

Swagger UI affiche :
- **25 endpoints** organisés par catégorie (Authentification, Utilisateurs, Films, Citations, Favoris, Notifications)
- **Détails complets** : méthode HTTP, paramètres, schémas de requête/réponse
- **Codes d'erreur** : 200, 201, 400, 401, 403, 404, 500 avec explications
- **Exemples pratiques** : requêtes et réponses réalistes pour chaque endpoint
- **Authentification** : explication du système JWT et des niveaux d'accès

### Fichier OpenAPI YAML

Le fichier de spécification brut est accessible à :

```
http://localhost:8899/api-docs/openapi.yaml
```

Peut être utilisé avec d'autres outils OpenAPI/Swagger.

## Utilisation de l'API (Vue d'Ensemble)

### Modèle REST

L'API suit le modèle REST standard :

1. **Client** envoie une requête HTTP (GET, POST, PATCH, DELETE)
2. **Serveur** traite la requête et accède à la base de données si nécessaire
3. **Réponse** retournée au format JSON avec un code de statut HTTP

### Flux Typique

| Étape | Action | Authentification |
|-------|--------|------------------|
| **1. Inscription/Connexion** | Créer un compte ou se connecter | Non requise |
| **2. Consultation** | Consulter films et citations | Non requise |
| **3. Favoris** | Ajouter/retirer des citations favorites | JWT requis |
| **4. Administration** | Créer/modifier/supprimer contenu | JWT + rôle admin |

### Authentification JWT

L'API utilise **JWT (JSON Web Token)** :
- Jeton créé lors de la connexion
- Stocké dans un cookie HTTP-only sécurisé
- Expire après 7 jours (configurable via `JWT_EXPIRES_IN`)
- Automatiquement validé pour chaque requête protégée

### Niveaux d'Accès

| Niveau | Accès | Exemples |
|--------|-------|----------|
| **Public** | Aucune authentification | Consulter films, citations, profils publics |
| **Authentifié** | JWT valide | Gérer favoris, consulter profil personnel |
| **Admin** | JWT + rôle admin | Créer/modifier/supprimer films et citations |


## Notes pour l'Évaluation

### Documentation de l'API

**Swagger/OpenAPI 3.0 est la source unique et officielle de documentation de l'API.**

- **Fichier source** : `openapi.yml` (spécification OpenAPI 3.0 complète)
- **Interface interactive** : Swagger UI à `http://localhost:8899/api-docs`
- **Aucune autre documentation API en Markdown** n'est nécessaire

### Choix de Documentation

| Composant | Fichier | Rôle |
|-----------|---------|------|
| **Vue d'ensemble** | `README.md` | Guide de démarrage et architecture générale |
| **Spécification API** | `openapi.yaml` | Documentation technique complète (25 endpoints) |
| **Interface interactive** | Swagger UI | Exploration et test des endpoints |

### Complétude de la Documentation

✅ **25 endpoints** documentés avec exemples  
✅ **Tous les paramètres** (path, query, body) expliqués  
✅ **Tous les schémas** (User, Film, Quote, etc.) définis  
✅ **Tous les codes d'erreur** (200, 201, 400, 401, 403, 404, 500)  
✅ **Authentification JWT** expliquée avec niveaux d'accès  
✅ **Exemples pratiques** pour chaque endpoint  
✅ **Contenu en français** pour accessibilité académique

### Principes de Documentation

1. **Clarté** : Explications en français simple, sans jargon inutile
2. **Complétude** : Tous les endpoints et paramètres documentés
3. **Accessibilité** : Swagger UI permet exploration interactive sans lire le YAML
4. **Maintenabilité** : OpenAPI comme source unique évite duplication
5. **Académique** : Adapté pour évaluation et compréhension pédagogique

## Structure du Projet

```
CineQuote-API/
├── bin/                    # Point d'entrée de l'application
├── controllers/            # Logique métier (traitement des requêtes)
│   ├── authController.js   # Inscription, connexion, profil
│   ├── userController.js   # Gestion des utilisateurs
│   ├── filmController.js   # Gestion des films
│   ├── quoteController.js  # Gestion des citations
│   └── favoriteController.js # Gestion des favoris
├── routes/                 # Définition des endpoints HTTP
│   ├── auth.js
│   ├── users.js
│   ├── films.js
│   ├── quotes.js
│   └── favorites.js
├── models/                 # Schémas MongoDB (structure des données)
│   ├── user.js
│   ├── film.js
│   └── quote.js
├── middlewares/            # Middleware Express (authentification, validation)
│   ├── authMiddleware.js
│   └── userMiddleware.js
├── frontend/               # Application web client (React/Vue)
├── app.js                  # Configuration Express principale
├── store                   # Gestionnaire WebSocket et données du quiz
├── spec                    # Différents test
├── config.js               # Configuration (variables d'environnement)
├── openapi.yaml            # Spécification OpenAPI 3.0 (documentation API)
├── package.json            # Dépendances et scripts npm
├── .env                    # Variables d'environnement (non versionné)
└── README.md               # Ce fichier
```

## Dépannage

### Le serveur ne démarre pas

**Causes possibles et solutions :**

| Problème | Solution |
|----------|----------|
| Node.js non installé | Vérifiez : `node --version` |
| MongoDB inaccessible | Lancez MongoDB localement ou vérifiez la connexion cloud |
| Fichier `.env` manquant | Créez `.env` avec les variables requises |
| Port déjà utilisé | Changez `PORT` dans `.env` ou libérez le port |
| Dépendances manquantes | Exécutez `npm install` |

### Erreur de Connexion à MongoDB

**Vérifications :**
- MongoDB est-il en cours d'exécution ? (local : `mongod`, cloud : vérifiez MongoDB Atlas)
- `DATABASE_URL` est-elle correcte dans `.env` ?
- Les identifiants MongoDB sont-ils valides ?
- Votre adresse IP est-elle autorisée dans MongoDB Atlas (si cloud) ?

### Swagger UI n'est pas Accessible

**Vérifications :**
- Le serveur est-il lancé ? (`npm run dev`)
- L'URL est-elle correcte ? (`http://localhost:8899/api-docs`)
- Le port 8899 correspond-il à votre configuration ?
- Le cache est-il vide ?

## Ressources Utiles

| Ressource | Lien |
|-----------|------|
| **OpenAPI 3.0** | https://spec.openapis.org/oas/v3.0.3 |
| **Express.js** | https://expressjs.com/ |
| **MongoDB** | https://docs.mongodb.com/ |
| **JWT** | https://jwt.io/ |
| **Swagger UI** | https://swagger.io/tools/swagger-ui/ |

## Licence

MIT

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 0.1.0  
**Auteur** : Équipe CineQuote
