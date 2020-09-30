import Roles from 'koa-roles';
import { getLogger } from '../log.js';

const log = getLogger('backend:middleware:auth');

/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */

const authWrapper = groups => {
  const roles = new Roles();

  roles.isMemberOf = (group, id) => {
    return groups.isMemberOf(group, id);
  };

  roles.use('access private pages', ctx => ctx.isAuthenticated());

  roles.use('access admin pages', async ctx => {
    log.debug('Checking if user can access admin pages.');
    if (!ctx.isAuthenticated()) return false;

    const isAdmin = await groups.isMemberOf('admins', ctx.state.user.id);
    const isEditor = await groups.isMemberOf('editors', ctx.state.user.id);

    return isAdmin || isEditor;
  });

  return roles;
};

export default authWrapper;
