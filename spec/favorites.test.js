import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import User from "../models/user.js";
import Quote from "../models/quote.js";
import Film from "../models/film.js";

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
};

describe("Favorites API", () => {
  let testUser;
  let testUser2;
  let userToken;
  let user2Token;
  let testFilm;
  let testQuote1;
  let testQuote2;
  let testQuote3;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Créer un film de test
    testFilm = await Film.create({
      title: "Test Movie",
      year: 2020,
      director: "Test Director",
      genre: "Drama"
    });

    // Créer des citations de test
    testQuote1 = await Quote.create({
      text: "Quote 1",
      emotion: "happy",
      film: testFilm._id
    });

    testQuote2 = await Quote.create({
      text: "Quote 2",
      emotion: "sad",
      film: testFilm._id
    });

    testQuote3 = await Quote.create({
      text: "Quote 3",
      emotion: "angry",
      film: testFilm._id
    });

    // Créer des utilisateurs de test
    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      favorites: []
    });

    testUser2 = await User.create({
      name: "Test User 2",
      email: "test2@example.com",
      password: "password123",
      favorites: []
    });

    // Créer des tokens
    userToken = createToken(testUser._id);
    user2Token = createToken(testUser2._id);
  });

  describe("POST /api/favorites - Add favorite", () => {
    it("devrait ajouter une citation aux favoris avec authentification", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Ajouté aux favoris");

      // Vérifier en base de données
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(1);
      expect(user.favorites[0].toString()).toBe(testQuote1._id.toString());
    });

    it("devrait permettre d'ajouter plusieurs citations différentes", async () => {
      // Ajouter la première citation
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // Ajouter la deuxième citation
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      // Vérifier en base de données
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(2);
    });

    it("devrait rejeter l'ajout sans authentification", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .send({ quoteId: testQuote1._id.toString() })
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });

    it("devrait rejeter l'ajout avec un token invalide", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", "auth_token=invalid-token")
        .send({ quoteId: testQuote1._id.toString() })
        .expect(401);

      expect(response.body.message).toContain("Token invalide");
    });

    it("devrait rejeter l'ajout d'une citation inexistante", async () => {
      const fakeQuoteId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: fakeQuoteId })
        .expect(404);

      expect(response.body.message).toContain("Citation introuvable");
    });

    it("devrait rejeter l'ajout d'une citation déjà en favoris", async () => {
      // Ajouter une première fois
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // Essayer d'ajouter à nouveau
      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(400);

      expect(response.body.message).toContain("Déjà en favoris");

      // Vérifier qu'il n'y a qu'une seule occurrence
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(1);
    });

    it("devrait rejeter l'ajout sans quoteId", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({})
        .expect(404);

      expect(response.body.message).toBeTruthy();
    });

    it("devrait permettre à différents utilisateurs d'ajouter la même citation", async () => {
      // User 1 ajoute la citation
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // User 2 ajoute la même citation
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${user2Token}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // Vérifier que les deux utilisateurs l'ont
      const user1 = await User.findById(testUser._id);
      const user2 = await User.findById(testUser2._id);
      
      expect(user1.favorites).toHaveLength(1);
      expect(user2.favorites).toHaveLength(1);
    });
  });

  describe("GET /api/favorites - Get favorites", () => {
    it("devrait retourner une liste vide si aucun favori", async () => {
      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("devrait retourner tous les favoris de l'utilisateur", async () => {
      // Ajouter des favoris
      testUser.favorites = [testQuote1._id, testQuote2._id];
      await testUser.save();

      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("text");
      expect(response.body[0]).toHaveProperty("film");
      expect(response.body[0].film).toHaveProperty("title");
    });

    it("devrait populer correctement les données du film", async () => {
      // Ajouter un favori
      testUser.favorites = [testQuote1._id];
      await testUser.save();

      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].film.title).toBe("Test Movie");
      expect(response.body[0].film.year).toBe(2020);
      expect(response.body[0].film.director).toBe("Test Director");
    });

    it("devrait rejeter la requête sans authentification", async () => {
      const response = await request(app)
        .get("/api/favorites")
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });

    it("devrait retourner uniquement les favoris de l'utilisateur connecté", async () => {
      // User 1 a 2 favoris
      testUser.favorites = [testQuote1._id, testQuote2._id];
      await testUser.save();

      // User 2 a 1 favori
      testUser2.favorites = [testQuote3._id];
      await testUser2.save();

      // Requête pour user 1
      const response1 = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      // Requête pour user 2
      const response2 = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${user2Token}`)
        .expect(200);

      expect(response1.body).toHaveLength(2);
      expect(response2.body).toHaveLength(1);
      expect(response2.body[0]._id).toBe(testQuote3._id.toString());
    });

    it("devrait gérer les citations supprimées dans les favoris", async () => {
      // Ajouter une citation valide et une qui sera supprimée
      testUser.favorites = [testQuote1._id, testQuote2._id];
      await testUser.save();

      // Supprimer une citation
      await Quote.findByIdAndDelete(testQuote2._id);

      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      // Devrait retourner seulement la citation valide
      expect(response.body.length).toBeLessThanOrEqual(2);
      const validQuotes = response.body.filter(q => q !== null);
      expect(validQuotes).toHaveLength(1);
    });
  });

  describe("DELETE /api/favorites - Remove favorite", () => {
    beforeEach(async () => {
      // Ajouter des favoris par défaut pour les tests de suppression
      testUser.favorites = [testQuote1._id, testQuote2._id, testQuote3._id];
      await testUser.save();
    });

    it("devrait retirer une citation des favoris", async () => {
      const response = await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      expect(response.body.message).toContain("Retiré des favoris");

      // Vérifier en base de données
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(2);
      expect(user.favorites.map(f => f.toString())).not.toContain(testQuote1._id.toString());
    });

    it("devrait retirer seulement la citation spécifiée", async () => {
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(2);
      expect(user.favorites.map(f => f.toString())).toContain(testQuote1._id.toString());
      expect(user.favorites.map(f => f.toString())).toContain(testQuote3._id.toString());
    });

    it("devrait réussir même si la citation n'est pas dans les favoris", async () => {
      // Créer une nouvelle citation non ajoutée aux favoris
      const newQuote = await Quote.create({
        text: "Not in favorites",
        emotion: "neutral",
        film: testFilm._id
      });

      const response = await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: newQuote._id.toString() })
        .expect(200);

      expect(response.body.message).toContain("Retiré des favoris");

      // Les favoris doivent rester inchangés
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(3);
    });

    it("devrait rejeter la suppression sans authentification", async () => {
      const response = await request(app)
        .delete("/api/favorites")
        .send({ quoteId: testQuote1._id.toString() })
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });

    it("devrait permettre de retirer tous les favoris un par un", async () => {
      // Retirer le premier
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // Retirer le deuxième
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      // Retirer le troisième
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote3._id.toString() })
        .expect(200);

      // Vérifier que la liste est vide
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(0);
    });

    it("devrait ne pas affecter les favoris d'autres utilisateurs", async () => {
      // User 2 a aussi des favoris
      testUser2.favorites = [testQuote1._id, testQuote2._id];
      await testUser2.save();

      // User 1 retire un favori
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // Vérifier que user 1 a 2 favoris
      const user1 = await User.findById(testUser._id);
      expect(user1.favorites).toHaveLength(2);

      // Vérifier que user 2 a toujours 2 favoris
      const user2 = await User.findById(testUser2._id);
      expect(user2.favorites).toHaveLength(2);
      expect(user2.favorites.map(f => f.toString())).toContain(testQuote1._id.toString());
    });

    it("devrait gérer la suppression avec un quoteId inexistant", async () => {
      const fakeQuoteId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: fakeQuoteId })
        .expect(200);

      expect(response.body.message).toContain("Retiré des favoris");

      // Les favoris doivent rester inchangés
      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(3);
    });
  });

  describe("Integration - Full workflow", () => {
    it("devrait gérer un workflow complet d'ajout/consultation/suppression", async () => {
      // 1. Vérifier que les favoris sont vides au départ
      let response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      expect(response.body).toHaveLength(0);

      // 2. Ajouter 3 favoris
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote3._id.toString() })
        .expect(200);

      // 3. Vérifier qu'on a bien 3 favoris
      response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      expect(response.body).toHaveLength(3);

      // 4. Retirer un favori
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      // 5. Vérifier qu'il reste 2 favoris
      response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      expect(response.body).toHaveLength(2);
      
      const quoteIds = response.body.map(q => q._id);
      expect(quoteIds).toContain(testQuote1._id.toString());
      expect(quoteIds).toContain(testQuote3._id.toString());
      expect(quoteIds).not.toContain(testQuote2._id.toString());
    });

    it("devrait isoler les favoris entre différents utilisateurs", async () => {
      // User 1 ajoute quote1 et quote2
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      // User 2 ajoute quote2 et quote3
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${user2Token}`)
        .send({ quoteId: testQuote2._id.toString() })
        .expect(200);

      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${user2Token}`)
        .send({ quoteId: testQuote3._id.toString() })
        .expect(200);

      // Vérifier user 1
      const response1 = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      
      expect(response1.body).toHaveLength(2);
      const user1QuoteIds = response1.body.map(q => q._id);
      expect(user1QuoteIds).toContain(testQuote1._id.toString());
      expect(user1QuoteIds).toContain(testQuote2._id.toString());

      // Vérifier user 2
      const response2 = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${user2Token}`)
        .expect(200);
      
      expect(response2.body).toHaveLength(2);
      const user2QuoteIds = response2.body.map(q => q._id);
      expect(user2QuoteIds).toContain(testQuote2._id.toString());
      expect(user2QuoteIds).toContain(testQuote3._id.toString());
    });
  });
});