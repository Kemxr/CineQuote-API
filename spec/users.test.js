import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import app, {wsServer} from "../app.js";
import jwt from "jsonwebtoken";
import { setupTestDB, teardownTestDB, clearTestDB, setupTestServer, teardownTestServer } from "./setup.js";
import User from "../models/user.js";

const createAdminToken = (userId) => {
  return jwt.sign(
    { id: userId, role: "admin" },
    process.env.JWT_SECRET || "test-secret",
    { expiresIn: "1h" }
  );
};

describe("Users API", () => {
  let adminUser;
  let adminToken;

  beforeAll(async () => {
    await setupTestDB();
    await setupTestServer(app, wsServer);
  });

  afterAll(async () => {
    await teardownTestDB();
    await teardownTestServer();
  });

  beforeEach(async () => {
    await clearTestDB();
    // Créer un utilisateur admin de test
    adminUser = await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "password123",
      role: "admin"
    });

    adminToken = createAdminToken(adminUser._id);
  });

    describe("GET /api/users", () => {
    it("devrait retourner une liste vide quand aucun utilisateur n'existe", async () => {
      // Nettoyer tous les utilisateurs sauf l'admin
      await User.deleteMany({ _id: { $ne: adminUser._id } });

      const response = await request(app)
        .get("/api/users")
        .set("Cookie", `auth_token=${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1); // Seulement l'admin
      expect(response.body[0]._id).toBe(adminUser._id.toString());
    });

    it("devrait retourner tous les utilisateurs", async () => {
      await User.create([
        {
          name: "User One",
          email: "user1@example.com",
          password: "password123"
        },
        {
          name: "User Two",
          email: "user2@example.com",
          password: "password123"
        }
      ]);

      const response = await request(app)
        .get("/api/users")
        .set("Cookie", `auth_token=${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("email");
      expect(response.body[0]).toHaveProperty("password");
    });
  });

  describe("GET /api/users/:id", () => {
    it("devrait retourner un utilisateur spécifique par son ID", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body._id).toBe(user._id.toString());
      expect(response.body.name).toBe("Test User");
      expect(response.body.email).toBe("test@example.com");
    });

    it("devrait retourner 404 pour un ID inexistant", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain("Cannot find user");
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("devrait mettre à jour le nom d'un utilisateur", async () => {
      const user = await User.create({
        name: "Original Name",
        email: "test@example.com",
        password: "password123"
      });

      const response = await request(app)
        .patch(`/api/users/${user._id}`)
        .send({ name: "Updated Name" })
        .expect(200);

      expect(response.body.name).toBe("Updated Name");
      expect(response.body.email).toBe("test@example.com");
    });

    it("devrait mettre à jour l'email d'un utilisateur", async () => {
      const user = await User.create({
        name: "Test User",
        email: "old@example.com",
        password: "password123"
      });

      const response = await request(app)
        .patch(`/api/users/${user._id}`)
        .send({ email: "new@example.com" })
        .expect(200);

      expect(response.body.email).toBe("new@example.com");
      expect(response.body.name).toBe("Test User");
    });

    it("devrait mettre à jour plusieurs champs simultanément", async () => {
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

      const response = await request(app)
        .patch(`/api/users/${user._id}`)
        .send({
          name: "New Name",
          email: "newemail@example.com"
        })
        .expect(200);

      expect(response.body.name).toBe("New Name");
      expect(response.body.email).toBe("newemail@example.com");
    });

    it("devrait retourner 404 pour un ID inexistant", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .patch(`/api/users/${fakeId}`)
        .send({ name: "Test" })
        .expect(404);

      expect(response.body.message).toBeTruthy();
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("devrait supprimer un utilisateur existant", async () => {
      const user = await User.create({
        name: "To Delete",
        email: "delete@example.com",
        password: "password123"
      });

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");

      // Vérifier que l'utilisateur a été supprimé
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it("devrait retourner 404 pour un ID inexistant", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBeTruthy();
    });
  });
});