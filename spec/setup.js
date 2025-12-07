import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

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