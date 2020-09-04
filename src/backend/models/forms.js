import { UnprocessableError } from '../../common/errors.js';
import { isString } from '../../common/utils.js';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:form');

export default class FormManager {
  constructor(db) {
    this._db = db;
  }

  async create(form) {
    form = form.map(f => ({ ...f, fields: JSON.stringify(f.fields) }));
    return this._db
      .table('forms')
      .insert(form)
      .returning('*');
  }

  async update(id, form) {
    try {
      let existing = false;
      await this._db.transaction(async trx => {
        existing = await trx('forms')
          .select('*')
          .where({ id: parseInt(id) });

        form = { fields: JSON.stringify(form.fields) };
        if (Array.isArray(existing) && existing.length > 0) {
          await trx('forms')
            .update(form)
            .where({ id: parseInt(id) });
          existing = true;
        } else {
          await trx('forms').insert({ ...form, id: id });
          existing = false;
        }
      });
      return existing;
    } catch (err) {
      throw new UnprocessableError(
        `Failed to update form with ID ${id}: `,
        err,
      );
    }
  }

  async delete(id) {
    return this._db
      .table('forms')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    from: from,
    to: to,
  }) {
    let rows = [];
    rows = await this._db
      .table('forms')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (asc) {
          queryBuilder.orderBy('id', 'asc');
        } else {
          queryBuilder.orderBy('id', 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }
      });

    log.debug('Rows: ', rows);
    return rows.map(r => ({
      ...r,
      fields: isString(r.fields) ? JSON.parse(r.fields) : r.fields,
    }));
  }

  async findById(id) {
    let form;
    if (id === 'latest') {
      form = await this._db
        .table('forms')
        .select('*')
        .orderBy('id', 'desc')
        .first();
    } else {
      form = await this._db
        .table('forms')
        .select('*')
        .where({ id: parseInt(id) })
        .first();
    }
    log.debug('Form: ', form);
    return {
      ...form,
      fields: isString(form.fields) ? JSON.parse(form.fields) : form.fields,
    };
  }

  async findAll() {
    return this._db.table('forms').select('*');
  }
}
