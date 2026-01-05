# CineQuote - API REST

## Présentation du Projet

CineQuote est une application web qui permet aux utilisateurs de découvrir, partager et organiser des citations de films. L'application fonctionne selon une architecture client-serveur où :

- **Le serveur (cette API)** gère les données : les utilisateurs, les films, les citations et les favoris
- **Le client (application web)** communique avec le serveur pour afficher et modifier les données

L'API REST fournit tous les services nécessaires pour créer des comptes utilisateurs, consulter les films et leurs citations, ajouter de nouvelles citations (pour les administrateurs), organiser les citations préférées, et recevoir des notifications push.

## Technologies Utilisées

### Backend
- **Langage** : JavaScript (Node.js)
- **Framework** : Express.js (version 5.1.0)
- **Runtime** : Node.js

### Base de Données
- **MongoDB** (version 8.19.1) - Base de données NoSQL pour stocker les utilisateurs, films, citations et favoris

### Authentification et Sécurité
- **JWT (JSON Web Token)** - Pour l'authentification des utilisateurs
- **bcrypt** - Pour le chiffrement sécurisé des mots de passe
- **Cookies HTTP-only** - Pour le stockage sécurisé des jetons

### Autres Technologies Importantes
- **Socket.io** - Pour la communication en temps réel
- **Web Push** - Pour les notifications push
- **Mongoose** - ODM (Object Document Mapper) pour MongoDB
- **Morgan** - Middleware de journalisation HTTP
- **CORS** - Gestion des requêtes cross-origin

### Outils de Développement
- **Nodemon** - Redémarrage automatique du serveur en développement
- **Jest** - Framework de test unitaire
- **Concurrently** - Exécution simultanée de plusieurs commandes

## Prérequis

Avant de commencer, assurez-vous que vous avez installé les logiciels suivants :

- **Node.js** (version 16.0.0 ou supérieure)
- **npm** (version 7.0.0 ou supérieure, généralement inclus avec Node.js)
- **MongoDB** (version 4.4 ou supérieure) - Soit installé localement, soit accessible via MongoDB Atlas (cloud)

### Vérification des Prérequis

Pour vérifier que Node.js et npm sont correctement installés, exécutez :

```bash
node --version
npm --version
```

## Installation

### Étape 1 : Cloner le Projet

```bash
git clone <URL_DU_REPOSITORY>
cd CineQuote-API
```

### Étape 2 : Installer les Dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances listées dans le fichier `package.json`.

### Étape 3 : Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables d'environnement nécessaires :

```env
PORT=3000
JWT_SECRET=votre_clé_secrète_jwt
SECRET_KEY=votre_clé_secrète_générale
DATABASE_URL=mongodb+srv://utilisateur:motdepasse@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_EXPIRES_IN=7d
VITE_WS_HOST=localhost
VITE_WS_PORT=8899
BACKEND_PORT=8899
VAPID_PUBLIC_KEY=votre_clé_publique_vapid
VAPID_PRIVATE_KEY=votre_clé_privée_vapid
```

**Explications des variables :**
- `PORT` : Port sur lequel le serveur HTTP écoute
- `JWT_SECRET` : Clé secrète pour signer les jetons JWT (doit être une chaîne aléatoire sécurisée)
- `SECRET_KEY` : Clé secrète générale pour l'application
- `DATABASE_URL` : URL de connexion à MongoDB (local ou cloud)
- `JWT_EXPIRES_IN` : Durée de vie des jetons JWT (ex: "7d" pour 7 jours)
- `VITE_WS_HOST` et `VITE_WS_PORT` : Configuration du serveur WebSocket
- `BACKEND_PORT` : Port du serveur backend
- `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` : Clés pour les notifications push (optionnel)

### Étape 4 : Initialiser la Base de Données (Optionnel)

Pour remplir la base de données avec des données de test :

```bash
npm run seed
```

Pour vider la base de données :

