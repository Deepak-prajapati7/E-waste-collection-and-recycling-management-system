const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const mongoose = require('mongoose');
const { app } = require('../server.js');

after(async () => {
  await mongoose.disconnect();
});

async function startTestServer() {
  const server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();

  return {
    server,
    port,
    close: () => new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    }),
  };
}

test('GET /api/health responds with database status', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'healthy');
    assert.equal(payload.database.type, 'MongoDB (Mongoose)');
    assert.equal(typeof payload.timestamp, 'string');
  } finally {
    await close();
  }
});

test('POST /api/auth/login authenticates the admin demo account', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'demo1234' }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.role, 'admin');
    assert.equal(payload.email, 'admin@example.com');
    assert.equal(typeof payload.token, 'string');
  } finally {
    await close();
  }
});

test('GET /api/requests rejects unauthenticated access', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/requests`);
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.error, 'Please sign in to continue.');
  } finally {
    await close();
  }
});
