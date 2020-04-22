//import { Queue } from 'bullmq';
import uuidv4 from 'uuid/v4';
import Joi from '@hapi/joi';
import log4js from 'log4js';
import config from '../config.js';
import { ServerError, UnprocessableError } from '../../common/errors.js';

const log = log4js.getLogger('backend:models:queue');
const DEFAULT_TYPES = [
  'completed',
  'failed',
  'delayed',
  'repeat',
  'active',
  'wait',
  'paused',
];

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class QueueManager {
  /**
   * @constructor QueueManager
   */
  constructor(host, port) {
    this.connection = { host: host, port: port };
    this.queues = new Map();
  }

  async close() {
    this.queues.map(async queue => await queue.disconnect());
  }

  async _addQueue(queueId) {
    try {
      Joi.assert(queueId, Joi.string());
    } catch (err) {
      throw new UnprocessableError(`Invalid queue ID ${queueId}`, err);
    }
    if (!(queueId in this.queues)) {
      console.log('initializing queue');
      //const queue = new Queue(queueId, {
      //  connection: this.connection,
      //});
      //await queue.waitUntilReady();
      console.log('queue initialized');
      this.queues.set(queueId, queue);
    }
  }

  /**
   * Process web request to Queue API
   *
   * @param {string} queueId - Optional identifier for specific queue
   * @param {Object} job - JSON object for processing
   */
  async enqueue({ queueId = config.queue, job }) {
    if (job) {
      if (!(queueId in this.queues)) {
        await this._addQueue(queueId);
      }
      const uuid = uuidv4();
      try {
        const queue = await this.queues.get(queueId);
        await queue.add(uuid, job);
      } catch (err) {
        throw new ServerError(
          `Failed to add job ${uuid} to queue ${queueId}`,
          err,
        );
      }
      return uuid;
    }
    log.error(`No data provided to queue ${queueId}.`);
    return;
  }

  /**
   * Retrieve jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {Array} types - Optional identifier(s) for job statuses
   * @param {integer} start - Index to start from in list of jobs in queue
   * @param {integer} end - Index to stop at for listing jobs in queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async list({
    queueIds = config.queue,
    types = DEFAULT_TYPES,
    start = 0,
    end = -1,
    asc = false,
  }) {
    queueIds = Array.isArray(queueIds) ? queueIds : [queueIds];
    types = Array.isArray(types) ? types : [types];
    try {
      Joi.assert(
        queueIds,
        Joi.array()
          .items(Joi.string())
          .sparse(),
      );
      Joi.assert(
        types,
        Joi.array()
          .items(
            Joi.string().valid(
              'completed',
              'failed',
              'delayed',
              'repeat',
              'active',
              'wait',
              'paused',
            ),
          )
          .sparse(),
      );
      Joi.assert(
        start,
        Joi.number()
          .integer()
          .min(0),
      );
      Joi.assert(end, Joi.number().integer());
      Joi.assert(asc, Joi.bool());
    } catch (err) {
      log.error(err);
      throw err;
      //throw new ServerError('Invalid query parameters', err);
    }

    let ret = new Array();

    for (let id of queueIds) {
      log.debug(`Adding queue ${id}`);
      console.log(`Adding queue ${id}`);
      await this._addQueue(id);
      console.log(`Added queue ${id}`);
    }

    // eslint-disable-next-line no-unused-vars
    for (let [key, value] of this.queues) {
      if (queueIds.includes(key)) {
        console.log(`Found queue ${key}, retrieving job listing.`);
        console.log(`types.isArray: ${Array.isArray(types)}`);
        console.log(
          `types: ${types}, start: ${start}, end: ${end}, asc: ${asc}`,
        );
        for (let type of types) {
          let jobs = await value.getJobs(type, 0, -1, true);
          for (let job of jobs) {
            ret.push({
              queue: key,
              id: job.name,
              title: job.data.title,
              submitter: job.data.submitter_email,
              status: type,
              attemptsMade: job.attemptsMade,
              failedReason: job.failedReason,
            });
          }
        }
      }
    }
    console.log('ret: ', ret);
    if (asc) {
      ret.sort();
    } else {
      ret.reverse();
    }
    if (start >= 0 || end) {
      ret = ret.slice(start, end);
    }
    return ret;
  }

  async count(types = DEFAULT_TYPES) {
    types = Array.isArray(types) ? types : [types];
    let total = 0;
    for (let value of this.queues.values()) {
      console.log('value: ', value);
      const subtotal = await value.getJobCountByTypes.apply(value, types);
      console.log('subtotal: ', subtotal);
      total += subtotal;
    }
    console.log('total: ', total);
    return total;
  }

  /**
   * Retrieve all jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listAll({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, asc: asc });
  }

  /**
   * Retrieve completed jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listCompleted({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'completed', asc: asc });
  }

  /**
   * Retrieve failed jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listFailed({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'failed', asc: asc });
  }

  /**
   * Retrieve delayed jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listDelayed({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'delayed', asc: asc });
  }

  /**
   * Retrieve repeat jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listRepeat({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'repeat', asc: asc });
  }

  /**
   * Retrieve active jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listActive({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'active', asc: asc });
  }

  /**
   * Retrieve wait jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listWait({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'wait', asc: asc });
  }

  /**
   * Retrieve paused jobs from queue(s)
   *
   * @param {Array} queueIds - Optional identifier(s) for specific queue
   * @param {bool} asc - Whether to list jobs in ascending order
   */
  async listPaused({ queueIds = config.queue, asc = false }) {
    return this.list({ queueIds: queueIds, types: 'paused', asc: asc });
  }
}
