//import Redis from 'ioredis';
import log4js from 'log4js';
import { isString, jsonThing } from '../../common/utils.js';

const log = log4js.getLogger('backend:utils:redismap');

export default class RedisMap extends Map {
  constructor({ name, readthrough = false, host = '127.0.0.1', port = 6379 }) {
    super();
    this._readthrough = readthrough;
    this._keyPrefix = name;
    //   this._redis = new Redis({
    //     keyPrefix: this._keyPrefix,
    //     port: port,
    //     host: host,
    //   });
    //this._redis.Promise = global.Promise;
    this.isLoaded = false;
  }

  async load() {
    //const hash = await this._redis.hgetall('hosts');
    //Object.entries(hash).forEach(([key, value]) => {
    //  let val;
    //  try {
    //    val = JSON.parse(value);
    //  } catch (err) {
    //    log.debug('Could not parse value to object: ', value);
    //    if (isString(value)) {
    //      log.debug('Value is already a string: ', value);
    //      val = value;
    //    } else {
    //      throw new Error('Failed to load value from Redis.');
    //    }
    //  }
    //  log.debug('val: ', val);
    //  this.set(key, val);
    //});

    //log.debug('Loading Map from redis: ', hash);
    this.isLoaded = true;
    return;
  }

  set(key, value) {
    const s = jsonThing(value);
    log.debug('jsonThing(value): ', s);
    //  this._redis.hset('hosts', key, s);
    super.set(key, value);
  }

  delete(key) {
    //  this._redis.hdel('hosts', key);
    super.delete(key);
  }
}
