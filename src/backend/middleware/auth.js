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

  roles.use('access admin pages', ctx => ctx.state.user[0].role === 1);

  return roles;
};

export default authWrapper;