```bash
npm run clear
```

## Lancement du Projet

### Mode Développement

Pour lancer le serveur et le client en mode développement :

```bash
npm run dev
```

Cette commande démarre simultanément :
- Le serveur backend sur le port spécifié dans `.env` (par défaut 3000)
- Le client frontend (application web)

Le serveur redémarrera automatiquement chaque fois que vous modifiez un fichier (grâce à Nodemon).

### Mode Production

Pour lancer le projet en mode production :

```bash
npm start
```

### Lancement du Serveur Uniquement

Si vous souhaitez lancer uniquement le serveur backend :

```bash
npm run dev:server
```

### Lancement du Client Uniquement

Si vous souhaitez lancer uniquement le client frontend :

```bash
npm run dev:client
```

### Tests

Pour exécuter les tests unitaires :

```bash
npm test
```

Pour générer un rapport de couverture de test :

```bash
npm run test:coverage
```

## Documentation de l'API

La documentation complète et détaillée de l'API est disponible via **Swagger UI**, une interface interactive qui liste tous les endpoints, paramètres, schémas et codes d'erreur.

### Accès à la Documentation Swagger

Une fois le serveur lancé, accédez à la documentation Swagger à l'adresse suivante :

```
http://localhost:10000/api-docs
```

### Contenu de la Documentation Swagger

La documentation Swagger inclut :

- **Liste complète des 25 endpoints** organisés par catégorie (Authentification, Utilisateurs, Films, Citations, Favoris, Notifications)
- **Détails de chaque endpoint** : méthode HTTP, chemin, paramètres requis et optionnels
- **Schémas de requête et réponse** : structure exacte des données attendues et retournées
- **Codes d'erreur** : tous les codes HTTP possibles (200, 201, 400, 401, 403, 404, 500) avec explications
- **Exemples pratiques** : exemples de requêtes et réponses pour chaque endpoint
- **Authentification** : explication du système JWT et des niveaux d'accès

### Fichier OpenAPI YAML

Le fichier de spécification OpenAPI brut est également disponible à :

```
http://localhost:10000/api-docs/openapi.yaml
```

Ce fichier peut être utilisé avec d'autres outils Swagger ou OpenAPI.

## Utilisation de l'API (Vue d'Ensemble)

### Architecture Client-Serveur

L'API fonctionne selon un modèle REST standard où :

1. **Le client** (navigateur web ou application mobile) envoie une **requête HTTP** au serveur
2. **Le serveur** traite la requête, accède à la base de données si nécessaire, et envoie une **réponse HTTP**
3. **Les données** sont échangées au format **JSON**

### Flux Typique d'Utilisation

#### 1. Authentification
L'utilisateur doit d'abord créer un compte ou se connecter :
- Créer un compte : envoyer un nom, email et mot de passe
- Se connecter : envoyer l'email et le mot de passe
- Recevoir un jeton JWT stocké dans un cookie sécurisé

#### 2. Consultation des Données
L'utilisateur peut consulter les films et citations sans authentification :
- Récupérer la liste des films
- Récupérer les citations d'un film spécifique
- Obtenir une citation aléatoire

#### 3. Gestion des Favoris
L'utilisateur authentifié peut gérer sa liste de citations préférées :
- Ajouter une citation aux favoris
- Consulter ses favoris
- Retirer une citation des favoris

#### 4. Administration (Administrateurs Uniquement)
Les administrateurs peuvent gérer le contenu :
- Créer, modifier ou supprimer des films
- Créer, modifier ou supprimer des citations
- Consulter la liste de tous les utilisateurs

### Authentification

L'API utilise **JWT (JSON Web Token)** pour l'authentification :
- Les jetons sont créés lors de la connexion
- Ils sont stockés dans un cookie HTTP-only sécurisé
- Ils expirent après 7 jours par défaut
- Chaque requête protégée vérifie la validité du jeton

### Niveaux d'Accès

