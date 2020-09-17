import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import {
  validateCreation,
  validateUpdate,
} from '../../common/schemas/forms.js';
import { BadRequestError } from '../../common/errors.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:form');

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
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

export default function controller(forms, thisUser) {
  const router = new Router();

  router.post('/forms', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new form.');
    let form;
    try {
      const data = await validateCreation(ctx.request.body.data);
      form = await forms.create(data);

      // workaround for sqlite
      if (Number.isInteger(form[0])) {
        form = await forms.findById(form);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse form schema: ${err}`);
    }
    ctx.response.body = {
      statusCode: 201,
      status: 'created',
      data: Array.isArray(form) ? form : [form],
    };
    ctx.response.status = 201;
  });

  router.get('/forms', async ctx => {
    log.debug(`Retrieving forms.`);
    let res;
    try {
      const query = await validate_query(ctx.query);
      let from, to;
      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        to = timestamp.toISOString();
      }
      res = await forms.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        from: from,
        to: to,
      });
      ctx.response.body = {
        statusCode: 200,
        status: 'ok',
        data: res,
      };
      ctx.response.status = 200;
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/forms/:id', async ctx => {
    log.debug(`Retrieving form ${ctx.params.id}.`);
    let form;
    try {
      form = await forms.findById(ctx.params.id);
      if (form && form.fields) {
        ctx.response.body = {
          statusCode: 200,
          status: 'ok',
          data: Array.isArray(form) ? form : [form],
        };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That form with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/forms/:id', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Updating form ${ctx.params.id}.`);
    let updated;

    try {
      const data = await validateUpdate(ctx.request.body.data);
      updated = await forms.update(ctx.params.id, data[0]);
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
  });

  router.delete('/forms/:id', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Deleting form ${ctx.params.id}.`);
    let form;

    try {
      form = await forms.delete(ctx.params.id);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (form > 0) {
      ctx.response.status = 204;
    } else {
      log.error(
        `HTTP 404 Error: That form with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That form with ID ${ctx.params.id} does not exist.`);
    }
  });

  return router;
}
