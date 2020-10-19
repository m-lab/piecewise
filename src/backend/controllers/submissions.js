import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import fetch from 'node-fetch';
import Papa from 'papaparse';
import { BadRequestError } from '../../common/errors.js';
import {
  validateCreation,
  validateUpdate,
} from '../../common/schemas/submissions.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:submission');

const query_schema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  from: Joi.string(),
  to: Joi.string(),
  format: Joi.string(),
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

export default function controller(submissions, thisUser) {
  const router = new Router();

  router.post('/submissions', async ctx => {
    log.debug('Adding new submission.');
    let submission, fid;

    if (ctx.params.fid) {
      fid = ctx.params.fid;
    }

    try {
      const data = await validateCreation(ctx.request.body.data);
      submission = await submissions.create(data, fid);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse submission schema: ${err}`);
    }
    ctx.response.body = {
      statusCode: 201,
      status: 'created',
      data: submission,
    };
    ctx.response.status = 201;
  });

  router.get(
    '/submissions',
    thisUser.can('access private pages'),
    async ctx => {
      log.debug(`Retrieving submissions.`);
      let res;
      try {
        const query = await validate_query(ctx.query);
        let from, to;
        if (query.from) {
          const timestamp = moment(query.from);
          if (timestamp.isValid()) {
            ctx.throw(400, 'Invalid timestamp value.');
          }
          from = timestamp.toISOString();
        }
        if (query.to) {
          const timestamp = moment(query.to);
          if (timestamp.isValid()) {
            ctx.throw(400, 'Invalid timestamp value.');
          }
          to = timestamp.toISOString();
        }
        res = await submissions.find({
          start: query.start,
          end: query.end,
          asc: query.asc,
          from: from,
          to: to,
        });

        if (query.format === 'csv') {
          const flat = res.map(row => {
            const survey = {};
            row.fields.forEach(field => {
              const key =
                'field_' +
                field.label
                  .trim()
                  .replace(/\s+/g, '_')
                  .replace(/\W/g, '')
                  .toLowerCase();
              return (survey[key] = field.value);
            });
            return {
              id: row.id,
              date: row.date,
              c2sRate: row.c2sRate,
              s2cRate: row.s2cRate,
              MinRTT: row.MinRTT,
              latitude: row.latitude,
              longitude: row.longitude,
              form_id: row.form_id,
              ...survey,
            };
          });
          const csv = Papa.unparse(flat);
          ctx.set('Content-disposition', `attachment; filename=piecewise.csv`);
          ctx.body = csv;
        } else {
          ctx.response.body = {
            statusCode: 200,
            status: 'ok',
            data: res,
          };
        }
        ctx.response.status = 200;
      } catch (err) {
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  );

  router.get(
    '/submissions/:id',
    thisUser.can('access private pages'),
    async ctx => {
      log.debug(`Retrieving submission ${ctx.params.id}.`);
      let submission;
      try {
        submission = await submissions.findById(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (submission && submission.fields) {
        ctx.response.body = {
          statusCode: 200,
          status: 'ok',
          data: Array.isArray(submission) ? submission : [submission],
        };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That submission with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That submission with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  router.put(
    '/submissions/:id',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Updating submission ${ctx.params.id}.`);
      let updated;
      try {
        const data = await validateUpdate(ctx.request.body.data);
        updated = await submissions.update(ctx.params.id, data[0]);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (updated) {
        ctx.response.status = 204;
      } else {
        ctx.response.body = {
          statusCode: 201,
          status: 'created',
          data: { id: ctx.params.id },
        };
        ctx.response.status = 201;
      }
    },
  );

  router.delete(
    '/submissions/:id',
    thisUser.can('access admin pages'),
    async ctx => {
      log.debug(`Deleting submission ${ctx.params.id}.`);
      let submission;

      try {
        submission = await submissions.delete(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (submission > 0) {
        ctx.response.status = 204;
      } else {
        log.error(
          `HTTP 404 Error: That submission with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That submission with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  );

  router.get('/mlabns', async ctx => {
    log.debug(`Proxying mlabns request (for testing purposes).`);
    const mlabNsUrl = 'https://mlab-ns.appspot.com/ndt_ssl?format=json';
    try {
      const res = await fetch(mlabNsUrl);
      log.debug('mlabns response: ', res);
      log.debug('mlabns response status: ', res.status);

      if (res.status === 200) {
        const json = await res.json();
        ctx.response.body = json;
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `M-Lab NS lookup failed with status ${res.status}: ${
            res.statusText
          }`,
        };
        ctx.response.status = 502;
      }
    } catch (err) {
      ctx.throw(500, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
