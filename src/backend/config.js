import { Command } from 'commander';
import Joi from '@hapi/joi';
import dotenv from 'dotenv';

/**
 * Optionally load environment from a .env file.
 */

dotenv.config();

const defaults = {
  loglevel: process.env.CUNEI_LOG_LEVEL || 'error',
  secrets: process.env.CUNEI_SECRETS,
  admin: {
    user: process.env.CUNEI_ADMIN_USERNAME || 'admin',
    password: process.env.CUNEI_ADMIN_PASSWORD,
  },
  cfaccess: {
    audience: process.env.CUNEI_CFACCESS_AUDIENCE,
    url: process.env.CUNEI_CFACCESS_URL,
  },
  redis: {
    host: process.env.CUNEI_REDIS_HOST || 'localhost',
    port: process.env.CUNEI_REDIS_PORT || '6379',
  },
  server: {
    port: process.env.CUNEI_PORT || '3000',
  },
  worker: {
    queue: process.env.CUNEI_WORKER_QUEUE || '0',
  },
};

function validateUser(value, previous) {
  const user = value ? value : previous;
  Joi.assert(
    user,
    Joi.string()
      .alphanum()
      .min(3)
      .max(32)
      .required(),
  );
  return user;
}

function validatePassword(value, previous) {
  const password = value ? value : previous;
  Joi.assert(
    password,
    Joi.string()
      .alphanum()
      .min(10)
      .max(64)
      .required(),
  );
  return password;
}

function validateUrl(value, previous) {
  const url = value ? value : previous;
  Joi.assert(url, Joi.string().uri());
  return url;
}

function validateToken(value, previous) {
  const token = value ? value : previous;
  Joi.assert(token, Joi.string());
  return token;
}

function validateLoglevel(value, previous) {
  const level = value ? value : previous;
  Joi.assert(
    level,
    Joi.string()
      .allow('trace', 'debug', 'info', 'warn', 'error', 'fatal')
      .required(),
  );
  return level;
}

function validateHost(value, previous) {
  const host = value ? value : previous;
  Joi.assert(host, Joi.string().required());
  return host;
}

function validatePort(value, previous) {
  const port = value ? parseInt(value) : parseInt(previous);
  Joi.assert(
    port,
    Joi.number()
      .port()
      .required(),
  );
  return port;
}

function validateArray(value, previous) {
  const strings = value ? value : previous;
  const array = strings.split(',');
  Joi.assert(
    array,
    Joi.array()
      .items(Joi.string())
      .required(),
  );
  return strings;
}

function validateQueueId(value, previous) {
  const id = value ? value : previous;
  Joi.assert(Joi.string().required());
  return id;
}

class Config extends Command {
  constructor(args) {
    super(args);
    const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
    Joi.string()
      .allow('development', 'production', 'test')
      .required()
      .validate(env);
    this.isDev = env === 'development';
    this.isTest = env === 'test';
    this.isProd = env === 'production';
  }

  parse(args) {
    super.parse(args);
    if (!this.cfaccess_url != !this.cfaccess_audience) {
      throw new Error(
        'If using Cloudflare Access both the URL and the Audience must be specified.',
      );
    }
  }
}

const program = new Config();

export default program
  .description(process.env.npm_package_description)
  .version(process.env.npm_package_version)
  .option(
    '--username <username>',
    'Admin username',
    validateUser,
    defaults.admin.user,
  )
  .option(
    '--password <password>',
    'Admin password',
    validatePassword,
    defaults.admin.password,
  )
  .option(
    '-p, --port <number>',
    'Port for Cunei to listen on',
    validatePort,
    defaults.server.port,
  )
  .option(
    '-l, --log_level <level>',
    'Logging verbosity',
    validateLoglevel,
    defaults.loglevel,
  )
  .option('--no-proxy', 'Disable support for proxy headers')
  .option(
    '-s, --secrets <string>',
    'Session secret(s)',
    validateArray,
    defaults.secrets,
  )
  .option(
    '-q, --queue <name>',
    'Default worker queue ID',
    validateQueueId,
    defaults.worker.queue,
  )
  .option(
    '--redis_host <host>',
    'Redis host',
    validateHost,
    defaults.redis.host,
  )
  .option(
    '--redis_port <port>',
    'Redis port',
    validatePort,
    defaults.redis.port,
  )
  .option(
    '--cfaccess_url <url>',
    'Cloudflare Access URL',
    validateUrl,
    defaults.cfaccess.url,
  )
  .option(
    '--cfaccess_audience <token>',
    'Cloudflare Access Audience',
    validateToken,
    defaults.cfaccess.audience,
  );
