#!/usr/bin/env node
import figlet from 'figlet';
import { createServer } from 'http';
import config from './config.js';
import configServer from './server.js';

/**
 * Function to start up the app.
 */
async function bootstrap() {
  /**
   * Add external services init as async operations (db, redis, etc...)
   * e.g.
   * await sequelize.authenticate()
   */
  config.parse(process.argv);
  return createServer(configServer(config)).listen(config.port);
}

bootstrap()
  .then(async server => {
    figlet.text(
      process.env.npm_package_name,
      {
        font: 'Sub-Zero',
      },
      function(err, bigName) {
        if (err) {
          console.error('Something went wrong...');
          console.error(err);
          return;
        }
        console.log(`
${bigName}
🚀 Server listening on port ${server.address().port}!`);
        return;
      },
    );
    return;
  })
  .catch(err => {
    setImmediate(() => {
      console.error('Encountered error while running the app: ', err);
    });
  });
