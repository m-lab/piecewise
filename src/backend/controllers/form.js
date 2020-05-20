import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

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

export default function controller(forms) {
  const router = new Router();

  router.post('/forms', async ctx => {
    log.debug('Adding new form.');
    log.debug('ctx.request.body: ', ctx.request.body);
    let form;
    try {
      form = await forms.create(ctx.request.body);

      // workaround for sqlite
      if (Number.isInteger(form)) {
        form = await forms.findById(form);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse form schema: ${err}`);
    }
    ctx.response.body = { status: 'success', data: form };
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
      res = await forms.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        from: from,
        to: to,
      });
      ctx.response.body = {
        status: 'success',
        data: res,
        total: res.length,
      };
      ctx.response.status = 200;
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/forms/:id', async ctx => {
    log.debug(`Retrieving form ${ctx.params.id}.`);
    let form;
    try {
      form = forms.findById(ctx.params.id);
      if (form.length) {
        ctx.response.body = { status: 'success', data: form };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That form with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.put('/forms/:id', async ctx => {
    log.debug(`Updating form ${ctx.params.id}.`);
    let form;
    try {
      form = await forms.update(ctx.params.id, ctx.request.body);
      if (form.length) {
        ctx.response.body = { status: 'success', data: form };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That form with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.delete('/forms/:id', async ctx => {
    log.debug(`Deleting form ${ctx.params.id}.`);
    let form;
    try {
      form = forms.delete(ctx.params.id);
      if (form.length) {
        ctx.response.body = { status: 'success', data: form };
        ctx.response.status = 200;
      } else {
        ctx.response.body = {
          status: 'error',
          message: `That form with ID ${ctx.params.id} does not exist.`,
        };
        ctx.response.status = 404;
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  return router;
}
