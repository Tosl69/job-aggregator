const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/db');

describe('GET /about.json', () => {
  it('should return 200 with services', async () => {
    const res = await request(app).get('/about.json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('server');
    expect(res.body.server).toHaveProperty('services');
    expect(Array.isArray(res.body.server.services)).toBe(true);
  });
});

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('GET /unknown-route', () => {
  it('should return 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});

afterAll(async () => {
  await pool.end();
});