import log4js from 'koa-log4';
import config from './config.js';

export function getLogger(namespace) {
  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.logLevel },
    },
  });
  return log4js.getLogger(namespace);
}
