import Roles from 'koa-roles';

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
