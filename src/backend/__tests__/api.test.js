import Session from 'supertest-session';
import config from '../config.js';
import server from '../server.js';

describe('Authenticate to API', () => {
  let session;
  beforeEach(() => {
    session = Session(server(config));
  });

  afterAll(async () => {
    session.destroy();
  });

  test('Authenticate unsuccessfully', async () => {
    await session
      .post('/api/v1/login')
      .send({ username: 'admin', password: 'wrongpassword' })
      .expect(401);
  });

  test('Authenticate successfully', async () => {
    await session
      .post('/api/v1/login')
      .send({ username: config.username, password: config.password })
      .expect(200);
  });
});
