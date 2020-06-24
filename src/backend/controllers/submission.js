import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import fetch from 'node-fetch';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const log = getLogger('backend:controllers:submission');

const query_schema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  from: Joi.string(),
  to: Joi.string(),
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

export default function controller(submissions) {
  const router = new Router();

  router.post('/submissions', async ctx => {
    log.debug('Adding new submission.');
    let submission;
    try {
      submission = await submissions.create(ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(submission)) {
        submission = await submissions.findById(submission);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse submission schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: submission };
    ctx.response.status = 201;
  });

  router.get('/submissions', async ctx => {
    log.debug(`Retrieving submissions.`);
    let res;
    try {
      const query = await validate_query(ctx.query);
      let from, to;
      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          ctx.throw(400, 'Invalid timestamp value.');
        }
        to = timestamp.toISOString();
      }
      res = await submissions.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        from: from,
        to: to,
      });
      ctx.response.body = {
        status: 'success',
        data: res,
        total: res.length,
      };
      ctx.response.status = 200;
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/submissions/:id', async ctx => {
    log.debug(`Retrieving submission ${ctx.params.id}.`);
    let submission;
    try {
      submission = submissions.findById(ctx.params.id);
      if (submission.length) {
        ctx.response.body = { status: 'success', data: submission };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That submission with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/submissions/:id', async ctx => {
    log.debug(`Updating submission ${ctx.params.id}.`);
    let submission;
    try {
      submission = await submissions.update(ctx.params.id, ctx.request.body);
      if (submission.length) {
        ctx.response.body = { status: 'success', data: submission };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That submission with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/submissions/:id', async ctx => {
    log.debug(`Deleting submission ${ctx.params.id}.`);
    let submission;
    try {
      submission = submissions.delete(ctx.params.id);
      if (submission.length) {
        ctx.response.body = { status: 'success', data: submission };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That submission with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/mlabns', async ctx => {
    log.debug(`Proxying mlabns request (for testing purposes).`);
    const mlabNsUrl = 'https://mlab-ns.appspot.com/ndt_ssl?format=json';
    try {
      const res = await fetch(mlabNsUrl);
      log.debug('mlabns response: ', res);
      log.debug('mlabns response status: ', res.status);

      if (res.status === 200) {
        const json = await res.json();
        ctx.response.body = json;
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `M-Lab NS lookup failed with status ${res.status}: ${
            res.statusText
          }`,
        };
        ctx.response.status = 502;
      }
    } catch (err) {
      ctx.throw(500, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
