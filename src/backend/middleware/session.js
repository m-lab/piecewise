import { v4 as uuidv4 } from 'uuid';
import session from 'koa-session';
import { ServerError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:session');

const sessionWrapper = async (server, db) => {
  let middleware;
  try {
    if (!server.keys) {
      const keys = await db.table('session_keys').select('key');

      if (Array.isArray(keys) && keys.length > 0) {
        log.info('Loading session keys.');
        server.keys = keys.map(item => item.key);
      } else {
        log.info('Generating new session keys.');
        const newKeys = Array(2)
          .fill()
          .map(() => ({ key: uuidv4() }));
        server.keys = newKeys.map(item => item.key);
        await db.table('session_keys').insert(newKeys);
      }
    }

    middleware = session(server);
  } catch (err) {
    log.error('Error loading session keys: ', err);
    throw new ServerError('Error loading session keys: ', err);
  }
  return async (ctx, next) => {
    if (!middleware) {
      ctx.throw(500, 'Session middleware not defined.');
    }
    return middleware(ctx, next);
  };
};

export default sessionWrapper;
