import Router from '@koa/router';
import _ from 'lodash/core';
import { validateUpdate } from '../../common/schemas/settings.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:setting');

export default function controller(settings, thisUser, mapboxKey) {
  const router = new Router();

  router.get('/settings', async ctx => {
    log.debug(`Retrieving settings.`);
    let setting;
    try {
      setting = await settings.find();
      if (!_.isEmpty(setting)) {
        if (mapboxKey) {
          setting.mapboxKey = mapboxKey;
        }
        if (Buffer.isBuffer(setting.logo)) {
          setting.logo = setting.logo.toString();
        }
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

  router.put('/settings', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Updating settings.`);
    let setting;
    try {
      const data = await validateUpdate(ctx.request.body.data);
      setting = await settings.update(data[0]);
      if (setting) {
        ctx.response.status = 204;
      } else {
        log.error('HTTP 400 Error.');
        ctx.throw(400, 'Failed to update settings.');
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
