import Router from '@koa/router';
import log4js from 'koa-log4';
import auth from '../middleware/auth.js';

const log = log4js.getLogger('backend:controllers:host');

/**
 * Initialize the user Host -> Token mapping controller
 *
 * @param {Object} map - Host model
 * @returns {Object} Queue controller Koa router
 */
export default function controller(map) {
  const router = new Router();

  // authenticated

  /**
   * Post a new or updated host -> token mapping
   *
   * @param {Object} ctx - Koa context object
   */
  router.put('/hosts/:host', auth, async ctx => {
    const { token, audience } = ctx.request.body;
    const res = await map.set(
      ctx.params.host.trim(),
      token.trim(),
      audience.trim(),
    );
    ctx.response.body = { res };
    ctx.response.status = 201;
  });

  /**
   * Post a new host -> token mapping
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/hosts', auth, async ctx => {
    const { host, token, audience } = ctx.request.body;
    const res = await map.set(host.trim(), token.trim(), audience.trim());
    ctx.response.body = { res };
    ctx.response.status = 201;
  });

  /**
   * Delete a host -> token mapping
   *
   * @param {Object} ctx - Koa context object
   */
  router.del('/hosts/:host', auth, async ctx => {
    const res = await map.delete(ctx.params.host);
    ctx.response.body = { res };
    ctx.response.status = 201;
  });

  /**
   * Get tokens mapped to host
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/hosts', auth, async ctx => {
    log.debug('Getting hosts.');
    const data = await map.get({
      host: ctx.query.host,
      start: ctx.query.start,
      end: ctx.query.end,
      asc: ctx.query.asc,
    });
    ctx.response.body = { data: data, total: map.size };
    ctx.response.status = 200;
  });

  return router;
}
