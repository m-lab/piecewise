import RedisServer from 'redis-server';
import request from 'supertest';
import Session from 'supertest-session';

import config from '../config.js';
import server from '../server.js';
import Queue from '../models/queue.js';

const MOCK_SERVER_HOST = 'localhost';
const MOCK_SERVER_PORT = 6379;
var redis;

beforeAll(() => {
  try {
    redis = new RedisServer();
    redis.open({ port: MOCK_SERVER_PORT });
  } catch (e) {
    console.error('unable to start local redis-server', e);
  }
});

afterAll(() => {
  redis.close();
});

describe('Unauthenticated use of API', () => {
  afterAll(async () => {
    await server.close();
  });

  test('Add valid item to processing queue.', async () => {
    await request(server.callback())
      .post('/api/v1/FIXME')
      .field({ fixme: 'FIXME' })
      .expect(201);
  });

  test('Add invalid item to processing queue.', async () => {
    await request(server.callback())
      .post('/api/v1/FIXME')
      .field({ fixme: 'FIXME' })
      .expect(422);
  });

  test('Add valid item to specific processing queue.', async () => {
    await request(server.callback())
      .post('/api/v1/queues/test/FIXME')
      .field({ fixme: 'FIXME' })
      .expect(201);
  });

  test('Add invalid item to specific processing queue.', async () => {
    await request(server.callback())
      .post('/api/v1/queues/test/FIXME')
      .field({ fixme: 'FIXME' })
      .expect(422);
  });

  test('Try and get FIXME without authenticating', async () => {
    await request(server.callback())
      .get('/api/v1/FIXME')
      .expect(401);
  });

  test('Try and get FIXME from specific queue without authenticating', async () => {
    await request(server.callback())
      .get('/api/v1/queues/test/FIXME')
      .expect(401);
  });
});

describe('Authenticate to API', () => {
  let session;
  beforeEach(() => {
    session = Session(server.callback());
  });

  afterAll(async () => {
    await server.close();
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
      .send({ username: config.admin.user, password: config.admin.password })
      .expect(200);
  });
});

describe('Query authenticated API', () => {
  let queue;
  let session;
  const jobs = [
    { name: 'job1', data: 'Test data 1' },
    { name: 'job2', data: 'Test data 2' },
    { name: 'job3', data: 'Test data 3' },
  ];

  beforeAll(async () => {
    session = Session(server.callback());
    await session
      .post('/api/v1/login')
      .send({ username: config.admin.user, password: config.admin.password })
      .expect(200);
  });

  beforeEach(() => {
    queue = new Queue(MOCK_SERVER_HOST, MOCK_SERVER_PORT);
    jobs.map(job => {
      queue.enqueue({ job });
    });
  });

  afterAll(async () => {
    await server.close();
  });

  test('Get all jobs', async () => {
    await session.get('/api/v1/FIXME').expect(200);
    //const res = await session.get('/api/v1/FIXME').expect(200);
    //const fetchedJobs = JSON.parse(res.text);
    //expect(fetchedJobs.jobs).toEqual(jobs);
  });
});