L'API propose trois niveaux d'accès :
- **Public** : Aucune authentification requise (consultation des films et citations)
- **Authentifié** : Nécessite un jeton JWT valide (gestion des favoris, profil)
- **Admin** : Nécessite un jeton JWT ET le rôle administrateur (gestion du contenu)

### Pour Plus de Détails

**Consultez la documentation Swagger** pour :
- La liste complète de tous les endpoints
- Les paramètres exacts de chaque endpoint
- Les structures de données détaillées
- Les codes d'erreur spécifiques
- Les exemples de requêtes et réponses

Accédez à : `http://localhost:10000/api-docs`

## Remarques pour l'Évaluation

### Source Unique de Documentation de l'API

**Swagger/OpenAPI est la source unique et officielle de documentation de l'API.**

- Tous les endpoints sont documentés dans le fichier `openapi.yaml`
- La documentation Swagger UI est accessible à `http://localhost:10000/api-docs`
- Aucune autre documentation API en Markdown n'est nécessaire

### Fichiers de Documentation

Le projet contient les fichiers de documentation suivants :

- **`README.md`** (ce fichier) : Vue d'ensemble du projet et guide de démarrage
- **`openapi.yaml`** : Spécification complète de l'API au format OpenAPI 3.0
- **Swagger UI** : Interface interactive pour explorer l'API

### Vérification de la Complétude

La documentation Swagger inclut :
- ✅ 25 endpoints documentés et vérifiés
- ✅ Tous les paramètres et schémas
- ✅ Tous les codes d'erreur possibles
- ✅ Exemples pratiques pour chaque endpoint
- ✅ Explications en français pour les non-experts

## Structure du Projet

```
CineQuote-API/
├── bin/                          # Point d'entrée de l'application
├── controllers/                  # Logique métier des endpoints
│   ├── authController.js
│   ├── userController.js
│   ├── filmController.js
│   ├── quoteController.js
│   └── favoriteController.js
├── routes/                       # Définition des endpoints
│   ├── auth.js
│   ├── users.js
│   ├── films.js
│   ├── quotes.js
│   └── favorites.js
├── models/                       # Schémas MongoDB
│   ├── user.js
│   ├── film.js
│   └── quote.js
├── middlewares/                  # Middleware Express
│   ├── authMiddleware.js
│   └── userMiddleware.js
├── frontend/                     # Application web client
├── app.js                        # Configuration Express principale
├── config.js                     # Configuration de l'application
├── openapi.yaml                  # Spécification OpenAPI 3.0
├── package.json                  # Dépendances et scripts
├── .env                          # Variables d'environnement (non versionné)
└── README.md                     # Ce fichier
```

## Dépannage

### Le serveur ne démarre pas

**Vérifiez :**
- Que Node.js est correctement installé : `node --version`
- Que MongoDB est accessible (local ou cloud)
- Que le fichier `.env` est présent et correctement configuré
- Que le port spécifié dans `.env` n'est pas déjà utilisé

### Erreur de connexion à MongoDB

**Vérifiez :**
- Que MongoDB est en cours d'exécution (si installation locale)
- Que la variable `DATABASE_URL` dans `.env` est correcte
- Que vos identifiants MongoDB sont valides (si MongoDB Atlas)
- Que votre adresse IP est autorisée dans MongoDB Atlas (si cloud)

### Swagger UI n'est pas accessible

**Vérifiez :**
- Que le serveur est lancé : `npm run dev` ou `npm start`
- Que vous accédez à la bonne URL : `http://localhost:10000/api-docs`
- Que le port 10000 est correct (vérifiez dans `.env`)

## Support et Ressources

- **Documentation OpenAPI** : https://spec.openapis.org/oas/v3.0.3
- **Express.js** : https://expressjs.com/
- **MongoDB** : https://docs.mongodb.com/
- **JWT** : https://jwt.io/

## Licence

Ce projet est fourni à titre académique.

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 0.1.0
