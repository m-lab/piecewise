import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validSubmission = {
  c2sRate: 10.0,
  s2cRate: 20.0,
  MinRTT: 10,
  latitude: 38.889248,
  longitude: -77.050636,
  fields: [{ test: 'Test!' }],
};

const invalidSubmission = {
  c2sRate: 'baz',
  s2cRate: null,
  MinRTT: {},
  latitude: 'foo',
  longitude: 'bar',
  fields: 0,
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

describe('Search submissions as an admin', () => {
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

  test('Search sorted submissions', async () => {
    const ascending = await session.get('/api/v1/submissions').expect(200);
    const descending = await session
      .get('/api/v1/submissions?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit submissions', async () => {
    const first_two = await session
      .get('/api/v1/submissions?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/submissions?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/submissions').expect(200);
    expect(first_two.body.data.length).toEqual(2);
    expect(last_two.body.data.length).toEqual(2);
    expect(all.body.data.slice(0, 2)).toMatchObject(first_two.body.data);
  });
});

describe('Manage submissions as an admin', () => {
  const validSubmissionResponse = {
    statusCode: 201,
    status: 'created',
    data: expect.anything(),
  };

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

  test('Create submission successfully', async () => {
    const res = await session
      .post('/api/v1/submissions')
      .send({ data: validSubmission })
      .expect(201);
    expect(res.body).toMatchObject(validSubmissionResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const submission = await session
      .get(`/api/v1/submissions/${res.body.data[0].id}`)
      .expect(200);
    expect(submission.body.data[0]).toMatchObject(validSubmission);
  });

  each(
    Object.entries(invalidSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to create submission with invalid attribute %p',
    async invalid => {
      await session
        .post('/api/v1/submissions')
        .send({ data: [{ ...validSubmission, ...invalid }] })
        .expect(400);
    },
  );

  test('Attempt to create an empty submission', async () => {
    await session
      .post('/api/v1/submissions')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a submission with attribute %p', async attribute => {
    await session
      .put('/api/v1/submissions/1')
      .send({ data: [{ ...validSubmission, ...attribute }] })
      .expect(204);
  });

  each(
    Object.entries(invalidSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit a submission with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/submissions/1')
        .send({ data: attribute })
        .expect(400);
    },
  );

  test('Attempt to update a submission that does not exist', async () => {
    await session
      .put('/api/v1/submissions/99')
      .send({ data: validSubmission })
      .expect(201);
  });

  test('Delete a submission', async () => {
    await session.delete('/api/v1/submissions/1').expect(204);
  });

  test('Attempt to delete a nonexistent submission', async () => {
    await session.delete('/api/v1/submissions/100').expect(404);
  });
});

describe('Search submissions as a viewer', () => {
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

  test('Search sorted submissions', async () => {
    const ascending = await session.get('/api/v1/submissions').expect(200);
    const descending = await session
      .get('/api/v1/submissions?asc=false')
      .expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit submissions', async () => {
    const first_two = await session
      .get('/api/v1/submissions?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/submissions?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/submissions').expect(200);
    expect(first_two.body.data.length).toEqual(2);
    expect(last_two.body.data.length).toEqual(2);
    expect(all.body.data.slice(0, 2)).toMatchObject(first_two.body.data);
  });
});

describe('Access submissions as a viewer', () => {
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

  test('Create submission successfully', async () => {
    await session
      .post('/api/v1/submissions')
      .send({ data: [validSubmission] })
      .expect(201);
  });

  test('Attempt to create an empty submission', async () => {
    await session
      .post('/api/v1/submissions')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a submission with attribute %p', async attribute => {
    await session
      .put('/api/v1/submissions/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a submission that does not exist', async () => {
    await session
      .put('/api/v1/submissions/99')
      .send({ data: validSubmission })
      .expect(403);
  });

  test('Delete a submission', async () => {
    await session
      .delete('/api/v1/submissions/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent submission', async () => {
    await session
      .delete('/api/v1/submissions/100')
      .send({})
      .expect(403);
  });
});

describe('Access submissions as a user', () => {
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

  test('Create submission successfully', async () => {
    await session
      .post('/api/v1/submissions')
      .send({ data: [validSubmission] })
      .expect(201);
  });

  test('Attempt to create an empty submission', async () => {
    await session
      .post('/api/v1/submissions')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a submission with attribute %p', async attribute => {
    await session
      .put('/api/v1/submissions/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a submission that does not exist', async () => {
    await session
      .put('/api/v1/submissions/99')
      .send({ data: validSubmission })
      .expect(403);
  });

  test('Delete a submission', async () => {
    await session
      .delete('/api/v1/submissions/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent submission', async () => {
    await session
      .delete('/api/v1/submissions/100')
      .send({})
      .expect(403);
  });

  test('Acccess submissions', async () => {
    await session.get('/api/v1/submissions').expect(403);
  });
});
