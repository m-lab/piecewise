import Session from 'supertest-session';
import each from 'jest-each';
import db from '../db.js';
import config from '../config.js';
import server from '../server.js';

const validSubmission = {
  fields: [{ test: 'Test!' }],
};

const invalidSubmission = {
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

describe('Search forms as an admin', () => {
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

  test('Search sorted forms', async () => {
    const ascending = await session.get('/api/v1/forms').expect(200);
    const descending = await session.get('/api/v1/forms?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit forms', async () => {
    const first_two = await session
      .get('/api/v1/forms?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/forms?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/forms').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Manage forms as an admin', () => {
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

  test('Create form successfully', async () => {
    const res = await session
      .post('/api/v1/forms')
      .send({ data: validSubmission })
      .expect(201);
    expect(res.body).toMatchObject(validSubmissionResponse);
    expect(res.body.data[0].id).toBeGreaterThanOrEqual(0);
    const form = await session
      .get(`/api/v1/forms/${res.body.data[0].id}`)
      .expect(200);
    expect(form.body.data[0]).toMatchObject(validSubmission);
  });

  each(
    Object.entries(invalidSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Attempt to create form with invalid attribute %p', async invalid => {
    await session
      .post('/api/v1/forms')
      .send({ data: [{ ...validSubmission, ...invalid }] })
      .expect(400);
  });

  test('Attempt to create an empty form', async () => {
    await session
      .post('/api/v1/forms')
      .send({ data: [] })
      .expect(400);
  });

  each(
    Object.entries(validSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a form with attribute %p', async attribute => {
    await session
      .put('/api/v1/forms/1')
      .send({ data: attribute })
      .expect(204);
  });

  each(
    Object.entries(invalidSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test(
    'Attempt to edit a form with invalid attribute %p',
    async attribute => {
      await session
        .put('/api/v1/forms/1')
        .send({ data: attribute })
        .expect(400);
    },
  );

  test('Attempt to update a form that does not exist', async () => {
    await session
      .put('/api/v1/forms/99')
      .send({ data: validSubmission })
      .expect(201);
  });

  test('Delete a form', async () => {
    await session.delete('/api/v1/forms/1').expect(204);
  });

  test('Attempt to delete a nonexistent form', async () => {
    await session.delete('/api/v1/forms/100').expect(404);
  });
});

describe('Search forms as a viewer', () => {
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

  test('Search sorted forms', async () => {
    const ascending = await session.get('/api/v1/forms').expect(200);
    const descending = await session.get('/api/v1/forms?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit forms', async () => {
    const first_two = await session
      .get('/api/v1/forms?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/forms?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/forms').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Access forms as a viewer', () => {
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

  test('Attempt to create a form unsuccessfully', async () => {
    await session
      .post('/api/v1/forms')
      .send({ data: [validSubmission] })
      .expect(403);
  });

  test('Attempt to create an empty form', async () => {
    await session
      .post('/api/v1/forms')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a form with attribute %p', async attribute => {
    await session
      .put('/api/v1/forms/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a form that does not exist', async () => {
    await session
      .put('/api/v1/forms/99')
      .send({ data: validSubmission })
      .expect(403);
  });

  test('Delete a form', async () => {
    await session
      .delete('/api/v1/forms/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent form', async () => {
    await session
      .delete('/api/v1/forms/100')
      .send({})
      .expect(403);
  });
});

describe('Search forms as a user', () => {
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

  test('Search sorted forms', async () => {
    const ascending = await session.get('/api/v1/forms').expect(200);
    const descending = await session.get('/api/v1/forms?asc=false').expect(200);
    expect(ascending.body.data).toStrictEqual(descending.body.data.reverse());
  });

  test('Limit forms', async () => {
    const first_two = await session
      .get('/api/v1/forms?start=0&end=1')
      .expect(200);
    const last_two = await session
      .get('/api/v1/forms?start=2&end=3')
      .expect(200);
    const all = await session.get('/api/v1/forms').expect(200);
    expect(all.body.data.length).toEqual(
      first_two.body.data.length + last_two.body.data.length,
    );
    expect(all.body.data).toMatchObject([
      ...first_two.body.data,
      ...last_two.body.data,
    ]);
  });
});

describe('Access forms as a user', () => {
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

  test('Attempt to create a form unsuccessfully', async () => {
    await session
      .post('/api/v1/forms')
      .send({ data: [validSubmission] })
      .expect(403);
  });

  test('Attempt to create an empty form', async () => {
    await session
      .post('/api/v1/forms')
      .send({ data: [] })
      .expect(403);
  });

  each(
    Object.entries(validSubmission).map(([key, value]) => [
      { [`${key}`]: value },
    ]),
  ).test('Edit a form with attribute %p', async attribute => {
    await session
      .put('/api/v1/forms/1')
      .send({ data: attribute })
      .expect(403);
  });

  test('Attempt to update a form that does not exist', async () => {
    await session
      .put('/api/v1/forms/99')
      .send({ data: validSubmission })
      .expect(403);
  });

  test('Delete a form', async () => {
    await session
      .delete('/api/v1/forms/1')
      .send({})
      .expect(403);
  });

  test('Attempt to delete a nonexistent form', async () => {
    await session
      .delete('/api/v1/forms/100')
      .send({})
      .expect(403);
  });
});
