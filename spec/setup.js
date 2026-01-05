import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import http from "http";

let mongoServer;
let httpServer;
let wsServerInstance;

// Avant tous les tests
export const setupTestDB = async () => {
  // Créer une instance MongoDB en mémoire
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Déconnecter si déjà connecté
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Connecter à la base de données de test
  await mongoose.connect(mongoUri);
};

// Après tous les tests
export const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Nettoyer la base de données entre les tests
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Setup du serveur HTTP/WebSocket pour les tests
export const setupTestServer = async (app, wsServer) => {
  return new Promise((resolve) => {
    httpServer = http.createServer(app);
    
    // Utiliser un port aléatoire pour éviter les conflits
    httpServer.listen(0, () => {
      const port = httpServer.address().port;
      console.log(`Test server started on port ${port}`);
      
      // Démarrer le serveur WebSocket
      wsServerInstance = wsServer;
      wsServer.start({ server: httpServer });
      
      resolve(port);
    });
  });
};

// Fermeture du serveur HTTP/WebSocket
export const teardownTestServer = async () => {
  return new Promise((resolve) => {
    // Fermer les connexions WebSocket
    if (wsServerInstance && wsServerInstance.wss) {
      wsServerInstance.wss.clients.forEach((client) => {
        client.close();
      });
      wsServerInstance.wss.close();
    }

    // Fermer le serveur HTTP
    if (httpServer) {
      httpServer.close(() => {
        console.log("Test server closed");
        httpServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};