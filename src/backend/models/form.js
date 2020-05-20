import { validate } from '../../common/schemas/form.js';
import { UnprocessableError } from '../../common/errors.js';

export default class FormManager {
  constructor(db) {
    this._db = db;
  }

  async create(form) {
    try {
      await validate(form);
    } catch (err) {
      throw new UnprocessableError('Failed to create form: ', err);
    }
    console.log('form: ', form);
    return this._db
      .table('forms')
      .insert({ data: form })
      .returning('*');
  }

  async update(id, form) {
    try {
      await validate(form);
    } catch (err) {
      throw new UnprocessableError('Failed to update form: ', err);
    }
    return this._db
      .table('forms')
      .update(form)
      .where({ id: parseInt(id) })
      .returning('*');
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
    const rows = await this._db
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

    return rows || [];
  }

  async findById(id) {
    if (id === 'latest') {
      return this._db
        .table('forms')
        .select('*')
        .orderBy('id', 'desc')
        .first();
    } else {
      return this._db
        .table('forms')
        .select('*')
        .where({ id: parseInt(id) })
        .first();
    }
  }

  async findAll() {
    return this._db.table('forms').select('*');
  }
}
