import Joi from '@hapi/joi';
import { UnprocessableError } from '../../common/errors.js';
import RedisMap from '../utils/redismap.js';

/**
 * The data model for mapping hosts to Zammad auth tokens
 *
 * @class */
export default class HostManager {
  /**
   * @constructor HostManager
   */
  constructor(host, port) {
    this._map = new RedisMap({
      name: 'app:',
      host: host,
      port: port,
    });
  }

  /**
   * Set an auth token corresponding to a host
   *
   * @param {string} host - A specific host string
   * @param {string} token - An auth token
   */
  async set(host, token, audience) {
    if (!this._map.isLoaded) {
      await this._map.load();
    }
    try {
      Joi.assert(host, Joi.string().domain());
      Joi.assert(token, Joi.string());
      Joi.assert(audience, Joi.string());
    } catch (err) {
      throw new UnprocessableError(`Invalid host mapping: `, err);
    }
    this._map.set(host, { token: token, audience: audience });
  }

  /**
   * Return corresponding auth token for a host
   *
   * @param {string} host - A specific host string
   */
  async get({ host: host, start: start = 0, end: end, asc: asc = true }) {
    if (!this._map.isLoaded) {
      await this._map.load();
    }
    if (!host) {
      let tokens = Array.from(this._map);
      if (asc) {
        tokens.sort();
      } else {
        tokens.reverse();
      }

      if (start >= 0 || end) {
        tokens = tokens.slice(start, end);
      }
      const res = new Array();
      tokens.forEach(([key, value]) => {
        const token = value.token || '';
        const audience = value.audience || '';
        res.push({ host: key, token: token, audience: audience });
      });
      return res;
    }
    const value = this._map.get(host);
    if (value) {
      const token = value.token || '';
      const audience = value.audience || '';
      return [{ host: host, token: token, audience: audience }];
    } else {
      return {};
    }
  }

  /**
   * Delete the auth token mapping for the specified host
   *
   * @param {string} host - A specific host string
   */
  async delete(host) {
    if (!this._map.isLoaded) {
      await this._map.load();
    }
    await this._map.delete(host);
  }

  get size() {
    return this._map.size;
  }
}
