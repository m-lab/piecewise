import Router from '@koa/router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:submission');

export default function controller(submissions) {
  const router = new Router();

  router.post('/submissions', async ctx => {
    log.debug('Adding new submission.');
    let submission;
    try {
      submission = await submissions.create(ctx.request.body);
    } catch (err) {
      ctx.throw(400, `Failed to parse submission schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: submission };
    ctx.response.status = 201;
  });

  router.get('/submissions/:id', async ctx => {
    log.debug(`Retrieving submission ${ctx.params.id}.`);
    let submission;
    try {
      submission = submissions.getById(ctx.params.id);
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
}
