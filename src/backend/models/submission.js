import knex from 'knex';
import { BadRequestError } from '../../common/errors.js';

export default class SubManager {
  constructor(db) {
    this._db = db;
  }

  async create(submission) {
    return this._db
      .table('submissions')
      .insert(submission)
      .returning('*');
  }

  async update(id, submission) {
    try {
      let existing = false;
      await this._db.transaction(async trx => {
        existing = await trx('submissions')
          .select('*')
          .where({ id: parseInt(id) });

        if (Array.isArray(existing) && existing.length > 0) {
          await trx('submissions')
            .update(submission)
            .where({ id: parseInt(id) });
          existing = true;
        } else {
          await trx('submissions').insert({ ...submission, id: id });
          existing = false;
        }
      });
      return existing;
    } catch (err) {
      throw new BadRequestError(
        `Failed to update submission with ID ${id}: `,
        err,
      );
    }
  }

  async delete(id) {
    return this._db
      .table('submissions')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
    form: form,
  }) {
    const rows = await this._db
      .table('submissions')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (form) {
          queryBuilder.join(
            'form_submissions',
            'form_submissions.fid',
            knex.raw('?', [form]),
          );
        }

        if (asc) {
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          queryBuilder.orderBy(sort_by, 'desc');
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
    return this._db
      .table('submissions')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('submissions').select('*');
  }
}
