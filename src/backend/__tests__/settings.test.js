import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const existingSettings = {
  title: 'Piecewise',
  header: 'Welcome to Piecewise!',
  footer: 'Thank you for taking the survey!',
  color_one: '#333333',
  color_two: '#007bff',
};

const validSettings = {
  title: 'Foo',
  header: 'Bar',
  footer: 'Baz',
  color_one: '#ffffff',
  color_two: '#000000',
};

const invalidSettings = {
  title: 0,
  header: 0,
  footer: 0,
  color_one: 0,
  color_two: 0,
};

beforeAll(() => {
  config.adminPassword = config.adminPassword
    ? !!config.adminPassword
    : 'adminpass';

  config.viewerPassword = config.viewerPassword
    ? !!config.viewerPassword
    : 'viewerpass';
});

afterAll(async () => {
  return db.destroy();
});

describe('Access settings as an admin', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({ username: config.adminUsername, password: config.adminPassword })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Fetch settings', async () => {
    const settings = await session.get('/api/v1/settings').expect(200);
    expect(settings.body.data).toMatchObject(existingSettings);
  });
});

describe('Manage settings as an admin', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({ username: config.adminUsername, password: config.adminPassword })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  each(
    Object.entries(validSettings).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit settings with attribute %p', async attribute => {
    await session
      .put('/api/v1/settings')
      .send({ data: { ...existingSettings, ...attribute } })
      .expect(204);
  });

  each(
    Object.entries(invalidSettings).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit settings with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/settings')
        .send({ data: { ...existingSettings, ...attribute } })
        .expect(400);
    },
  );
});

describe('Access settings as a viewer', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
    await session
      .post('/api/v1/login')
      .send({
        username: config.viewerUsername,
        password: config.viewerPassword,
      })
      .expect(200);
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Fetch settings', async () => {
    const settings = await session.get('/api/v1/settings').expect(200);
    expect(settings.body.data).toMatchObject(existingSettings);
  });

  each(
    Object.entries(validSettings).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Attempt to edit settings with attribute %p', async attribute => {
    await session
      .put('/api/v1/settings')
      .send({ data: [{ ...existingSettings, ...attribute }] })
      .expect(403);
  });
});

describe('Access settings as user', () => {
  beforeAll(() => {
    return db.migrate.latest().then(() => db.seed.run());
  });

  let session;
  beforeEach(async () => {
    session = Session(server(config));
  });

  afterAll(async () => {
    session.destroy();
    return db.migrate.rollback();
  });

  test('Fetch settings', async () => {
    const settings = await session.get('/api/v1/settings').expect(200);
    expect(settings.body.data).toMatchObject(existingSettings);
  });

  each(
    Object.entries(validSettings).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Attempt to edit settings with attribute %p', async attribute => {
    await session
      .put('/api/v1/settings')
      .send({ data: [{ ...existingSettings, ...attribute }] })
      .expect(403);
  });
});
