import Router from '@koa/router';
import { getLogger } from '../log.js';
import _ from 'lodash/core';

const log = getLogger('backend:controllers:setting');

export default function controller(settings) {
  const router = new Router();

  router.get('/settings', async ctx => {
    log.debug(`Retrieving settings.`);
    let setting;
    try {
      setting = await settings.find();
      if (!_.isEmpty(setting)) {
        ctx.response.body = { status: 'success', data: setting };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: 'No settings found.',
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/settings', async ctx => {
    log.debug(`Updating settings.`);
    let setting;
    try {
      setting = await settings.update(ctx.request.body);
      if (!isNaN(setting)) {
        ctx.response.body = { status: 'success', data: setting };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `Unable to update setting.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
