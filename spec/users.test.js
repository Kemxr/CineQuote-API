import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

describe('GET /users', () => {
  it('devrait renvoyer un tableau d’utilisateurs et un statut 200', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const user = res.body[0];
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      // Ajoute les autres propriétés attendues si nécessaires
    }
  });

});



describe('Sécurité /users - Injection', () => {
  it('devrait rester stable face à une injection dans le nom ou email', async () => {
    const maliciousUser = {
      name: "<svg onload=alert(1)>",
      email: "inject@evil.com<script>alert('user')</script>",
      password: "azerty123"
    };
    const res = await request(app)
      .post('/auth/register') // adapte selon ta route d’inscription
      .send(maliciousUser)
      .set('Accept', 'application/json');
    expect([201, 400, 401, 422]).toContain(res.statusCode);
    // Si l'utilisateur est créé, vérifie que le champ name est bien stocké tel quel (ou rejeté)
    if (res.body && res.body.name) {
      expect(res.body.name).toContain("<svg onload=alert(1)>");
    }
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
