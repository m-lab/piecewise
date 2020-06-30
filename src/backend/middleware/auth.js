import Roles from 'koa-roles';
import { getLogger } from '../log.js';

// const log = getLogger('backend:middleware:auth');

/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const authWrapper = () => {
  const roles = new Roles();

  roles.use('access private pages', ctx => ctx.isAuthenticated());

  return roles;
};

export default authWrapper;
