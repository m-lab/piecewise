import Session from 'supertest-session';
import config from '../config.js';
import db from '../db.js';
import server from '../server.js';

beforeAll(() => {
  config.adminPassword = config.adminPassword
    ? !!config.adminPassword
    : 'adminpass';

  config.viewerPassword = config.viewerPassword
    ? !!config.viewerPassword
    : 'viewerpass';
});

describe('Authenticate to API', () => {
  let session;
  beforeEach(() => {
    session = Session(server(config));
  });

  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
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

  test('Authenticate successfully as admin', async () => {
    await session
      .post('/api/v1/login')
      .send({ username: config.adminUsername, password: config.adminPassword })
      .expect(200);
  });

  test('Authenticate successfully as viewer', async () => {
    await session
      .post('/api/v1/login')
      .send({
        username: config.viewerUsername,
        password: config.viewerPassword,
      })
      .expect(200);
  });
});
