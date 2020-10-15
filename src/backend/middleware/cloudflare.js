import jwt from 'koa-jwt';
import jwks from 'jwks-rsa';
import config from '../config.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:cloudflare');

function newJwt({ audience = config.cfaccessAudience }) {
  // initialize the jwt middleware using CF specific params
  return jwt({
    audience,
    issuer: config.cfaccessUrl,
    cookie: 'CF_Authorization',
    algorithms: ['RS256'],
    debug: true,
    secret: jwks.koaJwtSecret({
      jwksUri: `${config.cfaccessUrl}/cdn-cgi/access/certs`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 36000000, // 10 hours
    }),
  });
}

/**
 * Installs the cloudflare access JWT middleware into the koa app.
 *
 * @param {string} url - Cloudflare URL
 * @param {string} audience - Cloudflare audience string
 */
const cfAccessWrapper = async hosts => {
  let audiences;
  if (hosts) {
    audiences = await hosts.get({});
  }
  const middlewares = new Map();
  // At least make sure we have the default
  middlewares.set(config.cfaccessUrl, newJwt({}));
  if (Array.isArray(audiences) && audiences.length > 0) {
    audiences.forEach(({ host, audience }) => {
      if (host && audience) {
        let preloadJwt = newJwt({ audience: audience });
        middlewares.set(host, preloadJwt);
      }
    });
  }

  return async (ctx, next) => {
    const { host: requestHost } = ctx.request.header;
    log.debug('requestHost: ', requestHost);
    let middleware = middlewares.get(requestHost);
    if (!middleware) {
      // Check if our hosts table has been updated since init
      audiences = await hosts.get({});
      for (let { host, audience } of audiences) {
        if (requestHost.startsWith(host)) {
          middleware = newJwt({ audience: audience });
          middlewares.set(host, middleware);
          break;
        }
      }
    }

    if (config.isDev || config.isTest) {
      const skipJwt =
        requestHost.startsWith('localhost') ||
        requestHost.startsWith('127.0.0.1');
      if (skipJwt) {
        log.warn('SKIPPING JWT VERIFICATION in dev mode', {
          host: requestHost,
        });
        return next();
      }
    }

    if (!middleware) {
      ctx.throw(404, 'Unrecognized host.');
    }
    log.debug('cfAccess middleware found: ', middleware);
    return middleware(ctx, next);
  };
};
export default cfAccessWrapper;
