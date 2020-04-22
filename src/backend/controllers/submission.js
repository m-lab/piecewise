import Router from '@koa/router';
import log4js from 'koa-log4';
import auth from '../middleware/auth.js';
//import { validate as validateReport } from '../../common/schemas/report.js';

const log = log4js.getLogger('backend:controllers:queue');

/**
 * Initialize the user Queue controller
 *
 * @param {Object} queue - Queue model
 * @returns {Object} Queue controller Koa router
 */
export default function controller(queue, hosts) {
  const router = new Router();

  /**
   * Process web request to Queue API
   *
   * @param {Object} ctx - Koa context object
   */
  async function processRequest(ctx) {
    log.debug('Received request body: ', ctx.request.body);
    // the validator wants an array, I am passing a JSON string of an array so it needs to be parsed serverside
    if (ctx.request.body.medium) {
      try {
        ctx.request.body.medium = JSON.parse(ctx.request.body.medium);
      } catch (err) {
        ctx.throw(422, `Failed to parse request: ${err}`);
      }
    }

    // the validator wants an array, I am passing a JSON string of an array so it needs to be parsed serverside
    if (ctx.request.body.disinfo_links) {
      try {
        ctx.request.body.disinfo_links = JSON.parse(
          ctx.request.body.disinfo_links,
        );
      } catch (err) {
        ctx.throw(422, `Failed to parse request: ${err}`);
      }
    }

    // the validator doesn't recognize an empty string as equivalent to the field not being present
    if ('geography' in ctx.request.body) {
      if (ctx.request.body.geography === '') {
        delete ctx.request.body.geography;
      }
    }

    if (!('article' in ctx.request.body)) {
      ctx.request.body.article = {};
    }

    if (ctx.state.email) {
      ctx.request.body.submitter_email = ctx.state.email;

      if (!ctx.request.body.title) {
        ctx.request.body.title = `Report from ${ctx.state.email}`;
      }
    }

    if (ctx.request.files) {
      const fileKeys = Object.keys(ctx.request.files);
      ctx.request.body.files = [];
      for (const key of fileKeys) {
        ctx.request.body.files.push(ctx.request.files[key]);
      }
    }

    log.debug('Processed request body: ', ctx.request.body);
    try {
      //validateReport(ctx.request.body);
    } catch (err) {
      log.error('Processing error: ', err);
      ctx.throw(422, `Invalid report submitted ${err}`);
    }

    log.debug(`Looking up token for hostname ${ctx.hostname}.`);
    const token = await hosts.get({ host: ctx.hostname });
    if (token && token.length > 0) {
      log.debug(`Found token ${token[0].token} for hostname ${ctx.hostname}.`);
      ctx.request.body.authtoken = token[0].token;
    }
  }

  // unauthenticated

  /**
   * Post a new report
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/reports', async ctx => {
    await processRequest(ctx);
    log.debug('Report submitted: ', ctx.request.body);
    const id = await queue.enqueue({ job: ctx.request.body });
    ctx.response.body = { report_id: id };
    ctx.response.status = 201;
  });

  /**
   * Post a new report to a specific queue
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/queues/:queue/reports', async ctx => {
    await processRequest(ctx);
    const id = await queue.enqueue({
      queueId: ctx.params.queue,
      job: ctx.request.body,
    });
    ctx.response.body = { queue_id: ctx.params.queue, report_id: id };
    ctx.response.status = 201;
  });

  // authenticated

  /**
   * Get all reports in the queue(s)
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/reports', auth, async ctx => {
    log.debug('Getting reports.');
    let types;
    if ('types' in ctx.query) {
      types = ctx.query.types.split(',');
    }
    const jobs = await queue.list({
      types: types,
      start: ctx.query.start,
      end: ctx.query.end,
      asc: ctx.query.asc,
    });
    const total = await queue.count(types);
    ctx.response.body = { jobs: jobs, total: total };
    ctx.response.status = 200;
  });

  /**
   * Get all reports in a specific queue
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/queues/:queue/reports', auth, async ctx => {
    let types;
    if ('types' in ctx.query) {
      types = ctx.query.types.split(',');
    }
    const jobs = await queue.list({
      queueIds: ctx.params.queue,
      types: types,
      start: ctx.query.start,
      end: ctx.query.end,
      asc: ctx.query.asc,
    });
    ctx.response.body = { jobs: jobs };
    ctx.response.status = 200;
  });

  return router;
}
