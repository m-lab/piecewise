/**
 * Installs authorization middleware into the koa app.
 *
 * @param {Object} ctx - the koa context object
 * @param {funtion} next - continue to next middleware
 */
const auth = async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.throw(401, 'Authentication failed.');
  }
};

export default auth;
