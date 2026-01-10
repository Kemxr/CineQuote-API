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
  let userToken;
  let testFilm;
  let testQuote1;
  let testQuote2;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    testFilm = await Film.create({
      title: "Test Movie",
      year: 2020,
      director: "Test Director",
      genre: "Drama"
    });

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

    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      favorites: []
    });

    userToken = createToken(testUser._id);
  });

  describe("POST /api/favorites", () => {
    it("devrait ajouter une citation aux favoris", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      expect(response.body.message).toContain("Ajouté aux favoris");

      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(1);
      expect(user.favorites[0].toString()).toBe(testQuote1._id.toString());
    });

    it("devrait rejeter sans authentification", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .send({ quoteId: testQuote1._id.toString() })
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });

    it("devrait rejeter une citation inexistante", async () => {
      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: "507f1f77bcf86cd799439011" })
        .expect(404);

      expect(response.body.message).toContain("Citation introuvable");
    });

    it("devrait rejeter une citation déjà en favoris", async () => {
      await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      const response = await request(app)
        .post("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(400);

      expect(response.body.message).toContain("Déjà en favoris");
    });
  });

  describe("GET /api/favorites", () => {
    it("devrait retourner la liste des favoris avec détails du film", async () => {
      testUser.favorites = [testQuote1._id, testQuote2._id];
      await testUser.save();

      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("text");
      expect(response.body[0]).toHaveProperty("film");
      expect(response.body[0].film.title).toBe("Test Movie");
    });

    it("devrait retourner une liste vide si aucun favori", async () => {
      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("devrait rejeter sans authentification", async () => {
      const response = await request(app)
        .get("/api/favorites")
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });

    it("devrait gérer les citations supprimées", async () => {
      testUser.favorites = [testQuote1._id, testQuote2._id];
      await testUser.save();

      await Quote.findByIdAndDelete(testQuote2._id);

      const response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);

      const validQuotes = response.body.filter(q => q !== null);
      expect(validQuotes).toHaveLength(1);
    });
  });

  describe("DELETE /api/favorites", () => {
    beforeEach(async () => {
      testUser.favorites = [testQuote1._id, testQuote2._id];
      await testUser.save();
    });

    it("devrait retirer une citation des favoris", async () => {
      const response = await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      expect(response.body.message).toContain("Retiré des favoris");

      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(1);
      expect(user.favorites[0].toString()).toBe(testQuote2._id.toString());
    });

    it("devrait rejeter sans authentification", async () => {
      const response = await request(app)
        .delete("/api/favorites")
        .send({ quoteId: testQuote1._id.toString() })
        .expect(401);

      expect(response.body.message).toContain("Non autorisé");
    });

    it("devrait réussir même si la citation n'est pas en favoris", async () => {
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

      const user = await User.findById(testUser._id);
      expect(user.favorites).toHaveLength(2);
    });
  });

  describe("Workflow complet", () => {
    it("devrait gérer ajout, consultation et suppression", async () => {
      // Liste vide au départ
      let response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      expect(response.body).toHaveLength(0);

      // Ajouter 2 favoris
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

      // Vérifier 2 favoris
      response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      expect(response.body).toHaveLength(2);

      // Retirer un favori
      await request(app)
        .delete("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .send({ quoteId: testQuote1._id.toString() })
        .expect(200);

      // Vérifier 1 favori restant
      response = await request(app)
        .get("/api/favorites")
        .set("Cookie", `auth_token=${userToken}`)
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]._id).toBe(testQuote2._id.toString());
    });
  });
});